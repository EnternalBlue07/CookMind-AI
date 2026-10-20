import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

// Define the strict schema for the recipe output
// We use 'any' for the type annotation here to avoid import issues if Schema is not exported as a value
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

export const generateRecipeFromIntent = async (
  input: string,
  imageBase64: string | null,
  inventoryItems: string[]
): Promise<Recipe> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Choose model based on input type
  // Use gemini-2.5-flash-image if image is present, otherwise gemini-3-flash-preview
  const modelName = imageBase64 ? "gemini-2.5-flash-image" : "gemini-3-flash-preview";

  const systemInstruction = `
    You are CookMind AI, an elite cooking intelligence system.
    Your goal is to understand the user's food intent and generate a structured recipe.
    
    Context:
    - The user has these items in their kitchen: ${inventoryItems.join(", ")}. 
    
    CRITICAL INVENTORY MATCHING INSTRUCTIONS:
    1. Cross-reference every ingredient in your generated recipe with the user's kitchen inventory list.
    2. Set "inInventory" to TRUE if:
       - Exact match (e.g., "Onion" matches "Onion").
       - Plural/Singular match (e.g., "Tomatoes" matches "Tomato").
       - Synonym match (e.g., "Cilantro" matches "Coriander", "Aubergine" matches "Brinjal").
       - Component match (e.g., "Lemon Juice" matches "Lemon").
    3. QUANTITY CHECK: If the recipe requires a significant amount (e.g., "1kg Chicken") but the inventory implies a standard household amount (or user specified small quantity), use your best judgment. Generally, assume standard pantry staples (salt, oil, spices) are sufficient.
    
    Prioritize using inventory items in the recipe to reduce waste.
    If the user provides a dish name, generate a recipe for it.
    If the user provides a vague idea (e.g. "I'm hungry and have potatoes"), suggest a creative dish.
    If an image is provided, identify the ingredients or dish in the image and generate a recipe based on that.
    
    Output JSON following the provided schema strictly.
    Ensure "steps" are clear, actionable, and include specific "tips" like a professional chef.
    Calculate nutrition estimates and approximate ingredient costs in INR accurately.
  `;

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

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: "user",
        parts: parts,
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean markdown code blocks if present
    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");

    const parsed = JSON.parse(text);
    return { ...parsed, id: crypto.randomUUID() };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};