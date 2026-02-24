# Slide Types Reference

Eight slide types, each modeled as a full-screen web section.
Each type has a "web analogy" to guide thinking about layout and hierarchy.

---

## 1. HERO
**Web analogy**: Landing page hero section
**Use when**: Opening slide, title slide, introduction

**Content fields**:
```json
{
  "type": "HERO",
  "content": {
    "title": "Product Vision 2025",
    "subtitle": "Redefining the Developer Workflow",
    "tagline": "CONFIDENTIAL — Q4 STRATEGY",
    "author": "Jane Lee, CTO",
    "date": "February 2025"
  }
}
```

**Layout**: Split composition — strong color block (left 55%) + lighter right panel.
Large display title on color block. Author/date at bottom. Decorative slide number overlay.

---

## 2. AGENDA
**Web analogy**: Table of contents / Navigation page
**Use when**: After hero if 4+ main sections. Shows roadmap of the presentation.

**Content fields**:
```json
{
  "type": "AGENDA",
  "content": {
    "heading": "Today's Agenda",
    "sectionLabel": "OVERVIEW",
    "items": [
      "Market Landscape",
      "Our Solution",
      "Technical Architecture",
      "Roadmap & Milestones",
      "Q&A"
    ]
  }
}
```

**Layout**: Left accent stripe. Numbered items (01, 02...) with vertical dividers.
Each item takes full width, spaced generously.

---

## 3. CONTENT
**Web analogy**: Article / blog section
**Use when**: Single topic with text, bullets, or body copy. Optionally with image placeholder.

**Content fields**:
```json
{
  "type": "CONTENT",
  "content": {
    "sectionLabel": "THE PROBLEM",
    "heading": "Why Current Solutions Fall Short",
    "body": "Optional paragraph text for context or framing.",
    "bullets": [
      "70% of developers lose 2+ hours/day to tooling friction",
      "Fragmented workflows reduce team velocity by 40%",
      "Existing tools weren't designed for modern AI-assisted development"
    ],
    "imageHint": "diagram showing fragmented workflow"
  }
}
```

**Layout**: Full-width header bar with section label + heading. Content area below.
If `imageHint` present: text left (55%), image placeholder right (40%).

---

## 4. TWO_COL
**Web analogy**: Feature comparison / side-by-side section
**Use when**: Comparing two options, showing before/after, splitting complementary points.

**Content fields**:
```json
{
  "type": "TWO_COL",
  "content": {
    "sectionLabel": "ARCHITECTURE",
    "heading": "How It Works",
    "leftCol": {
      "heading": "AI Layer",
      "body": "Optional intro paragraph.",
      "bullets": [
        "Context-aware code completion",
        "Real-time error detection",
        "Natural language → code"
      ]
    },
    "rightCol": {
      "heading": "Data Layer",
      "body": null,
      "bullets": [
        "Unified codebase indexing",
        "Sub-50ms query latency",
        "Zero-trust security model"
      ]
    }
  }
}
```

**Layout**: Header bar (same as CONTENT). Two equal cards below with accent left borders.

---

## 5. STATS
**Web analogy**: Metrics dashboard / KPI section
**Use when**: Showing 2-4 key numbers, metrics, or data points that need emphasis.

**Content fields**:
```json
{
  "type": "STATS",
  "content": {
    "sectionLabel": "TRACTION",
    "heading": "Numbers That Matter",
    "stats": [
      { "number": "$12.4M", "label": "ARR",          "trend": "+43% YoY",   "description": "Annual recurring revenue" },
      { "number": "94%",    "label": "Retention",    "trend": "+8 pts",     "description": "12-month logo retention" },
      { "number": "340ms",  "label": "Avg. Response", "trend": "↓ 60%",    "description": "vs. 840ms last quarter" },
      { "number": "4.8★",   "label": "G2 Rating",    "trend": null,         "description": "Based on 1,200 reviews" }
    ]
  }
}
```

**Layout**: Header bar. 2-4 cards in a horizontal row, each with big number, trend, label, description.

---

## 6. QUOTE
**Web analogy**: Full-page testimonial / blockquote section
**Use when**: Highlighting a powerful quote, testimonial, or key statement. Best for inspirational/formal tone.

**Content fields**:
```json
{
  "type": "QUOTE",
  "content": {
    "quote": "Every company will be a software company. Every company will need to embed AI into their workflows or be replaced by one that does.",
    "attribution": "Satya Nadella",
    "role": "CEO, Microsoft",
    "background": null
  }
}
```

**Layout**: Full-bleed primary color background. Giant decorative quote mark. Centered quote text (large display). Attribution below horizontal rule.

---

## 7. DIVIDER
**Web analogy**: Chapter break / section transition
**Use when**: Separating major sections of a long presentation (6+ slides). Creates visual breathing room.

**Content fields**:
```json
{
  "type": "DIVIDER",
  "content": {
    "sectionNumber": 2,
    "sectionTitle": "Our Solution",
    "description": "How we solve the fragmentation problem"
  }
}
```

**Layout**: Split composition — color panel left (with giant section number as watermark), content right (section title + description).

---

## 8. CLOSING
**Web analogy**: Footer / CTA section
**Use when**: Final slide. Thank you, key takeaways, next steps, or contact info.

**Content fields**:
```json
{
  "type": "CLOSING",
  "content": {
    "tagline": "THANK YOU",
    "heading": "Let's Build Together",
    "subheading": "Ready to transform your development workflow?",
    "keyTakeaways": [
      "Market opportunity: $4.2T by 2027",
      "Proven traction: 94% retention, $12.4M ARR",
      "Series B raising $24M for global expansion"
    ],
    "cta": "Schedule a demo → hello@company.com",
    "contactInfo": "www.company.com · @company"
  }
}
```

**Layout**: Full-bleed primary color. Decorative circles (like CSS radial-gradient bubbles). Left: tagline + heading + subheading. Right: key takeaways list. Bottom: contact/CTA.

---

## Slide Selection Rules

```
Minimum deck (5 slides):    HERO → CONTENT → CONTENT → STATS → CLOSING
Standard deck (8-10 slides): HERO → AGENDA → DIVIDER → CONTENT × 3 → STATS → QUOTE → CLOSING
Long deck (12+ slides):      Add DIVIDER between sections, TWO_COL for comparisons
```

## Content Field Optionality

All content fields except the primary title/heading are optional.
The slide templates gracefully handle missing fields — they simply don't render that element.
