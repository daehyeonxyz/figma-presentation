/// <reference types="@figma/plugin-typings" />

import {
  MessageToPlugin,
  MessageToUI,
  SlidesPlan,
  StyleGuide,
  Slide,
  HeroContent,
  AgendaContent,
  ContentSlide,
  TwoColContent,
  StatsContent,
  QuoteContent,
  DividerContent,
  ClosingContent,
} from '../types';

// ── Show UI ──────────────────────────────────────────────────
figma.showUI(__html__, { width: 480, height: 720, title: 'Figma Presentation' });

// ── Message Handler ──────────────────────────────────────────
figma.ui.onmessage = async (msg: MessageToPlugin) => {
  if (msg.type === 'GENERATE_SLIDES') {
    try {
      await generatePresentation(msg.plan, msg.style);
    } catch (err: unknown) {
      const error = err as Error;
      sendToUI({ type: 'ERROR', message: error.message || 'Unknown error occurred' });
    }
  } else if (msg.type === 'RESIZE') {
    figma.ui.resize(msg.width, msg.height);
  } else if (msg.type === 'CANCEL') {
    figma.closePlugin();
  }
};

function sendToUI(msg: MessageToUI) {
  figma.ui.postMessage(msg);
}

// ── Helpers ───────────────────────────────────────────────────

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
  };
}

function solid(hex: string): SolidPaint {
  return { type: 'SOLID', color: hexToRgb(hex) };
}

function solidWithOpacity(hex: string, opacity: number): SolidPaint {
  return { type: 'SOLID', color: hexToRgb(hex), opacity };
}

function makeFrame(name: string, w: number, h: number): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.clipsContent = true;
  return f;
}

async function loadFont(family: string, style: string): Promise<void> {
  try {
    await figma.loadFontAsync({ family, style });
  } catch {
    // Fallback to Inter Regular if font not found
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  }
}

async function addText(
  parent: FrameNode | GroupNode,
  content: string,
  opts: {
    fontFamily: string;
    fontStyle: string;
    fontSize: number;
    color: string;
    x: number;
    y: number;
    width: number;
    lineHeight?: number;
    letterSpacing?: number;
    align?: 'LEFT' | 'CENTER' | 'RIGHT';
  }
): Promise<TextNode> {
  await loadFont(opts.fontFamily, opts.fontStyle);
  const t = figma.createText();
  parent.appendChild(t);
  t.fontName = { family: opts.fontFamily, style: opts.fontStyle };
  t.fontSize = opts.fontSize;
  t.fills = [solid(opts.color)];
  t.characters = content;
  t.textAlignHorizontal = opts.align || 'LEFT';
  t.resize(opts.width, t.height);
  t.x = opts.x;
  t.y = opts.y;
  if (opts.lineHeight) {
    t.lineHeight = { value: opts.lineHeight * 100, unit: 'PERCENT' };
  }
  if (opts.letterSpacing !== undefined) {
    t.letterSpacing = { value: opts.letterSpacing, unit: 'PIXELS' };
  }
  t.textAutoResize = 'HEIGHT';
  return t;
}

function addRect(
  parent: FrameNode,
  x: number,
  y: number,
  w: number,
  h: number,
  fillHex: string,
  radius: number = 0,
  opacity: number = 1
): RectangleNode {
  const r = figma.createRectangle();
  parent.appendChild(r);
  r.x = x;
  r.y = y;
  r.resize(w, h);
  r.fills = [solidWithOpacity(fillHex, opacity)];
  r.cornerRadius = radius;
  return r;
}

// ── Main Generator ───────────────────────────────────────────

async function generatePresentation(plan: SlidesPlan, style: StyleGuide): Promise<void> {
  const W = style.layout.slideWidth;
  const H = style.layout.slideHeight;
  const PAD_H = style.layout.contentPadding.left;
  const PAD_V = style.layout.contentPadding.top;
  const SPACING = style.layout.frameSpacing;

  // Create a new page
  const page = figma.createPage();
  page.name = plan.title;
  figma.currentPage = page;

  const total = plan.slides.length;

  for (let i = 0; i < plan.slides.length; i++) {
    const slide = plan.slides[i];
    const progress = Math.round(((i + 1) / total) * 100);
    sendToUI({
      type: 'PROGRESS',
      message: `Creating slide ${i + 1}/${total}: ${slide.type}`,
      percent: progress,
    });

    const frame = makeFrame(`${String(i + 1).padStart(2, '0')} — ${slide.type}`, W, H);
    frame.x = i * (W + SPACING);
    frame.y = 0;
    page.appendChild(frame);

    await renderSlide(frame, slide, style, i + 1);
  }

  // Zoom to fit
  figma.viewport.scrollAndZoomIntoView(page.children as readonly SceneNode[]);

  sendToUI({ type: 'DONE', slideCount: plan.slides.length });
}

async function renderSlide(
  frame: FrameNode,
  slide: Slide,
  style: StyleGuide,
  index: number
): Promise<void> {
  switch (slide.type) {
    case 'HERO':
      await renderHero(frame, slide.content as HeroContent, style);
      break;
    case 'AGENDA':
      await renderAgenda(frame, slide.content as AgendaContent, style);
      break;
    case 'CONTENT':
      await renderContent(frame, slide.content as ContentSlide, style);
      break;
    case 'TWO_COL':
      await renderTwoCol(frame, slide.content as TwoColContent, style);
      break;
    case 'STATS':
      await renderStats(frame, slide.content as StatsContent, style);
      break;
    case 'QUOTE':
      await renderQuote(frame, slide.content as QuoteContent, style);
      break;
    case 'DIVIDER':
      await renderDivider(frame, slide.content as DividerContent, style, index);
      break;
    case 'CLOSING':
      await renderClosing(frame, slide.content as ClosingContent, style);
      break;
  }
}

// ── Slide Renderers ──────────────────────────────────────────

async function renderHero(frame: FrameNode, c: HeroContent, s: StyleGuide): Promise<void> {
  const W = s.layout.slideWidth;
  const H = s.layout.slideHeight;
  const PAD = s.layout.contentPadding.left;

  // Background
  frame.fills = [solid(s.colors.background)];

  // Accent strip (left side)
  addRect(frame, 0, 0, 8, H, s.colors.primary);

  // Large accent circle (decorative)
  const circle = figma.createEllipse();
  frame.appendChild(circle);
  circle.resize(600, 600);
  circle.x = W - 500;
  circle.y = H - 500;
  circle.fills = [solidWithOpacity(s.colors.primary, 0.07)];

  // Tagline
  if (c.tagline) {
    const tagY = H * 0.25;
    const tag = await addText(frame, c.tagline, {
      fontFamily: 'Inter',
      fontStyle: 'Medium',
      fontSize: s.layout.contentPadding.top <= 60 ? 13 : 14,
      color: s.colors.primary,
      x: PAD,
      y: tagY,
      width: W - PAD * 2,
      letterSpacing: 2,
    });
    tag.name = 'tagline';
  }

  // Title
  const titleY = H * 0.35;
  const title = await addText(frame, c.title, {
    fontFamily: s.typography.heading1.fontFamily,
    fontStyle: s.typography.heading1.fontStyle,
    fontSize: s.typography.heading1.fontSize,
    color: s.colors.text.primary,
    x: PAD,
    y: titleY,
    width: W * 0.7,
    lineHeight: s.typography.heading1.lineHeight,
    letterSpacing: s.typography.heading1.letterSpacing,
  });
  title.name = 'title';

  // Subtitle
  if (c.subtitle) {
    const subtitleY = titleY + (s.typography.heading1.fontSize * s.typography.heading1.lineHeight) + 24;
    await addText(frame, c.subtitle, {
      fontFamily: s.typography.heading2.fontFamily,
      fontStyle: 'Regular',
      fontSize: 32,
      color: s.colors.text.secondary,
      x: PAD,
      y: subtitleY,
      width: W * 0.6,
      lineHeight: 1.3,
    });
  }

  // Divider line
  addRect(frame, PAD, H * 0.75, 80, 3, s.colors.primary);

  // Author & Date
  const metaY = H * 0.77;
  if (c.author) {
    await addText(frame, c.author, {
      fontFamily: 'Inter',
      fontStyle: 'Medium',
      fontSize: 18,
      color: s.colors.text.primary,
      x: PAD,
      y: metaY,
      width: 400,
    });
  }
  if (c.date) {
    await addText(frame, c.date, {
      fontFamily: 'Inter',
      fontStyle: 'Regular',
      fontSize: 16,
      color: s.colors.text.secondary,
      x: PAD,
      y: metaY + 28,
      width: 300,
    });
  }
}

async function renderAgenda(frame: FrameNode, c: AgendaContent, s: StyleGuide): Promise<void> {
  const W = s.layout.slideWidth;
  const H = s.layout.slideHeight;
  const PAD = s.layout.contentPadding.left;

  frame.fills = [solid(s.colors.background)];

  // Left accent bar
  addRect(frame, 0, 0, 6, H, s.colors.primary);

  // Section label
  if (c.sectionLabel) {
    await addText(frame, c.sectionLabel, {
      fontFamily: 'Inter',
      fontStyle: 'Medium',
      fontSize: 13,
      color: s.colors.primary,
      x: PAD,
      y: PAD,
      width: 400,
      letterSpacing: 2,
    });
  }

  // Heading
  await addText(frame, c.heading, {
    fontFamily: s.typography.heading2.fontFamily,
    fontStyle: s.typography.heading2.fontStyle,
    fontSize: s.typography.heading2.fontSize,
    color: s.colors.text.primary,
    x: PAD,
    y: PAD + (c.sectionLabel ? 36 : 0),
    width: W * 0.4,
    letterSpacing: s.typography.heading2.letterSpacing,
  });

  // Agenda items
  const itemStartY = H * 0.3;
  const itemHeight = (H * 0.55) / Math.max(c.items.length, 1);

  for (let i = 0; i < c.items.length; i++) {
    const y = itemStartY + i * Math.min(itemHeight, 90);

    // Number
    await addText(frame, String(i + 1).padStart(2, '0'), {
      fontFamily: 'Inter',
      fontStyle: 'Light',
      fontSize: 36,
      color: s.colors.primary,
      x: PAD,
      y: y,
      width: 80,
    });

    // Item text
    await addText(frame, c.items[i], {
      fontFamily: s.typography.heading3.fontFamily,
      fontStyle: 'Regular',
      fontSize: 28,
      color: s.colors.text.primary,
      x: PAD + 80,
      y: y + 6,
      width: W * 0.55,
    });

    // Divider line
    if (i < c.items.length - 1) {
      addRect(frame, PAD, y + 52, W - PAD * 2, 1, s.colors.text.secondary, 0, 0.2);
    }
  }
}

async function renderContent(frame: FrameNode, c: ContentSlide, s: StyleGuide): Promise<void> {
  const W = s.layout.slideWidth;
  const H = s.layout.slideHeight;
  const PAD = s.layout.contentPadding.left;

  frame.fills = [solid(s.colors.background)];
  addRect(frame, 0, 0, 6, H, s.colors.primary);

  let y = s.layout.contentPadding.top;

  // Section label
  if (c.sectionLabel) {
    await addText(frame, c.sectionLabel, {
      fontFamily: 'Inter',
      fontStyle: 'Medium',
      fontSize: 13,
      color: s.colors.primary,
      x: PAD,
      y,
      width: 500,
      letterSpacing: 2,
    });
    y += 32;
  }

  // Heading
  const headingNode = await addText(frame, c.heading, {
    fontFamily: s.typography.heading2.fontFamily,
    fontStyle: s.typography.heading2.fontStyle,
    fontSize: s.typography.heading2.fontSize,
    color: s.colors.text.primary,
    x: PAD,
    y,
    width: W * 0.55,
    lineHeight: s.typography.heading2.lineHeight,
    letterSpacing: s.typography.heading2.letterSpacing,
  });
  y += headingNode.height + 32;

  // Body text
  if (c.body) {
    const bodyNode = await addText(frame, c.body, {
      fontFamily: 'Inter',
      fontStyle: 'Regular',
      fontSize: s.typography.body.fontSize,
      color: s.colors.text.secondary,
      x: PAD,
      y,
      width: W * 0.5,
      lineHeight: s.typography.body.lineHeight,
    });
    y += bodyNode.height + 32;
  }

  // Bullets
  if (c.bullets && c.bullets.length > 0) {
    for (const bullet of c.bullets) {
      // Bullet dot
      addRect(frame, PAD, y + 10, 6, 6, s.colors.primary, 3);

      await addText(frame, bullet, {
        fontFamily: 'Inter',
        fontStyle: 'Regular',
        fontSize: s.typography.body.fontSize,
        color: s.colors.text.primary,
        x: PAD + 20,
        y,
        width: W * 0.5 - 20,
        lineHeight: 1.5,
      });
      y += s.typography.body.fontSize * 1.5 + s.layout.itemGap;
    }
  }

  // Image placeholder (right side)
  if (c.imageHint !== null) {
    const imgX = W * 0.6;
    const imgW = W * 0.35;
    addRect(frame, imgX, s.layout.contentPadding.top, imgW, H - s.layout.contentPadding.top * 2, s.colors.surface, s.layout.cornerRadius);

    // Image hint text
    await addText(frame, c.imageHint || 'Image / Visual', {
      fontFamily: 'Inter',
      fontStyle: 'Regular',
      fontSize: 16,
      color: s.colors.text.secondary,
      x: imgX + imgW / 2 - 80,
      y: H / 2 - 10,
      width: 160,
      align: 'CENTER',
    });
  }
}

async function renderTwoCol(frame: FrameNode, c: TwoColContent, s: StyleGuide): Promise<void> {
  const W = s.layout.slideWidth;
  const H = s.layout.slideHeight;
  const PAD = s.layout.contentPadding.left;

  frame.fills = [solid(s.colors.background)];

  // Section label
  let headerY = PAD;
  if (c.sectionLabel) {
    await addText(frame, c.sectionLabel, {
      fontFamily: 'Inter',
      fontStyle: 'Medium',
      fontSize: 13,
      color: s.colors.primary,
      x: PAD,
      y: headerY,
      width: W - PAD * 2,
      letterSpacing: 2,
    });
    headerY += 32;
  }

  // Main heading (centered top)
  await addText(frame, c.heading, {
    fontFamily: s.typography.heading2.fontFamily,
    fontStyle: s.typography.heading2.fontStyle,
    fontSize: s.typography.heading2.fontSize,
    color: s.colors.text.primary,
    x: PAD,
    y: headerY,
    width: W - PAD * 2,
    letterSpacing: s.typography.heading2.letterSpacing,
  });

  const colY = H * 0.32;
  const colW = (W - PAD * 2 - s.layout.columnGap) / 2;
  const leftX = PAD;
  const rightX = PAD + colW + s.layout.columnGap;

  // Left column card
  addRect(frame, leftX, colY, colW, H - colY - PAD, s.colors.surface, s.layout.cornerRadius);

  // Left accent bar
  addRect(frame, leftX, colY, 4, H - colY - PAD, s.colors.primary, 0);

  // Left heading
  await addText(frame, c.leftCol.heading, {
    fontFamily: s.typography.heading3.fontFamily,
    fontStyle: s.typography.heading3.fontStyle,
    fontSize: s.typography.heading3.fontSize,
    color: s.colors.text.primary,
    x: leftX + 32,
    y: colY + 32,
    width: colW - 48,
    letterSpacing: s.typography.heading3.letterSpacing,
  });

  // Left bullets
  if (c.leftCol.bullets) {
    let bulletY = colY + 88;
    for (const bullet of c.leftCol.bullets) {
      addRect(frame, leftX + 32, bulletY + 10, 5, 5, s.colors.primary, 3);
      await addText(frame, bullet, {
        fontFamily: 'Inter',
        fontStyle: 'Regular',
        fontSize: 18,
        color: s.colors.text.primary,
        x: leftX + 48,
        y: bulletY,
        width: colW - 64,
        lineHeight: 1.5,
      });
      bulletY += 40;
    }
  }

  // Right column card
  addRect(frame, rightX, colY, colW, H - colY - PAD, s.colors.surface, s.layout.cornerRadius);
  addRect(frame, rightX, colY, 4, H - colY - PAD, s.colors.primary, 0);

  // Right heading
  await addText(frame, c.rightCol.heading, {
    fontFamily: s.typography.heading3.fontFamily,
    fontStyle: s.typography.heading3.fontStyle,
    fontSize: s.typography.heading3.fontSize,
    color: s.colors.text.primary,
    x: rightX + 32,
    y: colY + 32,
    width: colW - 48,
    letterSpacing: s.typography.heading3.letterSpacing,
  });

  // Right bullets
  if (c.rightCol.bullets) {
    let bulletY = colY + 88;
    for (const bullet of c.rightCol.bullets) {
      addRect(frame, rightX + 32, bulletY + 10, 5, 5, s.colors.primary, 3);
      await addText(frame, bullet, {
        fontFamily: 'Inter',
        fontStyle: 'Regular',
        fontSize: 18,
        color: s.colors.text.primary,
        x: rightX + 48,
        y: bulletY,
        width: colW - 64,
        lineHeight: 1.5,
      });
      bulletY += 40;
    }
  }
}

async function renderStats(frame: FrameNode, c: StatsContent, s: StyleGuide): Promise<void> {
  const W = s.layout.slideWidth;
  const H = s.layout.slideHeight;
  const PAD = s.layout.contentPadding.left;

  frame.fills = [solid(s.colors.background)];
  addRect(frame, 0, 0, W, 6, s.colors.primary);

  let headerY = PAD;

  if (c.sectionLabel) {
    await addText(frame, c.sectionLabel, {
      fontFamily: 'Inter',
      fontStyle: 'Medium',
      fontSize: 13,
      color: s.colors.primary,
      x: PAD,
      y: headerY,
      width: W - PAD * 2,
      letterSpacing: 2,
    });
    headerY += 32;
  }

  await addText(frame, c.heading, {
    fontFamily: s.typography.heading2.fontFamily,
    fontStyle: s.typography.heading2.fontStyle,
    fontSize: s.typography.heading2.fontSize,
    color: s.colors.text.primary,
    x: PAD,
    y: headerY,
    width: W - PAD * 2,
    letterSpacing: s.typography.heading2.letterSpacing,
  });

  const stats = c.stats.slice(0, 4);
  const cardY = H * 0.38;
  const cardH = H - cardY - PAD;
  const totalGap = s.layout.columnGap * (stats.length - 1);
  const cardW = (W - PAD * 2 - totalGap) / stats.length;

  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    const cardX = PAD + i * (cardW + s.layout.columnGap);

    // Card background
    addRect(frame, cardX, cardY, cardW, cardH, s.colors.surface, s.layout.cornerRadius);

    // Top accent
    addRect(frame, cardX, cardY, cardW, 4, s.colors.primary);

    // Big number
    await addText(frame, stat.number, {
      fontFamily: s.typography.heading1.fontFamily,
      fontStyle: s.typography.heading1.fontStyle,
      fontSize: 64,
      color: s.colors.primary,
      x: cardX + 28,
      y: cardY + 28,
      width: cardW - 56,
    });

    // Trend badge
    if (stat.trend) {
      await addText(frame, stat.trend, {
        fontFamily: 'Inter',
        fontStyle: 'Medium',
        fontSize: 14,
        color: s.colors.text.secondary,
        x: cardX + 28,
        y: cardY + 108,
        width: cardW - 56,
        letterSpacing: 1,
      });
    }

    // Label
    await addText(frame, stat.label, {
      fontFamily: s.typography.heading3.fontFamily,
      fontStyle: 'SemiBold',
      fontSize: 20,
      color: s.colors.text.primary,
      x: cardX + 28,
      y: cardY + 140,
      width: cardW - 56,
    });

    // Description
    if (stat.description) {
      await addText(frame, stat.description, {
        fontFamily: 'Inter',
        fontStyle: 'Regular',
        fontSize: 15,
        color: s.colors.text.secondary,
        x: cardX + 28,
        y: cardY + 172,
        width: cardW - 56,
        lineHeight: 1.4,
      });
    }
  }
}

async function renderQuote(frame: FrameNode, c: QuoteContent, s: StyleGuide): Promise<void> {
  const W = s.layout.slideWidth;
  const H = s.layout.slideHeight;
  const PAD = s.layout.contentPadding.left;

  // Full-bleed background
  frame.fills = [solid(s.colors.primary)];

  // Large quote mark (decorative)
  await addText(frame, '"', {
    fontFamily: s.typography.heading1.fontFamily,
    fontStyle: s.typography.heading1.fontStyle,
    fontSize: 320,
    color: s.colors.background,
    x: PAD - 20,
    y: -60,
    width: 300,
  });

  // Quote text
  const quoteNode = await addText(frame, `"${c.quote}"`, {
    fontFamily: s.typography.heading2.fontFamily,
    fontStyle: 'Regular',
    fontSize: 44,
    color: s.colors.text.inverse,
    x: PAD,
    y: H * 0.32,
    width: W - PAD * 2,
    lineHeight: 1.4,
    letterSpacing: -0.5,
  });

  // Attribution
  const attrY = H * 0.32 + quoteNode.height + 40;
  addRect(frame, PAD, attrY - 8, 48, 3, s.colors.text.inverse, 0, 0.5);

  await addText(frame, c.attribution, {
    fontFamily: 'Inter',
    fontStyle: 'SemiBold',
    fontSize: 22,
    color: s.colors.text.inverse,
    x: PAD + 60,
    y: attrY - 4,
    width: 500,
  });

  if (c.role) {
    await addText(frame, c.role, {
      fontFamily: 'Inter',
      fontStyle: 'Regular',
      fontSize: 18,
      color: s.colors.text.inverse,
      x: PAD + 60,
      y: attrY + 26,
      width: 500,
    });
  }
}

async function renderDivider(
  frame: FrameNode,
  c: DividerContent,
  s: StyleGuide,
  _index: number
): Promise<void> {
  const W = s.layout.slideWidth;
  const H = s.layout.slideHeight;
  const PAD = s.layout.contentPadding.left;

  frame.fills = [solid(s.colors.background)];

  // Large watermark number
  await addText(frame, String(c.sectionNumber).padStart(2, '0'), {
    fontFamily: s.typography.heading1.fontFamily,
    fontStyle: s.typography.heading1.fontStyle,
    fontSize: 320,
    color: s.colors.primary,
    x: W * 0.5,
    y: H * 0.05,
    width: W * 0.5,
  });

  // Section title
  await addText(frame, c.sectionTitle, {
    fontFamily: s.typography.heading1.fontFamily,
    fontStyle: s.typography.heading1.fontStyle,
    fontSize: s.typography.heading1.fontSize,
    color: s.colors.text.primary,
    x: PAD,
    y: H * 0.38,
    width: W * 0.6,
    letterSpacing: s.typography.heading1.letterSpacing,
    lineHeight: s.typography.heading1.lineHeight,
  });

  // Accent line
  addRect(frame, PAD, H * 0.62, 80, 4, s.colors.primary);

  // Description
  if (c.description) {
    await addText(frame, c.description, {
      fontFamily: 'Inter',
      fontStyle: 'Regular',
      fontSize: 24,
      color: s.colors.text.secondary,
      x: PAD,
      y: H * 0.66,
      width: W * 0.5,
    });
  }
}

async function renderClosing(frame: FrameNode, c: ClosingContent, s: StyleGuide): Promise<void> {
  const W = s.layout.slideWidth;
  const H = s.layout.slideHeight;
  const PAD = s.layout.contentPadding.left;

  frame.fills = [solid(s.colors.background)];

  // Top accent bar
  addRect(frame, 0, 0, W, 6, s.colors.primary);

  // Tagline
  let y = s.layout.contentPadding.top;
  if (c.tagline) {
    await addText(frame, c.tagline, {
      fontFamily: 'Inter',
      fontStyle: 'Medium',
      fontSize: 13,
      color: s.colors.primary,
      x: PAD,
      y,
      width: 500,
      letterSpacing: 2,
    });
    y += 32;
  }

  // Main heading
  const headingNode = await addText(frame, c.heading, {
    fontFamily: s.typography.heading1.fontFamily,
    fontStyle: s.typography.heading1.fontStyle,
    fontSize: s.typography.heading1.fontSize,
    color: s.colors.text.primary,
    x: PAD,
    y,
    width: W * 0.55,
    letterSpacing: s.typography.heading1.letterSpacing,
    lineHeight: s.typography.heading1.lineHeight,
  });
  y += headingNode.height + 20;

  // Subheading
  if (c.subheading) {
    await addText(frame, c.subheading, {
      fontFamily: 'Inter',
      fontStyle: 'Regular',
      fontSize: 24,
      color: s.colors.text.secondary,
      x: PAD,
      y,
      width: W * 0.5,
    });
    y += 60;
  }

  // Key takeaways (right side)
  if (c.keyTakeaways && c.keyTakeaways.length > 0) {
    const boxX = W * 0.58;
    const boxW = W * 0.38;
    addRect(frame, boxX, s.layout.contentPadding.top, boxW, H - s.layout.contentPadding.top * 2, s.colors.surface, s.layout.cornerRadius);
    addRect(frame, boxX, s.layout.contentPadding.top, 4, H - s.layout.contentPadding.top * 2, s.colors.primary);

    await addText(frame, 'KEY TAKEAWAYS', {
      fontFamily: 'Inter',
      fontStyle: 'Medium',
      fontSize: 13,
      color: s.colors.primary,
      x: boxX + 28,
      y: s.layout.contentPadding.top + 28,
      width: boxW - 56,
      letterSpacing: 2,
    });

    let takeawayY = s.layout.contentPadding.top + 72;
    for (const item of c.keyTakeaways) {
      addRect(frame, boxX + 28, takeawayY + 10, 5, 5, s.colors.primary, 3);
      await addText(frame, item, {
        fontFamily: 'Inter',
        fontStyle: 'Regular',
        fontSize: 17,
        color: s.colors.text.primary,
        x: boxX + 48,
        y: takeawayY,
        width: boxW - 76,
        lineHeight: 1.5,
      });
      takeawayY += 52;
    }
  }

  // CTA
  if (c.cta) {
    addRect(frame, PAD, H * 0.72, 400, 52, s.colors.primary, 4);
    await addText(frame, c.cta, {
      fontFamily: 'Inter',
      fontStyle: 'Medium',
      fontSize: 18,
      color: s.colors.text.inverse,
      x: PAD + 24,
      y: H * 0.72 + 14,
      width: 352,
    });
  }

  // Contact info
  if (c.contactInfo) {
    await addText(frame, c.contactInfo, {
      fontFamily: 'Inter',
      fontStyle: 'Regular',
      fontSize: 15,
      color: s.colors.text.secondary,
      x: PAD,
      y: H - s.layout.contentPadding.bottom,
      width: W * 0.5,
    });
  }
}
