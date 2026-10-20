<div align="center">

<img src="docs/images/cookmind-hero-banner.png" alt="CookMind AI — Kitchen Intelligence Software" width="100%" style="border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);" />

# 🍳 CookMind AI
### The Autonomous Multimodal Kitchen Intelligence Operating System

[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20%26%203%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Ready-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](docs/CONTRIBUTING.md)

<p align="center">
  <b>Transform your fridge photo, voice, or random cravings into precision recipes, real-time nutrition analytics, and hands-free guided cooking.</b><br>
  <i>Zero hallucinations. Zero food waste. True multimodal kitchen intelligence.</i>
</p>

[✨ Try on AI Studio](https://ai.studio/apps/drive/1hw9osyC1sUhh22tWvQubYFqjW1DgxHQh) • 
[📖 Architecture](docs/ARCHITECTURE.md) • 
[🔌 API Guide](docs/API_GUIDE.md) • 
[🤝 Contributing](docs/CONTRIBUTING.md) • 
[🐛 Report Bug](https://github.com/EnternalBlue07/CookMind-AI/issues)

</div>

---

## 🌟 Why CookMind AI?

Traditional recipe apps are broken: they assume you have rare spices, ask you to manually type 30 ingredients, and hallucinate steps without regard for what is actually in your fridge.

**CookMind AI** solves this through **Visual & Sensory Intelligence**:
- 👁️ **Visual Fridge & Pantry Perception**: Snap a photo of your fridge or countertop — Gemini 2.5 Flash extracts all available items into your live kitchen database.
- 🚫 **Zero-Hallucination Recipe Synthesis**: Suggests dishes based strictly on what you have, prioritizing pantry staples and minimizing food waste.
- 🎙️ **Hands-Free Kitchen Voice Guidance**: Built with native Web Speech Recognition & Speech Synthesis for safe, messy-hands cooking guidance.
- 💰 **INR Cost Estimation & Regional Styles**: Instant approximate cost breakdown in Indian Rupees (₹) with regional cuisine adaptations (Dhaba style, South Indian, Mediterranean, etc.).
- 🥗 **Dynamic Macro Nutritional Breakdown**: Interactive Recharts graphs detailing calories, protein, carbs, and fats.
- ✅ **Proof-of-Cooking Verification**: Upload a photo of the finished dish to verify completion, update your cooking streak, and train your personal taste profile.

---

## 🖼️ Visual Showcase

<div align="center">

### ⚡ The Multimodal System Architecture
<img src="docs/images/cookmind-workflow-architecture.png" alt="CookMind AI Workflow Architecture" width="95%" style="border-radius: 12px; margin-bottom: 24px;" />

<br/>

### 📱 Product Experience Gallery

| 📋 AI Recipe & Nutrition Analysis | 🍳 Hands-Free Step Cooking Mode | 📊 Habit & Nutrition Insights |
| :---: | :---: | :---: |
| <img src="docs/images/cookmind-recipe-analysis.png" alt="Recipe Analysis" width="300" style="border-radius: 10px;" /> | <img src="docs/images/cookmind-cooking-mode.png" alt="Cooking Mode" width="300" style="border-radius: 10px;" /> | <img src="docs/images/cookmind-insights-dashboard.png" alt="Insights Dashboard" width="300" style="border-radius: 10px;" /> |
| *Visual ingredient breakdown, smart substitutes, and INR costing* | *Step countdown timers, chef tips, and text-to-speech audio* | *Flavor radar, weekly meals tracker, and cooking streaks* |

</div>

---

## 🏗️ System Flow & Engineering

CookMind AI operates on a **Multimodal Inference Loop** utilizing Google's `@google/genai` SDK:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Kitchen Chef
    participant UI as ⚛️ React 19 Frontend
    participant Audio as 🎙️ Web Speech API
    participant Gemini as ✨ Gemini 2.5/3 Flash
    participant Inventory as 📦 Pantry State

    User->>UI: Uploads Fridge Photo / Speaks Query
    alt Visual Image Input
        UI->>Gemini: Base64 Image to gemini-2.5-flash-image
        Gemini-->>UI: Detected Ingredients List
        UI->>Inventory: Updates Live Pantry State
    else Voice / Text Intent
        User->>Audio: "Quick paneer recipe with low carbs"
        Audio-->>UI: Real-time Transcript
    end

    UI->>Gemini: Synthesize Recipe (Pantry Context + Strict JSON Schema)
    Gemini-->>UI: Deterministic Recipe JSON
    UI->>User: Displays Interactive Recipe Card & Nutrition Breakdown
    
    User->>UI: Clicks "Start Cooking"
    loop Step by Step Execution
        UI->>Audio: Synthesizes Chef Tip & Instruction Audio
        UI->>User: Active Countdown Timer
        User->>UI: Clicks Next Step / Voice Command
    end

    User->>UI: Uploads Final Cooked Dish Photo
    UI->>Gemini: Verify Dish Authenticity
    Gemini-->>UI: Dish Verified (Portion & Confidence)
    UI->>User: Cooking Streak +1 & Habit Analytics Updated!
```

---

## ⚡ Key Features

| Feature | Description | Tech Highlight |
| :--- | :--- | :--- |
| **📸 Visual Fridge Scanner** | Takes an image of open fridge/shelves and extracts visible ingredients into pantry state. | `gemini-2.5-flash-image` |
| **🧠 Zero-Waste Recipe Engine** | Prioritizes using on-hand ingredients, flags missing items, and calculates substitutes. | `gemini-3-flash-preview` |
| **🎙️ Voice Command & Audio Coach** | Voice-dictate recipe requests and listen to step-by-step guidance hands-free. | Web Speech API |
| **🥗 Nutritional Profiling** | Instant calorie and macro charts (Protein, Carbs, Fats) with health badges. | Recharts + Type Schema |
| **💰 INR Budget Estimator** | Itemized cost estimation per ingredient and total recipe budget in Indian Rupees. | Deterministic Prompting |
| **⏱️ Active Step Timers** | Built-in smart timers per cooking step with audio alert cues. | React Custom Hooks |
| **🛒 Smart Grocery List** | Move missing recipe ingredients straight into an editable shopping list. | Local State Persistence |
| **🏆 Proof-of-Cooking Verification** | Requires a photo of the completed dish before logging session to prevent fake streaks. | Computer Vision Verification |

---

## 🛠️ Technology Stack

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **AI Engine**: Google GenAI SDK (`@google/genai`)
  - `gemini-2.5-flash-image` (Visual pantry perception & proof verification)
  - `gemini-3-flash-preview` (Ultra-fast structured recipe synthesis)
- **Styling & UI**: [TailwindCSS](https://tailwindcss.com/) with Appetizing Sunset & Fresh Mint custom palettes
- **Data Visualization**: [Recharts](https://recharts.org/) (Bar charts, Radar charts, Pie distributions)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Audio APIs**: Native Browser `SpeechRecognition` & `SpeechSynthesis`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Google Gemini API Key** (Get yours free from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/EnternalBlue07/CookMind-AI.git
cd CookMind-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Your API Key
Create a `.env.local` file in the project root:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Run Locally
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```bash
CookMind-AI/
├── 📁 components/
│   ├── CookingMode.tsx          # Fullscreen interactive step-by-step cooking & timer
│   ├── InsightsDashboard.tsx    # Food habit analytics, flavor radar & cooking streaks
│   └── NutritionChart.tsx       # Recharts macro-nutrient breakdown visualization
├── 📁 docs/
│   ├── 📁 images/               # High-res banners, diagrams & app screenshots
│   │   ├── cookmind-hero-banner.png
│   │   ├── cookmind-workflow-architecture.png
│   │   ├── cookmind-recipe-analysis.png
│   │   ├── cookmind-cooking-mode.png
│   │   └── cookmind-insights-dashboard.png
│   ├── API_GUIDE.md             # Gemini API schemas and integration specs
│   ├── ARCHITECTURE.md          # Deep-dive system engineering blueprint
│   └── CONTRIBUTING.md          # PR standards and local development guide
├── 📁 services/
│   └── geminiService.ts         # Multimodal Gemini API calls & JSON schemas
├── App.tsx                      # Main application state, views & navigation
├── types.ts                     # TypeScript data interfaces & enums
├── vite.config.ts               # Vite configuration with env aliases
├── package.json                 # Project dependencies & scripts
└── README.md                    # Project documentation & visual showcase
```

---

## 🗺️ Product Roadmap

- [x] **v1.0**: Multimodal recipe generation via text, voice, and fridge photography.
- [x] **v1.1**: Step-by-step cooking mode with voice audio coach and step timers.
- [x] **v1.2**: Nutritional macro visualization, shopping list sync, and INR cost tracking.
- [ ] **v1.3**: Multilingual audio guidance (full audio Hindi and Hinglish voice packs).
- [ ] **v1.4**: Barcode & grocery receipt scanning integration.
- [ ] **v1.5**: IoT kitchen integration (smart oven & induction cooktop timers).

---

## 🤝 Contributing

Contributions make the open-source community thrive!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

Please refer to the [Contributing Guide](docs/CONTRIBUTING.md) for details.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👨‍💻 Author

**Zumaan Sayyed** ([@EnternalBlue07](https://github.com/EnternalBlue07))

<div align="center">
  <sub>Built with ❤️ and passion for culinary intelligence and zero food waste.</sub>
</div>
