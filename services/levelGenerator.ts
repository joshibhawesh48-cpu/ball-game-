import { GoogleGenAI, Type } from "@google/genai";
import { RockType } from "../constants";

export const generateLevel = async (theme: string): Promise<number[][]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Create a 2D grid layout for a Breakout/Arkanoid style game level.
    The grid must be exactly 10 columns wide and 8 rows high.
    
    Use the following integer codes for the grid cells:
    0: Empty space
    1: Weak Rock (Common)
    2: Medium Rock (Uncommon)
    3: Hard Rock (Rare)
    4: Indestructible Block (Very Rare, use sparingly for obstacles)
    
    The theme of the level is: "${theme}".
    Try to make the layout artistically resemble the theme if possible, or use the theme to determine density and difficulty.
    Ensure the bottom 2 rows are always mostly 0 (Empty) to give the player space.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grid: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.INTEGER
                }
              }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    if (json.grid && Array.isArray(json.grid)) {
      return json.grid;
    }
    
    // Fallback if parsing fails or structure is wrong
    return createDefaultGrid();
  } catch (error) {
    console.error("Failed to generate level with AI:", error);
    return createDefaultGrid();
  }
};

const createDefaultGrid = (): number[][] => {
  const grid: number[][] = [];
  for (let r = 0; r < 8; r++) {
    const row: number[] = [];
    for (let c = 0; c < 10; c++) {
      if (r < 4) {
         // Simple pattern
         row.push((c + r) % 2 === 0 ? RockType.WEAK : RockType.MEDIUM);
      } else {
        row.push(RockType.EMPTY);
      }
    }
    grid.push(row);
  }
  return grid;
};