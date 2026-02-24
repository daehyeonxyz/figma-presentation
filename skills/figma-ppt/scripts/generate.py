#!/usr/bin/env python3
"""
generate.py — figma-ppt-plugin code generator

Assembles style-guide.json + slides-plan.json + JS templates
into a single Figma Plugin JavaScript file ready to paste into
the Figma Developer Console.

Usage:
  python generate.py \
    --style-guide ./style-guide.json \
    --slides-plan ./slides-plan.json \
    --output ./figma-slides-20250224-143000.js \
    --templates-dir ./templates \
    [--use-defaults]
"""

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime, timezone


# ============================================================
# DEFAULT STYLE (used when --use-defaults or no style-guide.json)
# ============================================================
DEFAULT_STYLE = {
    "meta": {
        "sourceFileKey": None,
        "sourceFileName": "Default Style",
        "extractedAt": datetime.now(timezone.utc).isoformat(),
        "confidence": 0.5,
        "notes": "Using built-in defaults. Run extract-style for branded output."
    },
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
        },
        "extras": []
    },
    "typography": {
        "heading1": { "fontFamily": "Inter", "fontStyle": "Bold",     "fontSize": 64, "lineHeight": 1.15, "letterSpacing": -1.5 },
        "heading2": { "fontFamily": "Inter", "fontStyle": "Bold",     "fontSize": 48, "lineHeight": 1.2,  "letterSpacing": -1.0 },
        "heading3": { "fontFamily": "Inter", "fontStyle": "SemiBold", "fontSize": 28, "lineHeight": 1.3,  "letterSpacing": -0.3 },
        "body":     { "fontFamily": "Inter", "fontStyle": "Regular",  "fontSize": 18, "lineHeight": 1.6,  "letterSpacing": 0    },
        "caption":  { "fontFamily": "Inter", "fontStyle": "Regular",  "fontSize": 14, "lineHeight": 1.5,  "letterSpacing": 0.2  },
        "display":  { "fontFamily": "Inter", "fontStyle": "Light",    "fontSize": 52, "lineHeight": 1.4,  "letterSpacing": -0.5 }
    },
    "layout": {
        "slideWidth":   1920,
        "slideHeight":  1080,
        "contentPadding": { "top": 80, "right": 96, "bottom": 80, "left": 96 },
        "headerHeight": 128,
        "columnGap":    48,
        "itemGap":      24,
        "cornerRadius": 12,
        "frameSpacing": 80
    },
    "aesthetic": {
        "direction": "minimal",
        "backgroundStyle": "solid",
        "motionStyle": "subtle"
    }
}


def load_json(path: Path, default=None, label="file"):
    if not path.exists():
        if default is not None:
            print(f"[figma-ppt] WARNING: {label} not found at {path}. Using defaults.", file=sys.stderr)
            return default
        print(f"[figma-ppt] ERROR: Required {label} not found: {path}", file=sys.stderr)
        sys.exit(1)
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"[figma-ppt] ERROR: Invalid JSON in {path}: {e}", file=sys.stderr)
        sys.exit(1)


def read_template(path: Path) -> str:
    if not path.exists():
        return f"// Template not found: {path}\n"
    return path.read_text(encoding='utf-8')


def collect_slide_builders(slides_dir: Path) -> str:
    """Read all slide *.js.template files in sorted order."""
    if not slides_dir.exists():
        return "// No slide templates found in templates/slides/\n"

    parts = []
    for tpl in sorted(slides_dir.glob("*.js.template")):
        parts.append(f"// ---- {tpl.stem} ----")
        parts.append(tpl.read_text(encoding='utf-8').strip())

    return "\n\n".join(parts)


def validate_plan(plan: dict):
    slides = plan.get("slides")
    if not slides or not isinstance(slides, list):
        print("[figma-ppt] ERROR: slides-plan.json must have a 'slides' array.", file=sys.stderr)
        sys.exit(1)
    if len(slides) == 0:
        print("[figma-ppt] ERROR: slides array is empty.", file=sys.stderr)
        sys.exit(1)
    valid_types = {"HERO", "AGENDA", "CONTENT", "TWO_COL", "STATS", "QUOTE", "DIVIDER", "CLOSING"}
    for i, s in enumerate(slides):
        if s.get("type") not in valid_types:
            print(f"[figma-ppt] WARNING: Slide {i+1} has unknown type '{s.get('type')}'. It will be skipped.", file=sys.stderr)


def generate_js(style: dict, plan: dict, templates_dir: Path) -> str:
    base_template = read_template(templates_dir / "base.js.template")
    slide_builders = collect_slide_builders(templates_dir / "slides")

    style_json   = json.dumps(style, indent=2, ensure_ascii=False)
    slides_json  = json.dumps(plan.get("slides", []), indent=2, ensure_ascii=False)
    pres_title   = plan.get("title", "Generated Presentation")

    output = base_template
    output = output.replace("{{STYLE_JSON}}",              style_json)
    output = output.replace("{{SLIDES_JSON}}",             slides_json)
    output = output.replace("{{SLIDE_BUILDER_FUNCTIONS}}", slide_builders)
    output = output.replace("{{PRESENTATION_TITLE}}",      pres_title)

    return output


def main():
    parser = argparse.ArgumentParser(
        description="figma-ppt: Generate Figma Plugin JS from style guide + slides plan"
    )
    parser.add_argument("--style-guide",   default="./style-guide.json",  help="Path to style-guide.json")
    parser.add_argument("--slides-plan",   default="./slides-plan.json",  help="Path to slides-plan.json")
    parser.add_argument("--output",        default="./figma-slides.js",   help="Output .js file path")
    parser.add_argument("--templates-dir", default="./templates",          help="Path to templates/ directory")
    parser.add_argument("--use-defaults",  action="store_true",            help="Use built-in default styles")
    args = parser.parse_args()

    style_path = Path(args.style_guide)
    plan_path  = Path(args.slides_plan)
    out_path   = Path(args.output)
    tpl_dir    = Path(args.templates_dir)

    # Load inputs
    if args.use_defaults:
        style = DEFAULT_STYLE
        print("[figma-ppt] Using default styles (no style-guide.json).")
    else:
        style = load_json(style_path, DEFAULT_STYLE, "style-guide")

    plan = load_json(plan_path, None, "slides-plan")
    validate_plan(plan)

    # Generate
    js_code = generate_js(style, plan, tpl_dir)

    # Write output
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(js_code, encoding='utf-8')

    slide_count = len(plan.get("slides", []))
    size_kb = out_path.stat().st_size // 1024

    print(f"[figma-ppt] SUCCESS")
    print(f"  Slides:    {slide_count}")
    print(f"  Output:    {out_path.resolve()}")
    print(f"  File size: {size_kb}KB")
    print(f"  Style:     {style.get('meta', {}).get('sourceFileName', 'Default')}")
    print(f"  Aesthetic: {style.get('aesthetic', {}).get('direction', 'default')}")


if __name__ == "__main__":
    main()
