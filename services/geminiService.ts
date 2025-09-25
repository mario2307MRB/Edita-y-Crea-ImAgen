
// Helper to handle API responses robustly
const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        // Handle common Vercel errors that might not return JSON
        if (response.status === 504) {
            throw new Error(`El servidor ha tardado demasiado en responder (Gateway Timeout). Esto puede ocurrir con peticiones complejas. Por favor, intenta de nuevo.`);
        }
        if (response.status === 413) {
            throw new Error(`La imagen es demasiado grande. Por favor, sube una imagen más pequeña. (Payload Too Large)`);
        }

        // Try to parse error from JSON body, otherwise provide a generic error
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ocurrió un error desconocido en el servidor.');
        } catch (e) {
            throw new Error(`Error de servidor: ${response.status}. No se pudo procesar la respuesta.`);
        }
    }
    return response.json();
};

// Helper to convert File to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          // result is "data:image/jpeg;base64,LzlqLzRBQ...". We only want the part after the comma.
          if (typeof reader.result === 'string') {
              resolve(reader.result.split(',')[1]);
          } else {
              reject(new Error("Failed to read file as data URL"));
          }
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  export const generateImage = async (imageFile: File, prompt: string) => {
      const base64Data = await fileToBase64(imageFile);
      const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              action: 'generateImage',
              image: { data: base64Data, mimeType: imageFile.type },
              prompt,
          }),
      });
      const result = await handleApiResponse(response);
      return result.data;
  };
  
  export const createImageFromText = async (prompt: string, style: string, aspectRatio: string) => {
      const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'createImage', prompt, style, aspectRatio }),
      });
      const result = await handleApiResponse(response);
      return result.data;
  };
  
  export const summarizeChanges = async (prompt: string, style: string): Promise<string> => {
      const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'summarize', prompt, style }),
      });
      const result = await handleApiResponse(response);
      return result.data;
  };
