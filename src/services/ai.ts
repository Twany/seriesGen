import { GoogleGenAI, Type } from "@google/genai";

// Standard prompt format wrapper
export interface GenerationResult {
  characterAnchor: string;
  styleAnchor: string;
  actions: string[];
}

export async function generateCharacterAnchor(
  prompt: string, 
  numActions: number,
  scenario: string = "Standard Layout",
  referenceImageBase64?: string
): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not defined");

  const ai = new GoogleGenAI({ apiKey });

  const promptText = `Turn this idea into a structured profile for consistent AI image series generation: "${prompt}".
Scenario/Use Case: ${scenario}.
Generate a set of ${numActions} actions or layouts that fit this scenario perfectly.

We need:
1. Character Anchor: Very detailed physical description of the character or main subject (colors, clothing, features, shape). MUST NOT include active verbs or environment.
2. Style Anchor: The specific art style, lighting, camera technique, and background (e.g., "3D Pixar render, soft studio lighting, solid pastel background").
3. Actions: An array of ${numActions} distinct, expressive actions, expressions, or poses fitting the "${scenario}" scenario. They should be brief, e.g., "waving happily", "crying with anime tears".`;

  const requestParts: any[] = [{ text: promptText }];
  
  if (referenceImageBase64) {
    const base64Data = referenceImageBase64.split(';base64,').pop();
    const mimeType = referenceImageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
    
    if (base64Data) {
      requestParts.push({
        inlineData: {
          data: base64Data,
          mimeType
        }
      });
      requestParts[0].text = "Analyze the provided reference image. " + promptText;
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: requestParts,
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characterAnchor: {
            type: Type.STRING,
            description: "Detailed physical string based on the input and reference image (if any)."
          },
          styleAnchor: {
            type: Type.STRING,
            description: "Art style, rendering, lighting, and background details."
          },
          actions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Exactly ${numActions} action or pose descriptions for the scenario.`
          }
        },
        required: ["characterAnchor", "styleAnchor", "actions"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate character structured profile.");
  }

  return JSON.parse(response.text) as GenerationResult;
}

export async function generateActionImage(characterAnchor: string, styleAnchor: string, action: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not defined");

  const ai = new GoogleGenAI({ apiKey });
  
  // Construct a prompt that enforces consistency
  const imagePrompt = `Subject: ${characterAnchor}.
Action: ${action}.
Style & Setting: ${styleAnchor}.
Ensure the character strictly matches the subject description perfectly.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: imagePrompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  // Extract Base64 Image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from generation.");
}

export async function generateGridImage(characterAnchor: string, styleAnchor: string, rows: number, cols: number, seriesType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not defined");

  const ai = new GoogleGenAI({ apiKey });
  
  const totalPanels = rows * cols;
  
  // Construct a prompt that enforces strict grid consistency and layout
  const imagePrompt = `Create a single image with EXACTLY ${totalPanels} panels arranged in a ${rows} rows × ${cols} columns grid.

STRICT LAYOUT REQUIREMENTS (must follow exactly):
- Grid: ${rows} rows, ${cols} columns
- All panels must be perfectly aligned and evenly spaced
- Consistent horizontal and vertical gaps between panels
- Consistent outer padding (margin on all sides)
- No cropping, no irregular layout, no extra elements outside grid

TRANSPARENCY REQUIREMENTS (critical):
- The entire background MUST be fully transparent (true alpha channel)
- No background color (no white, no gray, no gradient)
- No fake transparency effects
- No shadows, no background shapes, no halos
- Empty areas must remain fully transparent

SUBJECT PLACEMENT RULES (very important):
- Each subject must be fully contained inside its panel
- Keep at least 10% padding inside each panel (safe margin on all sides)
- Do not let any part of the subject touch or cross panel boundaries
- Each subject must be visually centered within its panel

STYLE CONSISTENCY:
- Use the exact same character identity across all panels
- Keep proportions, colors, line style, and details consistent
- No variation in design, only variation in pose/expression/action

VARIATION RULES:
- Each panel must show a clearly distinct action, pose, or expression
- Variations must be visually obvious at a glance (not subtle)
- Avoid repeated or nearly identical poses

STYLE REQUIREMENTS:
- Each panel contains one variation of: ${characterAnchor}. Style/Setting: ${styleAnchor}. Series Type: ${seriesType}.
- Clean, isolated subject only (no environment, no props unless essential)
- No overlapping between panels

IMPORTANT:
- Output must be a clean transparent PNG
- No text, watermark, UI elements, borders, frames, or decorations
- No grid lines or visual separators
- The grid must be defined only by spacing, not by visible lines
- Ensure pixel-perfect alignment and spacing`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: imagePrompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No grid image data returned from generation.");
}
