import { SlidesPlan, StyleGuide, ToneType, AudienceType } from '../types';

interface GeneratePlanOptions {
  apiKey: string;
  model: string;
  title: string;
  purpose: string;
  audience: AudienceType;
  tone: ToneType;
  content: string;
  slideCount: number | 'auto';
  style: StyleGuide;
}

const SYSTEM_PROMPT = `You are an expert presentation designer who creates visually stunning slide decks.
You think of each slide as a full-screen web section (1920×1080px) — like a landing page hero, feature section, stats dashboard, or testimonial block.

Your slides must have:
- Strong visual hierarchy
- Bold typographic choices
- Purposeful white space
- Data-driven structure when appropriate
- Clear narrative flow

You ALWAYS respond with valid JSON only. No markdown, no explanation — just the JSON object.`;

function buildUserPrompt(opts: GeneratePlanOptions): string {
  const slideCountInstruction =
    opts.slideCount === 'auto'
      ? 'Choose the optimal number of slides (typically 8-15) based on the content.'
      : `Create exactly ${opts.slideCount} slides.`;

  return `Create a Figma presentation slide plan with the following details:

**Title**: ${opts.title}
**Purpose**: ${opts.purpose}
**Target Audience**: ${opts.audience}
**Tone/Mood**: ${opts.tone}
**Slide Count**: ${slideCountInstruction}

**Content to present**:
${opts.content}

**Design Style Available**:
- Primary color: ${opts.style.colors.primary}
- Background: ${opts.style.colors.background}
- Aesthetic direction: ${opts.style.aesthetic.direction}
- Primary font: ${opts.style.typography.heading1.fontFamily}

**Available Slide Types**:
- HERO: Opening slide with title, subtitle, author, tagline, date
- AGENDA: Table of contents with numbered items
- DIVIDER: Section separator with sectionNumber, sectionTitle, description
- CONTENT: Article section with heading, body, bullets (max 5), optional imageHint
- TWO_COL: Two-column comparison with heading, leftCol {heading, bullets}, rightCol {heading, bullets}
- STATS: KPI dashboard with heading, stats array [{number, label, trend, description}] (2-4 stats)
- QUOTE: Full-page quote with quote text, attribution, role
- CLOSING: Final slide with tagline, heading, keyTakeaways (3-5 items), cta, contactInfo

**Required JSON structure**:
{
  "title": "string",
  "aesthetic": "${opts.tone}",
  "tone": "${opts.tone}",
  "audience": "${opts.audience}",
  "slideCount": number,
  "slides": [
    {
      "type": "HERO | AGENDA | DIVIDER | CONTENT | TWO_COL | STATS | QUOTE | CLOSING",
      "content": { ... type-specific fields ... }
    }
  ]
}

Rules:
1. Start with HERO, end with CLOSING
2. Use DIVIDER to separate major sections
3. Use STATS when presenting numbers/metrics
4. Use TWO_COL for comparisons
5. Use QUOTE for powerful statements
6. Keep text concise — slides are visual, not documents
7. Every bullet point should be punchy (under 10 words)
8. Return ONLY the JSON object, nothing else`;
}

export async function generateSlidesPlan(opts: GeneratePlanOptions): Promise<SlidesPlan> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(opts),
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    const msg = error?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Claude API error: ${msg}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude returned invalid JSON response');
  }

  try {
    const plan = JSON.parse(jsonMatch[0]) as SlidesPlan;
    return plan;
  } catch {
    throw new Error('Failed to parse slide plan from Claude response');
  }
}

export function buildDefaultStyle(tone: ToneType): StyleGuide {
  const palettes: Record<ToneType, StyleGuide['colors']> = {
    minimal: {
      primary: '#1A1A1A',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: { primary: '#1A1A1A', secondary: '#666666', inverse: '#FFFFFF', accent: '#1A1A1A' },
    },
    bold: {
      primary: '#FF3B00',
      background: '#0A0A0A',
      surface: '#1A1A1A',
      text: { primary: '#FFFFFF', secondary: '#999999', inverse: '#0A0A0A', accent: '#FF3B00' },
    },
    luxury: {
      primary: '#C9A96E',
      background: '#0D0D0D',
      surface: '#1A1A1A',
      text: { primary: '#F5F0E8', secondary: '#9A8A6E', inverse: '#0D0D0D', accent: '#C9A96E' },
    },
    editorial: {
      primary: '#2B2B2B',
      background: '#F8F6F1',
      surface: '#EEECE7',
      text: { primary: '#2B2B2B', secondary: '#6B6B6B', inverse: '#F8F6F1', accent: '#CC3333' },
    },
    technical: {
      primary: '#00D4FF',
      background: '#0F0F1A',
      surface: '#1A1A2E',
      text: { primary: '#E0E0E0', secondary: '#8888AA', inverse: '#0F0F1A', accent: '#00D4FF' },
    },
    playful: {
      primary: '#FF6B6B',
      background: '#FFF9F0',
      surface: '#FFF0E0',
      text: { primary: '#2D2D2D', secondary: '#777777', inverse: '#FFFFFF', accent: '#FF6B6B' },
    },
  };

  const fontMap: Record<ToneType, string> = {
    minimal: 'Inter',
    bold: 'Inter',
    luxury: 'Playfair Display',
    editorial: 'Georgia',
    technical: 'JetBrains Mono',
    playful: 'Inter',
  };

  const font = fontMap[tone];

  return {
    colors: palettes[tone],
    typography: {
      heading1: { fontFamily: font, fontStyle: 'Bold', fontSize: 72, lineHeight: 1.1, letterSpacing: -2 },
      heading2: { fontFamily: font, fontStyle: 'Bold', fontSize: 48, lineHeight: 1.2, letterSpacing: -1.2 },
      heading3: { fontFamily: font, fontStyle: 'SemiBold', fontSize: 30, lineHeight: 1.35, letterSpacing: -0.4 },
      body: { fontFamily: 'Inter', fontStyle: 'Regular', fontSize: 20, lineHeight: 1.65, letterSpacing: 0 },
      caption: { fontFamily: 'Inter', fontStyle: 'Regular', fontSize: 14, lineHeight: 1.5, letterSpacing: 0.1 },
      display: { fontFamily: font, fontStyle: 'Light', fontSize: 96, lineHeight: 1.0, letterSpacing: -3 },
    },
    layout: {
      slideWidth: 1920,
      slideHeight: 1080,
      contentPadding: { top: 72, right: 96, bottom: 72, left: 96 },
      headerHeight: 120,
      columnGap: 48,
      itemGap: 24,
      cornerRadius: 8,
      frameSpacing: 80,
    },
    aesthetic: {
      direction: tone,
      backgroundStyle: tone === 'minimal' || tone === 'editorial' ? 'solid' : 'solid',
      motionStyle: 'dynamic',
    },
  };
}
