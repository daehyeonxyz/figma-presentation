# Figma Presentation — AI Slide Generator

> Generate beautiful 1920×1080 presentation slides directly in Figma using Claude AI.

Each slide is designed as a **full-screen web section** — hero, content, stats, quote, and more.

---

## Features

- 🤖 **Claude-powered** — uses your own Claude API key, any model you choose
- 🎨 **6 Visual Styles** — Minimal, Bold, Luxury, Editorial, Technical, Playful
- 📊 **8 Slide Types** — HERO, AGENDA, CONTENT, TWO_COL, STATS, QUOTE, DIVIDER, CLOSING
- 🔒 **Private** — API key stored locally, calls go directly to Anthropic
- 🌐 **No server** — fully client-side Figma plugin

---

## Slide Types

| Type | Description |
|------|-------------|
| `HERO` | Opening slide with title, subtitle, author |
| `AGENDA` | Table of contents with numbered items |
| `DIVIDER` | Section separator with large number watermark |
| `CONTENT` | Heading + body + bullets + optional image area |
| `TWO_COL` | Two-column comparison cards |
| `STATS` | 2–4 KPI cards with big numbers and trends |
| `QUOTE` | Full-bleed quote with attribution |
| `CLOSING` | Final CTA slide with key takeaways |

---

## Development Setup

### Prerequisites
- Node.js 18+
- Figma desktop app

### Install & Build

```bash
npm install
npm run build        # production build
npm run dev          # watch mode
```

### Load in Figma

1. Open Figma desktop app
2. **Plugins → Development → Import plugin from manifest...**
3. Select `manifest.json` from this folder
4. Run the plugin from **Plugins → Development → Figma Presentation**

---

## Usage

1. Click the **⚙ Settings** button
2. Enter your [Claude API key](https://console.anthropic.com)
3. Select your preferred Claude model
4. Fill in presentation title, audience, tone, and content
5. Click **✦ Generate Presentation**
6. Slides appear on a new Figma page ✨

---

## Architecture

```
src/
├── ui/              ← React plugin UI (runs in iframe)
│   ├── App.tsx      ← Main component (settings + form + progress)
│   ├── index.tsx    ← Entry point
│   ├── index.html   ← HTML shell
│   └── styles.css   ← Dark UI styles
│
├── plugin/
│   └── code.ts      ← Figma Plugin API (runs in sandbox)
│                       Renders all 8 slide types as Figma frames
│
├── api/
│   └── claude.ts    ← Claude API client + default style generator
│
└── types/
    └── index.ts     ← Shared TypeScript types
```

**Data flow:**
```
User fills form
  → Claude API generates slides-plan.json
  → Plugin backend renders frames in Figma
  → Slides appear on new page
```

---

## License

MIT © 2025 daehyeonxyz
