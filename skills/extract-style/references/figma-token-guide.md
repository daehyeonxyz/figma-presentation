# Figma Token Extraction Guide

Reference for interpreting Figma MCP output and mapping to style-guide.json fields.

## Reading get_variable_defs Output

Variable names often follow patterns like:
- `color/primary` → `colors.primary`
- `color/text/primary` → `colors.text.primary`
- `spacing/md` → layout gap values
- `radius/card` → `layout.cornerRadius`
- `font/heading/size` → `typography.heading1.fontSize`

If variables exist, **prefer them** over visual inference — they are the source of truth.

## Reading get_design_context Output

The design context includes:
- `fills`: Array of fill objects. `SOLID` fills have `color: {r, g, b}` (0-1 range).
  - Convert to hex: `Math.round(r*255).toString(16).padStart(2,'0')`
- `strokes`: Border colors
- `effects`: Shadow/blur definitions
- `fontName`: `{family: "Inter", style: "Bold"}`
- `fontSize`: Number in px
- `lineHeightPx` / `lineHeightPercent`: Line height

## Common Node Naming Patterns

| Node name pattern | Likely contains |
|-------------------|----------------|
| "Colors", "Palette" | Color definitions |
| "Typography", "Fonts", "Text Styles" | Type scale |
| "Components", "UI Kit" | Component samples |
| "Brand", "Identity" | Primary brand colors |
| "Cover", "Hero" | Main brand aesthetic |
| "Spacing", "Grid" | Layout tokens |

## Default Fallback Values

If a token cannot be extracted, use these defaults:

```json
{
  "colors": {
    "primary":    "#2D3FE0",
    "primaryDark":"#1A2699",
    "secondary":  "#6B7FFF",
    "background": "#FFFFFF",
    "surface":    "#F5F6FF",
    "surfaceAlt": "#ECEFFE",
    "text": {
      "primary":   "#1A1A2E",
      "secondary": "#6B7280",
      "inverse":   "#FFFFFF",
      "accent":    "#2D3FE0"
    }
  },
  "typography": {
    "heading1": { "fontFamily": "Inter", "fontStyle": "Bold",    "fontSize": 64, "lineHeight": 1.15, "letterSpacing": -1.5 },
    "heading2": { "fontFamily": "Inter", "fontStyle": "Bold",    "fontSize": 48, "lineHeight": 1.2,  "letterSpacing": -1.0 },
    "heading3": { "fontFamily": "Inter", "fontStyle": "SemiBold","fontSize": 28, "lineHeight": 1.3,  "letterSpacing": -0.3 },
    "body":     { "fontFamily": "Inter", "fontStyle": "Regular", "fontSize": 18, "lineHeight": 1.6,  "letterSpacing": 0    },
    "caption":  { "fontFamily": "Inter", "fontStyle": "Regular", "fontSize": 14, "lineHeight": 1.5,  "letterSpacing": 0.2  },
    "display":  { "fontFamily": "Inter", "fontStyle": "Light",   "fontSize": 52, "lineHeight": 1.4,  "letterSpacing": -0.5 }
  },
  "layout": {
    "slideWidth":  1920,
    "slideHeight": 1080,
    "contentPadding": { "top": 80, "right": 96, "bottom": 80, "left": 96 },
    "headerHeight": 128,
    "columnGap":    48,
    "itemGap":      24,
    "cornerRadius": 12,
    "frameSpacing": 80
  }
}
```

## Korean Font Recommendations

If the design uses Korean text or Pretendard:
- `heading1/2`: `{ "fontFamily": "Pretendard", "fontStyle": "ExtraBold" }`
- `heading3`: `{ "fontFamily": "Pretendard", "fontStyle": "SemiBold" }`
- `body`: `{ "fontFamily": "Pretendard", "fontStyle": "Regular" }`

Pretendard must be installed in Figma. Alternative: `Noto Sans KR`.

## Color Conversion Helper

Figma RGB (0-1) → Hex:
```js
function toHex(r, g, b) {
  return '#' + [r, g, b].map(v =>
    Math.round(v * 255).toString(16).padStart(2, '0')
  ).join('');
}
```

## Confidence Score Calculation

Rate 0.0 - 1.0 based on:
- Found primary color: +0.2
- Found secondary color: +0.1
- Found background: +0.1
- Found at least heading1 + body fonts: +0.2
- Found layout padding values: +0.1
- Found design variables (not inferred): +0.2
- Found heading2 and heading3: +0.1

Max = 1.0. Score < 0.5 = warn user about low confidence.
