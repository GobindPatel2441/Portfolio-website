# Gobind Patel — AI & Full-Stack Engineer Portfolio

An **Awwwards-caliber personal portfolio website** designed and engineered for **Gobind Patel** (B.Tech Computer Science & Engineering [AI/ML] at Sri Sri University, Cuttack).

![Gobind Patel Portfolio Preview](assets/gobind-patel.png)

---

## ✨ Key Features & Craftsmanship

1. **Apple Liquid Glass 3D Tilt & Specular Physics**:
   - Inspired by `liquid-glass-js`, featuring Gobind's real cinematic portrait in an interactive glass card with dynamic specular glare, mouse tracking, and 3 refraction presets (*Crystal*, *Frosted*, *Holo*).
2. **Interactive WebGL Liquid Fluid Shader Background**:
   - Real-time reactive fluid mesh reacting to mouse movement and ambient wavelength pulses (inspired by `shadergradient` and `liquid-logo`).
3. **Interactive AI Lab & Terminal Simulator**:
   - **Sentix Multilingual Empathy Engine**: Real-time simulation of facial emotion detection (DeepFace) with empathetic Llama 3 generation across 11 Indian languages (NLLB-200 distilled 600M).
   - **Medical AI Assistant (Clinical RAG with FAISS & Groq)**: Demonstrates cosine similarity retrieval over clinical literature, semantic citations, and Groq 150+ tokens/sec inference with session memory.
   - **Decision Diary — Human-AI Memory Continuity System**: Local-first decision reflection app with Ollama (Llama 3.1:8B) and browser vector storage (`thinkly_memories`) that won **2nd Prize** at the GITA Chakravyuh Hackathon.
4. **Architectural Deep-Dive Modals**:
   - Clickable case study modal for each project featuring pipeline diagrams, benchmarks, and GitHub repository links.
5. **Interactive Resume Viewer & 1-Click PDF Download**:
   - Direct embedded preview of `Gobind_Patel_Resume.pdf` and direct instant download.
6. **Web Audio Micro-Synthesizer**:
   - Subtle futuristic interaction sounds synthesized on-the-fly via Web Audio API (with toggle mute button).
7. **Production SEO & Responsive Design**:
   - Mobile-first, fully responsive across phones, tablets, and desktop displays.

---

## 🚀 Quick Start / Local Preview

You can open `index.html` directly in any web browser, or launch a lightweight local server:

### Option A: Python HTTP Server
```bash
python -m http.server 5173
```
Then visit: `http://localhost:5173`

### Option B: Node / npx serve
```bash
npx -y serve ./
```

---

## 📁 Project Structure

```
Portfolio/
├── index.html                  # Semantic, accessible HTML5 structure & SEO
├── css/
│   ├── main.css                # Obsidian design tokens, typography, custom scrollbar
│   ├── components.css          # Liquid glass cards, floating navbar, AI terminal
│   ├── animations.css          # Micro-animations, keyframes, liquid shimmer
│   └── responsive.css          # Adaptive breakpoints for mobile, tablet, 4K
├── js/
│   ├── main.js                 # App entry, audio synthesizer, stats counter, clipboard
│   ├── liquid-shader.js        # WebGL fluid shader with mouse reactivity & 2D fallback
│   ├── liquid-glass.js         # 3D tilt physics & specular glint layer
│   ├── ai-terminal.js          # Interactive live simulators for Sentix & RAG
│   └── projects-modal.js       # Case study architectural modals & resume viewer
├── assets/
│   ├── gobind-patel.png        # High-res cinematic portrait
│   ├── Gobind_Patel_Resume.pdf # Original PDF resume
│   ├── project-sentix.jpg      # High-fidelity Sentix UI preview
│   ├── project-medical.jpg     # High-fidelity Medical RAG UI preview
│   └── project-chakravyuh.jpg  # High-fidelity Memory Continuity UI preview
└── README.md
```

---

## 🌐 Deploy to GitHub Pages or Vercel

### Deploy to GitHub Pages:
1. Push this folder to your repository: `github.com/GobindPatel2441/portfolio`
2. In GitHub: Go to **Settings** > **Pages**
3. Select **Branch: main** and **Folder: / (root)**, then click **Save**.
4. Your site will be live at `https://GobindPatel2441.github.io/portfolio`!
