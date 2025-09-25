
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper to convert File to a Gemini Part
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// Generates the modified image
export const generateImage = async (imageFile: File, prompt: string) => {
  const imagePart = await fileToGenerativePart(imageFile);

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
    
    if (candidate?.finishReason === 'SAFETY') {
      console.error('Request blocked due to safety reasons:', candidate.safetyRatings);
      throw new Error(`La solicitud fue bloqueada por motivos de seguridad. Por favor, ajusta la descripción o la imagen.`);
    }

    const textOutput = candidate?.content?.parts?.find(part => part.text)?.text;
    if (textOutput) {
        console.error('API returned text instead of an image:', textOutput);
        throw new Error(`La IA respondió con un mensaje en lugar de una imagen: "${textOutput}". Intenta simplificar tu petición.`);
    }

    console.error("Failed to generate image. Full API response:", JSON.stringify(response, null, 2));
    throw new Error("No se pudo generar la imagen. La API no devolvió una imagen válida.");
  }
  
  return imageOutput.inlineData;
};

// Generates an image from a text prompt
export const createImageFromText = async (prompt: string, style: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4') => {
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
    console.error("Failed to create image. Full API response:", JSON.stringify(response, null, 2));
    throw new Error("No se pudo crear la imagen. La API no devolvió una imagen válida, intenta ser más descriptivo.");
  }
  
  return {
    data: generatedImage.image.imageBytes,
    mimeType: 'image/png'
  };
};

// Generates a summary of the changes
export const summarizeChanges = async (prompt: string, style: string): Promise<string> => {
    const summaryPrompt = `Basado en la siguiente solicitud de edición de imagen: "${prompt}" con un estilo "${style}", resume los cambios que se aplicarían en una frase breve y descriptiva. Ejemplo: "Se mejoró la iluminación, se cambió el fondo a blanco y se aplicó un estilo profesional."`;
  
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: summaryPrompt
    });
  
    return response.text;
  };
