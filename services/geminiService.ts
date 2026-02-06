import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

// --- Schemas ---

const recipeSchema: any = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name of the dish" },
    description: { type: Type.STRING, description: "Short appetizing description" },
    prepTime: { type: Type.STRING, description: "Preparation time (e.g. 15 mins)" },
    cookTime: { type: Type.STRING, description: "Cooking time (e.g. 30 mins)" },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
    servings: { type: Type.NUMBER, description: "Number of people" },
    costEstimate: { type: Type.STRING, description: "Estimated total cost range in INR" },
    regionalStyle: { type: Type.STRING, description: "Region or style (e.g. Punjabi)" },
    tips: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of 2-3 chef's tips or variations for the dish." 
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.STRING },
          isMandatory: { type: Type.BOOLEAN },
          substitute: { type: Type.STRING, description: "A valid substitute if any" },
          inInventory: { 
            type: Type.BOOLEAN, 
            description: "True if the ingredient matches an item in the user's provided inventory list (fuzzy match)." 
          },
          estimatedCost: {
            type: Type.STRING,
            description: "Estimated cost in INR for this specific quantity (e.g. '₹20')."
          }
        },
        required: ["name", "quantity", "isMandatory", "inInventory"],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.NUMBER },
          instruction: { type: Type.STRING },
          timerSeconds: { type: Type.NUMBER, description: "Time in seconds for this step if applicable, else 0" },
          tip: { type: Type.STRING, description: "A chef's tip or warning for this step" },
        },
        required: ["stepNumber", "instruction"],
      },
    },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING },
        healthLabel: { type: Type.STRING },
      },
      required: ["calories", "protein", "carbs", "fats", "healthLabel"],
    },
  },
  required: ["name", "ingredients", "steps", "nutrition", "difficulty"],
};

const inventorySchema: any = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.STRING, enum: ["low", "medium", "high"] },
          confidence: { type: Type.NUMBER }
        },
        required: ["name", "quantity", "confidence"]
      }
    }
  },
  required: ["ingredients"]
};

const dishVerificationSchema: any = {
  type: Type.OBJECT,
  properties: {
    is_valid: { type: Type.BOOLEAN },
    confidence: { type: Type.NUMBER },
    portion: { type: Type.STRING, enum: ["small", "medium", "large"] },
    notes: { type: Type.STRING }
  },
  required: ["is_valid", "confidence", "notes"]
};

// --- Helper for API Initialization ---
const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Helper for Text Cleaning ---
const cleanAndParseJSON = (text: string) => {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON Parsing Error:", error, "Raw Text:", text);
    throw new Error("Failed to parse AI response as JSON.");
  }
};

// --- Core Services ---

export const generateRecipeFromIntent = async (
  input: string,
  imageBase64: string | null,
  inventoryItems: string[]
): Promise<Recipe> => {
  const ai = getAI();
  const isImageRequest = !!imageBase64;
  const modelName = isImageRequest ? "gemini-2.5-flash-image" : "gemini-3-flash-preview";

  let systemInstruction = `
    You are CookMind AI — a Living Kitchen Intelligence System.
    
    Your purpose:
    - Understand the user’s kitchen state.
    - Never hallucinate ingredients.
    - Never count food without visual proof.
    - Speak naturally (English / Hindi / Hinglish).
    - Adapt to user habits, health, and context.

    Core Rules:
    1. NEVER suggest a dish requiring unavailable ingredients unless it's a minor staple (salt, oil).
    2. ALWAYS prefer simpler, healthier options if multiple exist.
    3. Speak like a human kitchen assistant, not a recipe book.
    4. If the user input suggests Hinglish, respond in a casual, friendly Hinglish tone.

    Context:
    - User Inventory: ${inventoryItems.join(", ")}.
    
    CRITICAL INVENTORY MATCHING:
    - Cross-reference ingredients with the inventory list.
    - Set "inInventory" to TRUE for matches (exact, partial, synonym).
  `;

  // For image models, we must provide the schema in the prompt as they don't support JSON mode config
  if (isImageRequest) {
    systemInstruction += `\n\nOutput strictly valid JSON matching this schema structure:\n${JSON.stringify(recipeSchema, null, 2)}`;
  } else {
    systemInstruction += `\n\nOutput JSON strictly following the provided schema.`;
  }

  const parts: any[] = [];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    });
    parts.push({ text: input || "Analyze this image and suggest a recipe." });
  } else {
    parts.push({ text: input });
  }

  const reqConfig: any = {
    systemInstruction: systemInstruction,
  };

  // Only enable JSON mode for non-image models
  if (!isImageRequest) {
    reqConfig.responseMimeType = "application/json";
    reqConfig.responseSchema = recipeSchema;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { role: "user", parts: parts },
      config: reqConfig,
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = cleanAndParseJSON(text);
    return { ...parsed, id: crypto.randomUUID() };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const identifyIngredientsFromImage = async (imageBase64: string): Promise<string[]> => {
  const ai = getAI();
  const modelName = "gemini-2.5-flash-image";

  // Embed schema in prompt for image model
  const systemInstruction = `
    You are a computer vision enabled kitchen assistant.
    Task:
    1. Detect all visible food ingredients in the image (fridge, shelf, or countertop).
    2. Ignore utensils, containers, and non-food items.
    3. Output ONLY items reasonably visible.
    4. Be conservative (do not guess hidden items).
    
    Output strictly valid JSON matching this schema:
    ${JSON.stringify(inventorySchema, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
          { text: "Identify the ingredients in this image." }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        // responseMimeType: "application/json" is NOT supported for gemini-2.5-flash-image
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = cleanAndParseJSON(text);
    // Return just the names for the simple inventory list
    return parsed.ingredients.map((i: any) => i.name);
  } catch (error) {
    console.error("Inventory Scan Error:", error);
    return [];
  }
};

export const validateCookedDish = async (
  imageBase64: string,
  recipeName: string
): Promise<{ isValid: boolean; message: string }> => {
  const ai = getAI();
  const modelName = "gemini-2.5-flash-image";

  const systemInstruction = `
    You are a food image verification AI.
    Input: Image of cooked dish and Selected Recipe Name.
    
    Tasks:
    1. Confirm this is food.
    2. Check if it reasonably matches the selected recipe: "${recipeName}".
    3. Detect if image is valid (not raw ingredients, not stock photo).
    
    Output strictly valid JSON matching this schema:
    ${JSON.stringify(dishVerificationSchema, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
          { text: `Verify this dish against the recipe: ${recipeName}` }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        // responseMimeType: "application/json" is NOT supported for gemini-2.5-flash-image
      },
    });

    const text = response.text;
    if (!text) return { isValid: false, message: "Could not verify image." };
    
    const parsed = cleanAndParseJSON(text);
    return { 
      isValid: parsed.is_valid, 
      message: parsed.notes || (parsed.is_valid ? "Great job! Dish verified." : "Doesn't look like the recipe.") 
    };
  } catch (error) {
    console.error("Dish Verification Error:", error);
    return { isValid: false, message: "Verification failed due to an error." };
  }
};