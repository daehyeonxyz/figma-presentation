# Tone → Aesthetic Direction Guide

Maps user-provided tone/mood to concrete design decisions.

---

## Tone Mapping Table

| User Tone | Aesthetic Direction | Slide Count | Density | Key Characteristics |
|-----------|-------------------|-------------|---------|---------------------|
| formal | luxury or bold | 10-16 | Medium | Dark palette, serif accents, structured |
| minimal | minimal | 6-10 | Low | Vast whitespace, single accent, restrained |
| bold | bold | 8-12 | Medium-High | Full-bleed color, oversized type |
| technical | technical | 10-20 | High | Data tables, code, precise metrics |
| inspirational | luxury or editorial | 8-14 | Low-Medium | Story arc, quotes, emotional beats |
| casual | playful | 6-10 | Low | Friendly type, rounded shapes, warm colors |
| academic | minimal or technical | 12-20 | High | Evidence-based, citations, data-heavy |
| startup | bold or editorial | 8-12 | Medium | Energy, traction metrics, future vision |
| educational | playful or minimal | 8-16 | Medium | Clear steps, visual hierarchy, examples |

---

## Audience → Density Adjustment

| Audience | Density modifier | Notes |
|----------|-----------------|-------|
| executives | -20% bullets | Less text, bigger numbers, clear headlines |
| engineers | +20% bullets | More detail, code/data OK, precise language |
| customers | -30% bullets | Benefits-focused, visuals-heavy, short copy |
| students | neutral | Clear structure, examples welcome |
| general | -10% bullets | Accessible language, visual storytelling |

---

## Tone → Slide Type Preferences

### Formal
- More `DIVIDER` slides (clear section structure)
- `QUOTE` from authority figures
- `STATS` with precise numbers
- Fewer `TWO_COL` (prefer clean single-column `CONTENT`)

### Minimal
- Skip `AGENDA` unless 8+ slides
- Prefer `CONTENT` with 2-3 bullets (not 7)
- One `STATS` slide with 2-3 BIG numbers (not 4 small ones)
- `QUOTE` only if genuinely powerful

### Bold
- More `STATS` with single giant number per card
- `HERO` with dramatic color split
- `DIVIDER` as full visual breaks
- `TWO_COL` for sharp contrasts

### Technical
- More `CONTENT` slides with code/data bullets
- `STATS` with precise decimal numbers
- Skip `QUOTE` (unless a key insight)
- May include a "Architecture" `TWO_COL` and "Results" `STATS`

### Inspirational
- More `QUOTE` slides (1-2 per presentation is fine)
- Story arc: Problem (`CONTENT`) → Transformation (`QUOTE`) → Vision (`CLOSING`)
- `STATS` for proof points (fewer, bigger numbers)
- `HERO` with tagline as the key message

### Casual / Playful
- Fewer `DIVIDER` slides (keep it flowing)
- `AGENDA` with friendly item names (not all-caps)
- `CONTENT` with short bullets (5 words max each)
- `CLOSING` with warm CTA

---

## Slide Count by Use Case

| Use case | Recommended count | Time estimate |
|----------|------------------|---------------|
| 5-minute pitch | 6-8 slides | 30-45 sec per slide |
| 10-minute overview | 8-12 slides | 50-75 sec per slide |
| 20-minute presentation | 12-16 slides | 75-100 sec per slide |
| 45-minute deep-dive | 20-30 slides | 90-135 sec per slide |
| Leave-behind deck | 10-20 slides | Self-navigated |

---

## Color Tone Mapping

| Tone | Primary color suggestions | Background | Text |
|------|--------------------------|------------|------|
| formal | Deep navy #1A237E, Forest #1B5E20 | White or dark | Dark or inverse |
| minimal | Single accent — indigo, sage, or burnt orange | #FFFFFF | #1A1A2E |
| bold | Electric blue #0050FF, Vivid red #E53935 | Color block + white | Inverse on color |
| technical | Steel blue #1565C0, Terminal green #00BCD4 | Dark #0F1117 or light | Respective |
| inspirational | Warm gold #F59E0B, Deep purple #6B21A8 | Dark luxury or warm white | High contrast |
| casual | Coral #FF6B6B, Teal #06B6D4, Amber #FBBF24 | Light + color pops | Dark |

---

## Auto Slide Count Logic

When user says "auto", calculate:
1. Count main content sections in their outline
2. Each section gets: 1 `CONTENT` or `TWO_COL` + optional `STATS`
3. Add: 1 `HERO` + 1 `AGENDA` (if 4+ sections) + `DIVIDER` per section + 1 `CLOSING`
4. Add: 1 `QUOTE` for inspirational/formal tone

Formula: `2 + sections × 1.5 + extras`
- 2 sections → 6 slides
- 4 sections → 9 slides
- 6 sections → 13 slides
