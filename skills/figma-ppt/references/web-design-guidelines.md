# Web Design Guidelines for Figma Presentations

Core design principles synthesized from:
- frontend-design skill (Anthropic)
- web-design-guidelines (Vercel Labs)
- ui-ux-pro-max principles

These principles guide aesthetic decisions when planning and generating slides.

---

## The Core Mandate

> Treat each slide as a **full-screen web section** (1920×1080).
> Design tokens = CSS custom properties.
> Layout = flexbox/grid thinking.
> NEVER produce generic AI aesthetics.

---

## Aesthetic Directions

Choose ONE direction and execute it with full commitment.
Mixed directions produce forgettable, generic results.

### MINIMAL
**Concept**: Brutal restraint. Every element earns its place.
- **Background**: Pure white or near-white (#FAFAFA). No gradients.
- **Color use**: One accent color, used sparingly (max 20% of visual area)
- **Typography**: One font family. Large size contrast (48px body, 96px title)
- **Layout**: Massive whitespace. Left-aligned. Single column preferred.
- **Details**: Ultra-thin rules (1px), no decorative shapes, no shadows
- **Slide density**: Low (max 3 bullets, max 60 words per slide)

### BOLD
**Concept**: Maximum impact. Color as structure.
- **Background**: Full-bleed primary color on key slides
- **Color use**: 2 colors max — dominant + single accent for contrast
- **Typography**: Oversized headlines (80-96px). Bold/ExtraBold only for headings.
- **Layout**: Asymmetric. Overlapping elements. Diagonal breaks.
- **Details**: Sharp edges (radius: 0-4px), strong shadows, geometric shapes
- **Slide density**: Medium (5-7 bullets max, key numbers VERY large)

### LUXURY
**Concept**: Premium restraint. Dark + gold/cream palette.
- **Background**: Deep navy/charcoal (#0D0D1A, #1A1A2E) or warm dark (#1C1410)
- **Color use**: Gold (#C9A84C), cream (#F5F0E8), or cool silver (#B0BEC5) accents
- **Typography**: Mix serif display (Playfair Display, Cormorant) + sans body (DM Sans)
- **Layout**: Generous padding (120px+). Centered or right-aligned luxury layouts.
- **Details**: Thin gold borders, subtle glow effects, elegant dividers
- **Slide density**: Low-medium. Quality over quantity.

### EDITORIAL
**Concept**: Magazine layout thinking. Typography as design.
- **Background**: White or light cream. Occasional full-bleed image sections.
- **Color use**: Strong editorial accent (burnt orange, forest green, deep red)
- **Typography**: Contrasting scales — tiny caption (10px) next to giant headline (120px)
- **Layout**: Grid-breaking. Overlapping text and shapes. Asymmetric columns.
- **Details**: Pull quotes, numbered sidebars, editorial rules
- **Slide density**: Variable — text-heavy info slides, image-heavy feature slides

### TECHNICAL
**Concept**: Data → Clarity. Engineering aesthetic.
- **Background**: Dark (#0F1117 or #1E1E2E) or light (#F8F9FA)
- **Color use**: Functional only — green for success, red for error, blue for info
- **Typography**: Monospace for data/code (JetBrains Mono, Fira Code), sans for prose
- **Layout**: Grid-aligned, precise spacing, consistent rhythm
- **Details**: Borders not shadows, hairline dividers, minimal decoration
- **Slide density**: High — data tables, code snippets, precise metrics OK

### PLAYFUL
**Concept**: Energy and approachability.
- **Background**: Light with soft color pops, or vibrant with white content areas
- **Color use**: 3-4 colors. Bright, saturated. Use color for each section.
- **Typography**: Rounded fonts (Nunito, Quicksand, Plus Jakarta Sans)
- **Layout**: Rounded corners (16-24px), soft shadows, friendly proportions
- **Details**: Illustrations hints, emoji-like shapes, sticker-style badges
- **Slide density**: Low-medium. Bite-sized information.

---

## Font Pairing by Direction

| Direction | Display Font | Body Font | Notes |
|-----------|-------------|-----------|-------|
| minimal | None / Body only | DM Sans, Outfit | Single family |
| bold | Space Grotesk | Space Grotesk | Same family, weight contrast |
| luxury | Cormorant Garamond, Playfair Display | DM Sans | Serif + sans |
| editorial | Fraunces, Libre Baskerville | Bricolage Grotesque | Strong contrast |
| technical | N/A | JetBrains Mono, Geist Mono | Mono-first |
| playful | Nunito, Plus Jakarta Sans | Nunito | Rounded friendly |

**For Korean presentations**: Use Pretendard as the primary font for ALL directions.
It has weights from Thin to ExtraBold and supports all Korean + Latin.

---

## Layout System (1920×1080)

Think in terms of **web grid columns**. 1920px wide = 16 columns × (96px + 24px gap).

### Standard Content Area
- Left padding: 96px
- Right padding: 96px
- Top padding: 80px (below header)
- Bottom padding: 80px
- Content width: 1728px

### Header Bar
- Height: 128px (contains section label + heading)
- Full-width background

### Two-Column Grid
- Each column: ~816px
- Gap: 48px

### Full-Bleed Color Panels
- Left panel (hero/divider): 55% of width = 1056px
- Right panel: 45% = 864px

---

## Design Token → Figma Translation

| CSS concept | style-guide.json field | Figma API |
|------------|----------------------|-----------|
| `--color-primary` | `colors.primary` | `f.fills = solid(hex)` |
| `--font-heading` | `typography.heading1.fontFamily` | `t.fontName.family` |
| `--font-size-h1` | `typography.heading1.fontSize` | `t.fontSize` |
| `--line-height` | `typography.body.lineHeight` | `t.lineHeight` |
| `--letter-spacing` | `typography.heading1.letterSpacing` | `t.letterSpacing` |
| `--border-radius` | `layout.cornerRadius` | `r.cornerRadius` |
| `--spacing-lg` | `layout.contentPadding.left` | `f.x` offset |
| `--gap` | `layout.columnGap` | position calculation |

---

## Default Style (Fallback)

When no style-guide.json is available, use this clean minimal blue system:

```json
{
  "colors": {
    "primary": "#2D3FE0",
    "primaryDark": "#1A2699",
    "secondary": "#6B7FFF",
    "background": "#FFFFFF",
    "surface": "#F5F6FF",
    "text": {
      "primary": "#1A1A2E",
      "secondary": "#6B7280",
      "inverse": "#FFFFFF",
      "accent": "#2D3FE0"
    }
  },
  "typography": {
    "heading1": { "fontFamily": "Inter", "fontStyle": "Bold", "fontSize": 64, "lineHeight": 1.15, "letterSpacing": -1.5 },
    "heading2": { "fontFamily": "Inter", "fontStyle": "Bold", "fontSize": 48, "lineHeight": 1.2,  "letterSpacing": -1.0 },
    "heading3": { "fontFamily": "Inter", "fontStyle": "SemiBold", "fontSize": 28, "lineHeight": 1.3, "letterSpacing": -0.3 },
    "body":     { "fontFamily": "Inter", "fontStyle": "Regular", "fontSize": 18, "lineHeight": 1.6, "letterSpacing": 0 },
    "caption":  { "fontFamily": "Inter", "fontStyle": "Regular", "fontSize": 14, "lineHeight": 1.5, "letterSpacing": 0.2 },
    "display":  { "fontFamily": "Inter", "fontStyle": "Light", "fontSize": 52, "lineHeight": 1.4, "letterSpacing": -0.5 }
  },
  "layout": {
    "slideWidth": 1920, "slideHeight": 1080,
    "contentPadding": { "top": 80, "right": 96, "bottom": 80, "left": 96 },
    "headerHeight": 128, "columnGap": 48, "itemGap": 24,
    "cornerRadius": 12, "frameSpacing": 80
  },
  "aesthetic": { "direction": "minimal", "backgroundStyle": "solid", "motionStyle": "subtle" }
}
```

---

## Anti-Patterns (Never Do)

- Purple gradient on white background
- Inter Regular at 16px for everything
- Centered everything with no hierarchy
- Equal visual weight for all elements
- More than 3 colors in equal proportion
- Decorative shapes that don't serve the layout
- Same slide layout repeated 5+ times in a row
- Clip-art style icons or stock-photo aesthetics
