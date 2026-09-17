# SlideCraft AI 🎨✨

> **AI-powered presentation generator** — transform text, documents, and ideas into beautiful, ready-to-export PowerPoint slides in seconds.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)](https://supabase.com/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?logo=render)](https://slidecraft-tclf.onrender.com/)

🌐 **Live Demo:** [https://slidecraft-tclf.onrender.com](https://slidecraft-tclf.onrender.com/)

---

## 🚀 Features

- **AI-Powered Slide Generation** — Describe your topic or paste content; SlideCraft AI generates a complete, structured presentation.
- **Multi-Provider AI Routing** — Intelligently routes tasks across Groq, NVIDIA FLUX, OpenRouter, and Google Gemini for optimal speed and quality.
- **Document Upload Support** — Import from DOCX, PDF, CSV, and plain text files to auto-generate slides.
- **AI Image Generation** — Generates contextual slide visuals using NVIDIA FLUX (FLUX.2-klein, FLUX.1-schnell).
- **Rich Slide Editor** — Real-time slide customization with themes, layouts, fonts, and color palettes.
- **Export to PPTX** — Download production-ready PowerPoint files using `pptxgenjs`.
- **Authentication & Persistence** — User accounts, session management, and saved presentations powered by Supabase.
- **Rate Limiting** — Optional Redis-backed rate limiting via Upstash.
- **Charts & Data Visualization** — Embed Recharts-powered charts directly into slides.
- **Responsive UI** — Built with Radix UI primitives, Framer Motion animations, and Tailwind CSS.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3, Radix UI |
| **Animation** | Framer Motion |
| **AI – Text** | Groq (`llama-3.3-70b-versatile`) |
| **AI – Images** | NVIDIA FLUX API |
| **AI – Reasoning** | Google Gemini 1.5 Flash |
| **AI – Fallback** | OpenRouter (free tier) |
| **Database / Auth** | Supabase (PostgreSQL + Auth) |
| **Rate Limiting** | Upstash Redis (optional) |
| **Charts** | Recharts |
| **PPTX Export** | pptxgenjs |
| **Linting** | ESLint + Prettier |

---

## 📦 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or `pnpm` / `yarn`)
- A [Supabase](https://supabase.com/) project
- API keys for the AI providers you want to use (see [Environment Variables](#-environment-variables))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/slidecraft-ai.git
cd slidecraft-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your API keys

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and populate the following:

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) | ✅ |
| `GROQ_API_KEY` | [Groq](https://console.groq.com/keys) API key for fast text inference | ✅ |
| `GROQ_MODEL` | Groq model name (default: `llama-3.3-70b-versatile`) | ✅ |
| `NVIDIA_API_KEY` | [NVIDIA Build](https://build.nvidia.com/) API key for image generation | ✅ |
| `NVIDIA_API_BASE_URL` | NVIDIA API base URL | ✅ |
| `NVIDIA_IMAGE_MODEL` | NVIDIA image model (default: `black-forest-labs/flux.2-klein-4b`) | ✅ |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) API key | ✅ |
| `GEMINI_MODEL` | Gemini model (default: `gemini-1.5-flash`) | ✅ |
| `OPENROUTER_API_KEY` | [OpenRouter](https://openrouter.ai/keys) API key (free-tier fallback) | ⚡ Optional |
| `OPENROUTER_TEXT_MODEL` | OpenRouter model (must be free-tier) | ⚡ Optional |
| `AI_PROVIDER_ROUTING` | Routing mode (`multi` recommended) | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting | ⚡ Optional |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | ⚡ Optional |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | ✅ |

> **⚠️ Security Note:** Never commit your `.env.local` file. It is listed in `.gitignore` by default.

---

## 🛠️ Available Scripts

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type-checking
```

---

## 📁 Project Structure

```
slidecraft-ai/
├── src/
│   ├── app/           # Next.js App Router pages & API routes
│   ├── components/    # Reusable React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions & AI provider clients
│   ├── store/         # Zustand global state management
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
├── supabase/          # Supabase schema & migrations
├── scripts/           # Utility scripts
├── .env.example       # Environment variable template
├── next.config.mjs    # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please make sure your code passes linting (`npm run lint`) and type-checking (`npm run typecheck`) before submitting.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) — The React framework for production
- [Groq](https://groq.com/) — Ultra-fast LLM inference
- [NVIDIA Build](https://build.nvidia.com/) — AI image generation API
- [Google Gemini](https://deepmind.google/technologies/gemini/) — Advanced reasoning model
- [Supabase](https://supabase.com/) — Open source Firebase alternative
- [pptxgenjs](https://gitbrent.github.io/PptxGenJS/) — PowerPoint generation library
- [Radix UI](https://www.radix-ui.com/) — Accessible UI primitives

