import { GoogleGenAI } from "@google/genai";
import { stripBase64Prefix, getMimeTypeFromBase64 } from '../utils';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using the 'nano banana' model as requested for image tasks
const MODEL_NAME = 'gemini-2.5-flash-image';

interface GenerateParams {
  prompt: string;
  currentImage?: string; // Full Data URL
  referenceImage?: string; // Full Data URL
}

interface GenerateResult {
  text?: string;
  image?: string; // Full Data URL
}

export const generateContent = async ({
  prompt,
  currentImage,
  referenceImage
}: GenerateParams): Promise<GenerateResult> => {
  try {
    const parts: any[] = [];

    // 1. Add current main image if it exists (Context for editing)
    if (currentImage) {
      parts.push({
        inlineData: {
          mimeType: getMimeTypeFromBase64(currentImage),
          data: stripBase64Prefix(currentImage),
        },
      });
    }

    // 2. Add reference image if provided (Style/Structure reference)
    if (referenceImage) {
      parts.push({
        inlineData: {
          mimeType: getMimeTypeFromBase64(referenceImage),
          data: stripBase64Prefix(referenceImage),
        },
      });
    }

    // 3. Add text prompt
    parts.push({
      text: prompt,
    });

    // 4. Call API
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
    });

    const result: GenerateResult = {};

    // 5. Parse response
    // The model might return a text description, an image, or both.
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          result.image = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          result.text = part.text;
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
