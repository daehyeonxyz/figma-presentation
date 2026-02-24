# figma-ppt — Claude Code Plugin

> Generate Figma presentation slides like building a **1920×1080 web page**.

Each slide is a full-screen web section (hero, content, stats, quote...).
Design tokens flow from your Figma file → `style-guide.json` → beautifully styled slides.

---

## How It Works

```
Your Figma design file
        ↓  (Figma MCP)
  style-guide.json         ← design tokens extracted
        ↓
  Content + Tone input
        ↓  (Claude plans)
  slides-plan.json         ← structured slide plan
        ↓  (generate.py)
  figma-slides.js          ← paste into Figma Console
        ↓
  🎨 Figma presentation    ← 1920×1080 frames created
```

---

## Installation

### 1. Install this plugin

```bash
claude plugin install https://github.com/your-username/figma-ppt-plugin
```

### 2. Install recommended design skills (optional but recommended)

These skills enhance the aesthetic quality of generated presentations:

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
```

### 3. Ensure Figma MCP is connected

The `extract-style` skill uses Figma MCP tools (`get_design_context`, `get_variable_defs`, etc.).
Make sure the Figma MCP server is running and connected in Claude Code.

---

## Usage

### Step 1: Extract your design style (one-time setup)

```
/figma-ppt:extract-style https://www.figma.com/design/YOUR_FILE_ID/Your-Design
```

This reads your Figma file and creates `./style-guide.json` with:
- Color palette (primary, secondary, background, text colors)
- Typography scale (heading1–3, body, caption, display)
- Layout system (padding, gaps, corner radius)
- Aesthetic direction (minimal, bold, luxury, technical, etc.)

### Step 2: Generate a presentation

```
/figma-ppt
```

Claude will ask:
1. Presentation title and purpose
2. Target audience
3. Tone & mood (formal / minimal / bold / technical / inspirational / casual)
4. Content (paste your outline, bullet points, data)
5. Slide count (or "auto")

Then Claude proposes a slide plan → you approve → `.js` file is generated.

### Step 3: Run in Figma

1. Open Figma desktop app
2. **Plugins → Development → Open Console** (Mac: `Option+Cmd+I`)
3. Open the generated `.js` file, select all, copy
4. Paste into Figma console and press `Enter`
5. A new page with your slides is created automatically

---

## Slide Types

| Type | Web Analogy | Description |
|------|-------------|-------------|
| `HERO` | Landing hero section | Opening slide with title, subtitle, author |
| `AGENDA` | Table of contents | Numbered agenda items |
| `CONTENT` | Article section | Heading + body + bullets + optional image area |
| `TWO_COL` | Feature comparison | Two-column cards for side-by-side content |
| `STATS` | KPI dashboard | 2-4 cards with big numbers, trends, labels |
| `QUOTE` | Full-page testimonial | Full-bleed quote with attribution |
| `DIVIDER` | Chapter break | Section separator with large number watermark |
| `CLOSING` | Footer / CTA | Thank you, key takeaways, contact info |

---

## Project Structure

```
figma-ppt-plugin/
├── .claude-plugin/
│   └── plugin.json               ← Plugin manifest
│
├── skills/
│   ├── extract-style/
│   │   ├── SKILL.md              ← Style extraction skill
│   │   └── references/
│   │       └── figma-token-guide.md
│   │
│   └── figma-ppt/
│       ├── SKILL.md              ← Main generation skill
│       ├── references/
│       │   ├── slide-types.md
│       │   ├── web-design-guidelines.md
│       │   └── tone-guide.md
│       └── scripts/
│           └── generate.py       ← JS assembler
│
├── templates/
│   ├── base.js.template          ← Figma Plugin harness + helpers
│   └── slides/
│       ├── 01_hero.js.template
│       ├── 02_agenda.js.template
│       ├── 03_content.js.template
│       ├── 04_two_col.js.template
│       ├── 05_stats.js.template
│       ├── 06_quote.js.template
│       ├── 07_divider.js.template
│       └── 08_closing.js.template
│
├── schemas/
│   └── style-guide.schema.json
│
├── examples/
│   ├── style-guide-example.json
│   └── slides-plan-example.json
│
└── README.md
```

---

## Aesthetic Directions

The plugin treats slides as **web sections with bold aesthetic intent**:

| Direction | Concept | Best for |
|-----------|---------|----------|
| `minimal` | Brutally restrained — vast whitespace, single accent | Executive decks, investor pitches |
| `bold` | High contrast, full-bleed color, oversized type | Product launches, all-hands |
| `luxury` | Dark palette, gold/cream accents, refined typography | Premium brand, board presentations |
| `editorial` | Magazine layouts, typography as design | Creative agencies, storytelling |
| `technical` | Data-dense, monospace, precise | Engineering reviews, data science |
| `playful` | Rounded, bright, energetic | Customer-facing, education |

---

## Requirements

- **Claude Code** with Figma MCP connected
- **Python 3.8+** (for `generate.py`)
- **Figma desktop app** (console access required for execution)
- Fonts used must be installed in Figma (Pretendard, Inter, etc.)

---

## Tips

- Run `extract-style` once per Figma file — reuse `style-guide.json` for multiple presentations
- For Korean presentations, the plugin auto-detects Pretendard font
- Generated `.js` files are self-contained — share with teammates to regenerate slides
- Slides are 1920×1080 (16:9 Full HD) — optimal for presentations and PDF export
- Use **Figma Prototype mode** (press `F`) to present directly

---

## License

MIT
