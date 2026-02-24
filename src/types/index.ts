// ============================================================
// Shared Types between UI and Plugin
// ============================================================

export type SlideType =
  | 'HERO'
  | 'AGENDA'
  | 'CONTENT'
  | 'TWO_COL'
  | 'STATS'
  | 'QUOTE'
  | 'DIVIDER'
  | 'CLOSING';

export type ToneType =
  | 'minimal'
  | 'bold'
  | 'luxury'
  | 'editorial'
  | 'technical'
  | 'playful';

export type AudienceType =
  | 'executives'
  | 'engineers'
  | 'customers'
  | 'general';

// ── Slide Content Types ──────────────────────────────────────

export interface HeroContent {
  title: string;
  subtitle: string;
  tagline?: string;
  author?: string;
  date?: string;
}

export interface AgendaContent {
  heading: string;
  sectionLabel?: string;
  items: string[];
}

export interface ContentSlide {
  sectionLabel?: string;
  heading: string;
  body?: string;
  bullets?: string[];
  imageHint?: string;
}

export interface TwoColContent {
  sectionLabel?: string;
  heading: string;
  leftCol: { heading: string; body?: string; bullets?: string[] };
  rightCol: { heading: string; body?: string; bullets?: string[] };
}

export interface StatItem {
  number: string;
  label: string;
  trend?: string | null;
  description?: string;
}

export interface StatsContent {
  sectionLabel?: string;
  heading: string;
  stats: StatItem[];
}

export interface QuoteContent {
  quote: string;
  attribution: string;
  role?: string;
  background?: string | null;
}

export interface DividerContent {
  sectionNumber: number;
  sectionTitle: string;
  description?: string;
}

export interface ClosingContent {
  tagline?: string;
  heading: string;
  subheading?: string;
  keyTakeaways?: string[];
  cta?: string;
  contactInfo?: string;
}

export type SlideContent =
  | HeroContent
  | AgendaContent
  | ContentSlide
  | TwoColContent
  | StatsContent
  | QuoteContent
  | DividerContent
  | ClosingContent;

// ── Slide Plan ────────────────────────────────────────────────

export interface Slide {
  type: SlideType;
  content: SlideContent;
}

export interface SlidesPlan {
  title: string;
  aesthetic: ToneType;
  tone: string;
  audience: AudienceType;
  slideCount: number;
  slides: Slide[];
}

// ── Style Guide ──────────────────────────────────────────────

export interface TypoStyle {
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface StyleGuide {
  colors: {
    primary: string;
    primaryDark?: string;
    secondary?: string;
    background: string;
    surface: string;
    surfaceAlt?: string;
    text: {
      primary: string;
      secondary: string;
      inverse: string;
      accent?: string;
    };
    extras?: Array<{ name: string; hex: string }>;
  };
  typography: {
    heading1: TypoStyle;
    heading2: TypoStyle;
    heading3: TypoStyle;
    body: TypoStyle;
    caption: TypoStyle;
    display: TypoStyle;
  };
  layout: {
    slideWidth: number;
    slideHeight: number;
    contentPadding: { top: number; right: number; bottom: number; left: number };
    headerHeight: number;
    columnGap: number;
    itemGap: number;
    cornerRadius: number;
    frameSpacing: number;
  };
  aesthetic: {
    direction: ToneType;
    backgroundStyle: 'solid' | 'gradient' | 'mesh';
    motionStyle?: string;
  };
}

// ── Messages between UI ↔ Plugin ────────────────────────────

export type MessageToPlugin =
  | { type: 'GENERATE_SLIDES'; plan: SlidesPlan; style: StyleGuide }
  | { type: 'CANCEL' }
  | { type: 'RESIZE'; width: number; height: number };

export type MessageToUI =
  | { type: 'PROGRESS'; message: string; percent: number }
  | { type: 'DONE'; slideCount: number }
  | { type: 'ERROR'; message: string };

// ── UI State ─────────────────────────────────────────────────

export interface AppSettings {
  apiKey: string;
  model: string;
}

export const CLAUDE_MODELS = [
  { id: 'claude-opus-4-5', label: 'Claude Opus 4.5 (Most Powerful)' },
  { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (Recommended)' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (Fastest)' },
  { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
] as const;
