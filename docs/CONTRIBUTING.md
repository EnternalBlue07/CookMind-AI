# 🤝 Contributing to CookMind AI

Thank you for your interest in contributing to **CookMind AI**! We welcome community contributions to build the world's most intelligent, delightful, and waste-reducing culinary operating system.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/EnternalBlue07/CookMind-AI.git
   cd CookMind-AI
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch Local Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Run Typecheck & Build Validation**
   ```bash
   npm run build
   ```

---

## 📋 Pull Request Guidelines

- Ensure code adheres to clean TypeScript patterns and existing naming conventions.
- Keep components focused and modular under `components/`.
- Validate that Gemini JSON schema definitions in `services/geminiService.ts` remain strictly typed.
- Provide descriptive PR titles following the Conventional Commits format:
  - `feat: add dietary filter preset`
  - `fix: resolve timer audio glitch on step completion`
  - `docs: update multimodal architecture diagrams`

---

## 📜 Code of Conduct

CookMind AI is an open and inclusive community. Be respectful, constructive, and supportive in all discussions and pull requests.
