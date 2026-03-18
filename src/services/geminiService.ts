import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GeneratedScene {
  id: string;
  url: string;
  prompt: string;
}

export async function generateHomeScenes(
  base64Image: string,
  mimeType: string,
  userPrompt: string
): Promise<GeneratedScene[]> {
  const model = "gemini-2.5-flash-image";
  
  // We want 4 different scenes. We'll make 4 separate calls or one call asking for 4 variations.
  // Gemini 2.5 flash image typically returns one image per request.
  // To get 4 different scenes, we'll vary the prompt slightly for each.
  
  const sceneVariations = [
    "Modern minimalist living room",
    "Cozy rustic bedroom",
    "Sleek contemporary kitchen",
    "Bright Scandinavian home office"
  ];

  const generationPromises = sceneVariations.map(async (variation, index) => {
    const prompt = `Place the product from the uploaded image into a ${variation}. ${userPrompt}. Ensure the product looks natural and well-integrated into the scene. High quality, professional interior photography.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(",")[1], // Remove prefix
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let imageUrl = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error(`Failed to generate scene ${index + 1}`);
    }

    return {
      id: `scene-${index}-${Date.now()}`,
      url: imageUrl,
      prompt: prompt,
    };
  });

  return Promise.all(generationPromises);
}
