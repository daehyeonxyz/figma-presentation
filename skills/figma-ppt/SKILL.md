---
name: figma-ppt
description: Create a production-grade presentation in Figma, treating each 1920×1080 slide as a web section (hero, content, stats, quote, etc.). Extracts design tokens from Figma, plans slide structure, and generates Figma Plugin JavaScript ready to paste into the Figma Developer Console. Use for "make a presentation", "create slides", "build a deck", "generate Figma presentation".
disable-model-invocation: true
allowed-tools: Read, Write, Bash
---

# figma-ppt Skill

Generate a complete Figma presentation by thinking like a **web developer building a 1920×1080 web page**.

Each slide = a full-screen web section. Design tokens = CSS variables. Layout = flexbox/grid thinking.
Output = a single `.js` file the user pastes into Figma's Developer Console.

---

## Phase 1: Style Guide Loading

Check if `./style-guide.json` exists using the Read tool.

**If it exists**: Read it and validate it has at minimum `colors.primary`, `typography.heading1`, and `layout.slideWidth`.

**If it does NOT exist**:
Ask the user (single message):
```
No style-guide.json found. You have two options:

1. Extract from a Figma file (recommended):
   Run: /figma-ppt:extract-style https://www.figma.com/design/YOUR_FILE_ID/...
   Then re-run /figma-ppt

2. Continue with default styles (clean minimal blue palette, Inter font)
   Reply: "use defaults"
```
Wait for the user's choice before proceeding.

If "use defaults", load the default style from `references/web-design-guidelines.md`.

---

## Phase 2: Content Collection

Ask the user ALL of these in a single message:

```
Let's build your Figma presentation. Please answer:

1. Title and purpose — what is this presentation about and why?
2. Audience — executives / engineers / customers / students / general
3. Tone & mood — choose one or describe your own:
   - formal (professional, structured, authoritative)
   - minimal (clean, whitespace-heavy, restrained)
   - bold (high contrast, strong visuals, impactful)
   - technical (data-dense, precise, engineering aesthetic)
   - inspirational (aspirational, story-driven, emotional)
   - playful (approachable, friendly, energetic)
4. Content — paste your outline, bullet points, data, or describe each section.
   The more detail you give, the better the slide mapping.
5. Slide count — how many slides? Or type "auto" and I'll decide.
```

Wait for the full response before proceeding.

---

## Phase 3: Aesthetic Direction + Slide Planning

### 3A. Choose Aesthetic Direction

Based on tone + style guide's `aesthetic.direction`, commit to ONE bold direction.
Reference `references/web-design-guidelines.md` for direction → layout mappings.

CRITICAL (from frontend-design philosophy):
- Choose an EXTREME, not a middle ground
- "minimal" means *brutally* minimal — vast whitespace, single accent, perfect spacing
- "bold" means *genuinely* bold — full-bleed color blocks, oversized type, zero decoration
- NEVER produce generic AI aesthetics: no Inter on white with purple gradients
- Each presentation should feel uniquely designed for its purpose

Announce the direction to the user:
```
Aesthetic direction: [DIRECTION]
Visual concept: [1-2 sentence description of what this will look like]
Font pairing: [display font] + [body font]
Color approach: [description]
```

### 3B. Map Content to Slide Types

Reference `references/slide-types.md` for the 8 slide types and their web section analogies.
Reference `references/tone-guide.md` for tone → slide count and density rules.

Rules:
- Always start with `HERO`
- Include `AGENDA` if 4+ content sections
- Use `DIVIDER` between major sections (if 6+ slides)
- Always end with `CLOSING`
- Distribute bullets/data across `CONTENT`, `TWO_COL`, `STATS`
- Add `QUOTE` for inspirational/formal tone if a strong quote exists in content

### 3C. Show Slide Plan

Present to user as a numbered outline:
```
Presentation: "[TITLE]" ([N] slides)
Aesthetic: [DIRECTION] | Audience: [AUDIENCE] | Tone: [TONE]

 1. [HERO]     "Product Vision 2025"
               Subtitle: "Redefining the Developer Workflow"
               Author: Jane Lee, CTO · Feb 2025

 2. [AGENDA]   "Today's Agenda"
               Sections: Market Landscape, Our Solution, Roadmap, Team

 3. [DIVIDER]  Section 1: Market Landscape

 4. [STATS]    "$4.2T market · 18% CAGR · 340M potential users"
 ...

Does this look right? You can ask for changes — add, remove, or reorder slides.
Say "yes" or "go" to generate the code.
```

Wait for approval. Apply any requested changes and re-show if needed.

---

## Phase 4: Write Plans and Generate Code

After approval:

1. Write `./slides-plan.json` with the full slide structure.

2. Run the generation script:
```bash
python skills/figma-ppt/scripts/generate.py \
  --style-guide ./style-guide.json \
  --slides-plan ./slides-plan.json \
  --output "./figma-slides-$(date +%Y%m%d-%H%M%S).js" \
  --templates-dir ./templates
```

If no style-guide.json (using defaults), add `--use-defaults` flag.

---

## Phase 5: Deliver Results

Report to the user:

```
Your Figma presentation is ready!

FILE: ./figma-slides-[TIMESTAMP].js ([SIZE]KB, [N] slides)
AESTHETIC: [DIRECTION] — [brief description]

HOW TO CREATE IN FIGMA:
1. Open Figma desktop app (required — browser won't work)
2. Open the file where you want the slides
3. Menu: Plugins → Development → Open Console
   (Mac: Option+Cmd+I  |  Windows: Alt+Ctrl+I)
4. Open the generated .js file, select all (Cmd/Ctrl+A), copy
5. Click in the Figma console, paste (Cmd/Ctrl+V), press Enter
6. Wait for: "Created [N] slides on page '[TITLE]'"

RESULT:
- A new Figma page named "[TITLE]" is created
- [N] frames at 1920×1080, laid out horizontally
- Zoom to fit: Cmd/Ctrl+Shift+H

TIPS:
- Select all frames and export as PDF for sharing
- Use Figma Prototype mode to present (F key)
- Fonts used: [FONT_NAMES] — install from Google Fonts if missing
```

---

## Reference Files

- [references/slide-types.md](references/slide-types.md) — 8 slide type definitions with content fields
- [references/web-design-guidelines.md](references/web-design-guidelines.md) — Aesthetic directions, layout principles, design token usage
- [references/tone-guide.md](references/tone-guide.md) — Tone → aesthetic direction → slide count mappings
