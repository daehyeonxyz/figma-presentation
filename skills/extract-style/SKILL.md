---
name: extract-style
description: Extract design tokens from an existing Figma file and save as style-guide.json. Use when the user provides a Figma URL and wants to analyze the design system, capture colors/typography/layout tokens, or prepare a style guide before generating a presentation. Triggered by phrases like "extract style", "analyze Figma file", "capture design tokens", "get style guide from URL".
disable-model-invocation: true
allowed-tools: Read, Write, Bash
argument-hint: <figma-file-url>
---

# Extract Style Skill

Extract the complete design style guide from a Figma file and save it as `style-guide.json`.
This is the first step before running `/figma-ppt` to generate a presentation.

## Arguments

User invoked with: $ARGUMENTS

Parse the Figma URL from $ARGUMENTS:
- File key: the segment after `/design/` or `/file/` (e.g. `ABC123XYZ`)
- Node ID: the `node-id` query parameter, converting `-` to `:` (e.g. `0-1` → `0:1`)
- If no node-id given, default to `0:1` (first page)

## Step 1: Discover File Structure

Use `get_metadata` with the extracted fileKey and nodeId to understand:
- Page names and structure
- Top-level frame names (look for "components", "brand", "design system", "tokens")
- Identify 3-5 most informative nodes (component libraries, style guides, brand pages)

## Step 2: Extract Design Context

Run these Figma MCP calls in order:

1. **`get_design_context`** on the top 3-5 informative nodes:
   - Priority: frames named "color", "style", "typography", "brand", "components"
   - Look for nodes with diverse fills, text at multiple sizes, cards/buttons

2. **`get_variable_defs`** on the root node (`0:1`):
   - Extracts all CSS-like design variables (colors, spacing, radii, typography)
   - These are the most reliable tokens — prefer them over visual inference

3. **`get_screenshot`** on one representative frame:
   - Visual confirmation of the overall aesthetic direction
   - Note: dominant colors, light vs dark theme, serif vs sans-serif

## Step 3: Infer Aesthetic Direction

From the extracted data, classify the design into one of these directions:

| Direction | Signals |
|-----------|---------|
| `minimal` | Low color density, large whitespace, small accents |
| `bold` | High contrast, large typography, strong color blocks |
| `luxury` | Dark backgrounds, gold/cream accents, refined spacing |
| `editorial` | Mixed type scales, asymmetric layouts, editorial imagery |
| `technical` | Monospace fonts, grid-heavy, data-dense, cool palette |
| `playful` | Rounded corners, bright colors, friendly type |
| `brutalist` | Raw grid, high contrast B&W, no decorative elements |
| `retro` | Warm palette, serif or slab fonts, textured backgrounds |

## Step 4: Synthesize Style Guide

Map extracted data to semantic roles:

### Colors (map to semantic roles)
- Most-used fill on non-background frames → `primary`
- Second accent color → `secondary`
- Dominant frame/page background → `background`
- Card/panel background (slightly offset) → `surface`
- Main text color → `text.primary`
- Muted/label text → `text.secondary`
- Text on dark/colored backgrounds → `text.inverse`
- Darkened variant of primary → `primaryDark`

### Typography (map to semantic roles)
- Largest text on title frames → `heading1`
- Second-largest heading → `heading2`
- Sub-heading / card titles → `heading3`
- Paragraph / body text → `body`
- Labels / footnotes / small text → `caption`
- Hero / oversized display → `display` (if present)

### Layout (from frame dimensions and padding)
- Most common frame width → `slideWidth` (target: 1920)
- Most common frame height → `slideHeight` (target: 1080)
- Consistent inner padding → `contentPadding` (top/right/bottom/left)
- Element-to-element vertical gap → `itemGap`
- Column gap in multi-column layouts → `columnGap`
- Border radius on cards/buttons → `cornerRadius`

## Step 5: Write style-guide.json

Write the synthesized data to `./style-guide.json`.

The file must follow the schema at `schemas/style-guide.schema.json`.
Include the `aesthetic` section with inferred `direction` and `backgroundStyle`.

Example output structure:
```json
{
  "meta": {
    "sourceFileKey": "ABC123XYZ",
    "sourceFileName": "Brand Design System",
    "extractedAt": "2025-02-24T14:30:00Z",
    "confidence": 0.85,
    "notes": "heading3 not found — using heading2 scaled down"
  },
  "colors": { ... },
  "typography": { ... },
  "layout": { ... },
  "aesthetic": {
    "direction": "luxury",
    "backgroundStyle": "gradient",
    "motionStyle": "subtle"
  }
}
```

## Step 6: Report to User

After saving, report:
1. What was extracted: list colors, fonts, layout values found
2. Confidence score and any gaps
3. Aesthetic direction inferred
4. Next step: "Run `/figma-ppt` to generate a presentation using this style"

## Error Handling

- **No node-id in URL**: Use `0:1` (first page root)
- **Sparse tokens**: Note in `meta.notes`, use sensible defaults
- **Font not common**: Default to system-available fonts, note in output
- **File inaccessible**: Ask user to verify Figma MCP connection and file permissions

## Reference

See [references/figma-token-guide.md](references/figma-token-guide.md) for:
- How to read Figma node data structures
- Common design token patterns
- Default fallback values for each field
