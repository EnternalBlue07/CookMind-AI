# 🔌 CookMind AI — API & Integration Reference

This guide provides technical specifications for integrating and configuring the AI services powering **CookMind AI**.

---

## 🔑 Authentication & Environment Variables

CookMind AI communicates directly with Google's Gemini API using the modern `@google/genai` SDK.

### Setting Up Your API Key

1. Generate a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create or edit your local environment file `.env.local` at the root of the project:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

> **Note:** Vite's build configuration in `vite.config.ts` automatically exposes this key to the application runtime via `process.env.API_KEY` and `process.env.GEMINI_API_KEY`.

---

## 🤖 Models & Capabilities

| Capability | Model | Reason / SLA |
| :--- | :--- | :--- |
| **Visual Pantry Scan** | `gemini-2.5-flash-image` | High-fidelity image parsing, low latency, fine object classification |
| **Recipe Generation** | `gemini-3-flash-preview` | Ultra-fast multimodal reasoning, strict JSON Schema compliance |
| **Dish Verification** | `gemini-2.5-flash-image` | Culinary validation, detects cooked vs. raw food and stock photos |

---

## 📝 Service Functions (`services/geminiService.ts`)

### `generateRecipeFromIntent`
Generates a complete, structured culinary plan based on user intent, optional fridge image, and available inventory.

```typescript
export const generateRecipeFromIntent = async (
  input: string,
  imageBase64: string | null,
  inventoryItems: string[]
): Promise<Recipe>;
```

#### Parameters
- `input` (`string`): Natural language query (e.g. *"Quick high-protein dinner under 20 mins"* or *"Paneer Butter Masala"*).
- `imageBase64` (`string | null`): Optional Base64-encoded image of food or fridge contents.
- `inventoryItems` (`string[]`): Array of items currently in the user's pantry.

#### Response Output
Returns a fully typed `Recipe` object conforming strictly to the `recipeSchema`.

---

### `identifyIngredientsFromImage`
Inspects an image of a refrigerator or kitchen counter and extracts detected ingredient names.

```typescript
export const identifyIngredientsFromImage = async (
  imageBase64: string
): Promise<string[]>;
```

---

### `validateCookedDish`
Validates whether a user has actually cooked the recipe before allowing them to mark the session complete and record dietary insights.

```typescript
export const validateCookedDish = async (
  imageBase64: string,
  recipeName: string
): Promise<{ isValid: boolean; message: string }>;
```

---

## 🧪 Testing API Connections

You can verify your Gemini API key in the browser developer console by executing:

```javascript
// Test in browser console
console.log("Gemini API Key configured:", Boolean(process.env.API_KEY));
```
