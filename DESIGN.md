---
name: "thathsara.dev"
description: "An operational portfolio where technical artifacts carry the proof."
colors:
  field-black: "#0a0c0f"
  panel-black: "#0f1216"
  inset-slate: "#1a1f27"
  hairline-slate: "#232a35"
  strong-line-slate: "#2e3848"
  evidence-white: "#e5e8ee"
  soft-steel: "#b9c0cc"
  muted-steel: "#8993a3"
  faint-steel: "#747f90"
  signal-amber: "#e8b34a"
  dim-amber: "#8a6a2c"
  status-mint: "#6ee7c4"
  render-azure: "#7aa2f7"
  render-violet: "#c4a6f7"
typography:
  display:
    fontFamily: '"Instrument Serif", Georgia, "Times New Roman", serif'
    fontSize: "clamp(52px, 8vw, 104px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  headline:
    fontFamily: '"Instrument Serif", Georgia, "Times New Roman", serif'
    fontSize: "clamp(30px, 4.5vw, 52px)"
    fontWeight: 400
    lineHeight: 1.02
  title:
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.01em"
  label:
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    fontSize: "10.5px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.14em"
rounded:
  tag: "2px"
  button: "3px"
  control: "4px"
  inset: "5px"
  media: "6px"
  list: "7px"
  card: "8px"
  pill: "999px"
spacing:
  compact: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  gutter: "28px"
  cluster: "48px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.signal-amber}"
    textColor: "{colors.field-black}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.soft-steel}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "10px 20px"
  resume-pill:
    backgroundColor: "transparent"
    textColor: "{colors.signal-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 11px"
  focus-card:
    backgroundColor: "color-mix(in srgb, #0f1216 78%, transparent)"
    textColor: "{colors.soft-steel}"
    rounded: "{rounded.card}"
    padding: "19px 20px"
  technology-tag:
    backgroundColor: "{colors.inset-slate}"
    textColor: "{colors.soft-steel}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  navigation-bar:
    backgroundColor: "color-mix(in srgb, #0a0c0f 78%, transparent)"
    textColor: "{colors.muted-steel}"
    rounded: "0"
    padding: "13px 28px"
  contact-path:
    backgroundColor: "transparent"
    textColor: "{colors.soft-steel}"
    typography: "{typography.body}"
    rounded: "0"
    padding: "16px 0"
---

# Design System: thathsara.dev

## Overview

**Creative North Star: "The Operational Field Manual"**

The interface is a near-black working field where technical range becomes credible through inspectable artifacts. It feels precise, authored, and quietly cinematic: serif statements establish a human point of view, while monospaced evidence reads like field notes from systems that genuinely run.

Amber and mint behave as signals rather than decoration. Physical systems photography, the point-cloud portrait, restrained atmospheric light, and fine operational lines give the portfolio a memorable material presence without competing with comprehension. The system refuses the generic skills-grid portfolio; every expressive choice must help visitors follow the wire from artifact to outcome.

**Key Characteristics:**

- Near-black operational surfaces with fine slate structure.
- Instrument Serif statements paired with JetBrains Mono evidence.
- Rare amber emphasis and mint status signals.
- Flat, layered panels with restrained glow only where state or artifact demands it.
- Physical and browser-rendered artifacts used as proof, not decoration.

## Colors

The palette is a dark equipment-room field punctuated by warm amber direction, cool mint status, and tightly contained render light.

### Primary

- **Signal Amber:** The principal accent for names, links, active states, focus rings, progress, and the primary action.
- **Dim Amber:** A quieter continuation signal for connectors and subordinate technical diagrams.

### Secondary

- **Status Mint:** Communicates availability, active status, technical categories, and the cool endpoint of progress.

### Tertiary

- **Render Azure:** Reserved for lighting and loading feedback inside the 3D artifact.
- **Render Violet:** Reserved for the model-production imagery and its inset boundary or glow.

### Neutral

- **Field Black:** The page ground and darkest text-on-accent color.
- **Panel Black:** The resting panel, card, media, and modal surface.
- **Inset Slate:** Compact tags and nested evidence surfaces.
- **Hairline Slate:** Default dividers and quiet structural borders.
- **Strong Line Slate:** Controls, interactive boundaries, and higher-emphasis borders.
- **Evidence White:** Primary text and headline color.
- **Soft Steel:** Body copy and secondary interactive text.
- **Muted Steel:** Metadata, navigation at rest, captions, and supporting labels.
- **Faint Steel:** Lowest-emphasis footer text.

### Named Rules

**The Signal Rarity Rule.** Amber directs attention and mint reports status; neither becomes a general-purpose fill or decorative wash.

## Typography

**Display Font:** Instrument Serif (with Georgia and Times New Roman fallbacks)  
**Body Font:** JetBrains Mono (with system monospace fallbacks)  
**Label/Mono Font:** JetBrains Mono

**Character:** Instrument Serif supplies the authored, editorial voice; JetBrains Mono supplies precise evidence. Their contrast is the system's central typographic gesture, with neither family imitating the other.

### Hierarchy

- **Display:** Regular, fluid and tightly led. Reserved for the name and singular first-view statements; italic amber may emphasize one authored fragment.
- **Headline:** Regular serif with balanced wrapping. Used for section claims rather than generic category labels.
- **Title:** Semibold mono. Used for project and timeline titles where scanability matters.
- **Body:** Regular mono with open leading and a compact reading measure (about 46–52 characters on the homepage).
- **Label:** Small mono with generous tracking; usually uppercase for availability, proof labels, dates, and navigation-adjacent evidence.

### Named Rules

**The Statement-and-Evidence Rule.** Serif type makes the claim; monospaced type explains, labels, and substantiates it.

## Layout

Desktop composition uses a fixed full-viewport artifact behind a left reading column. The content column is the smaller of 54% of the viewport or 760px, with fluid horizontal padding from 28px to 64px. Each panel fills at least one viewport, centers its content vertically, and uses 96px block padding; desktop scrolling snaps panel starts without forcing a stop.

The layout becomes single-column at 900px. The point-cloud artifact turns into a low-opacity full-bleed backdrop, the content expands to full width with 22–48px fluid gutters, and sections switch to intrinsic height with 80px block padding. At 560px, the navigation becomes a 44px toggle and a compact dropdown. The Home Lab flow changes from five horizontal stages to a vertical route, while its gallery preserves one wide establishing image above two supporting images.

Spacing is compact inside evidence patterns and generous between narrative beats. Use small repeated intervals for tags, metadata, and controls; reserve 48px clusters and 80–96px section space for structural separation.

## Elevation & Depth

The system is flat by default. Depth comes from tonal layering, translucent near-black surfaces, hairline borders, fixed ambient gradients, scan-line texture, and selective backdrop blur. Shadows are sparse: they ground the hero type and image artifacts, or briefly acknowledge active status and hover.

### Shadow Vocabulary

- **Primary action lift** (`0 8px 28px rgb(232 179 74 / 18%)`): A restrained amber halo on primary-button hover.
- **Artifact float** (`0 24px 64px rgb(0 0 0 / 20–24%)`): Grounds large screenshots against the operational field.
- **Hero grounding** (`0 12px 48px rgb(0 0 0 / 36%)`): Keeps the display name legible across the portrait field.
- **Live status glow** (`0 0 7–12px` in the signal color): Reserved for live dots and the current timeline marker.

### Named Rules

**The Flat-by-Default Rule.** Resting surfaces use tone and line; glow appears only for live state, interactive lift, or an artifact that needs separation.

## Shapes

Geometry is compact and technical rather than soft. Tags use 2px corners, ordinary controls 3–4px, image frames 5–6px, and cards 7–8px. Full pills are reserved for compact status or utility controls such as résumé and loading indicators. One-pixel borders, divider lines, timeline rails, and small circular status nodes create the recurring silhouette. Image and artifact frames clip their contents cleanly; they do not float inside ornamental shells.

## Components

Components are restrained at rest and reveal state through signal color, a short translation, or a fine underline.

### Buttons

- **Shape:** Compact rectangular controls with a slight 3px corner.
- **Primary:** Signal Amber fill, Field Black text, semibold weight, and 10px by 20px padding.
- **Secondary:** Transparent field, Soft Steel text, and a Strong Line Slate border at the same size.
- **Hover / Focus:** Both lift by 2px; borders and text move toward Signal Amber or Evidence White. Primary hover gains only a restrained amber halo. Keyboard focus uses a 2px Signal Amber outline offset by 4px.

### Chips

- **Style:** Inset Slate background, Soft Steel mono text, 2px corners, compact 2px by 8px padding.
- **State:** Tags are evidence labels, not filters; keep them quiet and non-interactive unless the product adds a real action.

### Cards / Containers

- **Corner Style:** Gently clipped 7–8px corners.
- **Background:** A translucent Panel Black layer over the fixed field.
- **Shadow Strategy:** None at rest; see the Flat-by-Default Rule.
- **Border:** One-pixel Hairline Slate, warmed toward amber on hover.
- **Internal Padding:** Approximately 19px by 20px for focus cards; list rows remain more open and line-led.

### Navigation

The navigation is a fixed translucent bar with a fine bottom border and 16px blur. The brand is amber with a mint live dot. Links are muted at rest, reveal a one-pixel amber underline on hover or active state, and become amber when active. The résumé action is a compact outlined pill. On narrow screens, links move into a right-aligned translucent dropdown controlled by a 44px square toggle.

### Contact Paths

Contact choices are full-width line items, not filled buttons. Each uses a bottom hairline, a two-row label-and-description grid, and an amber arrow. Hover warms the line and label while adding 8px inline inset, making the path feel selected without introducing a card.

### Point-Cloud Portrait

The portrait is the signature browser-rendered artifact. On capable desktops, white particles assemble into a figure, pick up amber pointer response, and rotate subtly with scroll under cool Azure light. It remains non-blocking: screens at or below 900px and load failures use the static portrait fallback, and reduced-motion preference suppresses pointer response. Loading states stay compact, monospaced, and operational.

## Do's and Don'ts

### Do:

- **Do** use concrete artifacts, system diagrams, and physical photography as evidence.
- **Do** preserve the serif-statement and mono-evidence relationship.
- **Do** keep amber for direction and mint for status.
- **Do** express hierarchy with spacing, tone, and one-pixel structure before adding shadow.
- **Do** provide static fallbacks and reduced-motion behavior for signature effects.

### Don't:

- **Don't** replace proof with a generic skills grid or decorative technology cloud.
- **Don't** turn accent colors into broad ornamental fills.
- **Don't** soften the system with oversized radii, pill-shaped cards, or inflated controls.
- **Don't** add persistent glow or shadow to ordinary resting surfaces.
- **Don't** let the point-cloud portrait become a prerequisite for reading, navigation, or contact.
