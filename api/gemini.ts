
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Vercel specific config to increase timeout to 60s
export const maxDuration = 60;

// This is a Vercel serverless function, so we can use environment variables securely
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This error will be logged in Vercel, not exposed to the client
  throw new Error("API_KEY environment variable not set in Vercel config");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// This function will be exported and exposed as an API endpoint.
// In Vercel, a file in the /api directory becomes an API route.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action, ...payload } = req.body;

    switch (action) {
      case 'generateImage': {
        const { image, prompt } = payload;
        const imagePart = {
            inlineData: { data: image.data, mimeType: image.mimeType },
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: {
            parts: [
              imagePart,
              { text: prompt },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        });
        
        const imageOutput = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
      
        if (!imageOutput || !imageOutput.inlineData) {
            const candidate = response.candidates?.[0];
            let errorMessage = "No se pudo generar la imagen. La API no devolvió una imagen válida.";
            if (candidate?.finishReason === 'SAFETY') {
                errorMessage = `La solicitud fue bloqueada por motivos de seguridad. Por favor, ajusta la descripción o la imagen.`;
            } else {
                const textOutput = candidate?.content?.parts?.find(part => part.text)?.text;
                if (textOutput) {
                    errorMessage = `La IA respondió con un mensaje en lugar de una imagen: "${textOutput}". Intenta simplificar tu petición.`;
                }
            }
            return res.status(500).json({ error: errorMessage });
        }
        
        return res.status(200).json({ data: imageOutput.inlineData });
      }

      case 'createImage': {
        const { prompt, style, aspectRatio } = payload;
        const fullPrompt = `Crea una imagen basada en la siguiente descripción: "${prompt}". El estilo debe ser ${style}.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
            },
        });

        const generatedImage = response.generatedImages?.[0];

        if (!generatedImage || !generatedImage.image.imageBytes) {
            return res.status(500).json({ error: "No se pudo crear la imagen. La API no devolvió una imagen válida, intenta ser más descriptivo." });
        }
        
        const data = {
            data: generatedImage.image.imageBytes,
            mimeType: 'image/png'
        };
        return res.status(200).json({ data });
      }
      
      case 'summarize': {
        const { prompt, style } = payload;
        const summaryPrompt = `Basado en la siguiente solicitud de edición de imagen: "${prompt}" con un estilo "${style}", resume los cambios que se aplicarían en una frase breve y descriptiva. Ejemplo: "Se mejoró la iluminación, se cambió el fondo a blanco y se aplicó un estilo profesional."`;
  
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: summaryPrompt
        });
      
        return res.status(200).json({ data: response.text });
      }

      default:
        return res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return res.status(500).json({ error: errorMessage });
  }
}
