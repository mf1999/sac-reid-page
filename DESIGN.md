---
name: Saint Anthony's Channel ReID
description: Project page of a vessel re-identification dataset, opened on a map of the real channel.
colors:
  sea: "#0a4f7e"
  sea-deep: "#083a5e"
  shallow: "#2bb3bd"
  foam: "#e9fbfa"
  roof: "#c4532f"
  karst: "#b9b48a"
  macchia: "#6d8a45"
  pine: "#3d6634"
  ink: "#0f2433"
  muted: "#475966"
  rule: "#d9e2e7"
  tint: "#f1f6f8"
  crop-well: "#e3eaee"
  paper: "#ffffff"
typography:
  display:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
  caption:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.35
    fontFeature: "\"tnum\""
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "14px"
    lineHeight: 1.6
  water-name:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "26px"
    fontWeight: 400
    letterSpacing: "0.08em"
  map-town:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "0.3em"
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "14px"
  lg: "28px"
  section: "72px"
components:
  button-primary:
    backgroundColor: "{colors.sea}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.sea-deep}"
    textColor: "{colors.paper}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
  filter-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  filter-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  title-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "26px 36px 22px"
    width: "680px"
  views-panel:
    backgroundColor: "{colors.tint}"
    rounded: "{rounded.md}"
    padding: "20px"
    width: "400px"
  crop-tile:
    backgroundColor: "{colors.crop-well}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
  code-block:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.foam}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "56px 22px 20px"
---

# Design System: Saint Anthony's Channel ReID

## Overview

**Creative North Star: "The Channel Chart"**

The page opens on the real place that the camera watches. A full-bleed map of St. Anthony's Channel, made from OpenStreetMap data, fills the first viewport. A plain academic title card sits on the southern land. The map is a chart of the place, not a decoration.

Below the map, the page is a calm reading document. The sections sit on white paper with sea-blue headings, one reading column, and quiet tables. The Adriatic palette stays in the map, in the headings, and in the selection marks. The real crops in the gallery are the main evidence, so the page frames them and does not compete with them.

The map palette comes from the user: a vibrant Adriatic sea, rocky karst greenery, sea foam, the red roofs of Šibenik, and the marina in the south. A fractal-noise grain gives the karst land its rock texture. The page has no eyebrow or kicker text above the title. The decision sketch had one, and the build removed it on purpose.

**Key Characteristics:**
- A generated map of the real coast in the hero, with a white title card on the land.
- A deep blue sea with a turquoise shallow band and a white foam line at the coast.
- Karst ground with macchia and pine greens, and terracotta roofs.
- White reading sections, one column of 68ch, and sea-blue section headings.
- Pill buttons with one filled primary action.
- Terracotta marks focus, link hover, and the selected crop.

## Colors

The palette is the Adriatic coast near Šibenik: sea blues, turquoise, foam, karst greens, and roof terracotta, on cool white paper with a blue-black ink.

### Primary
- **Adriatic Deep Blue** (sea): The color of open water in the map. It is also the link color, the section heading color, the list marker color, the filled primary button, and the browser accent color.
- **Channel Night** (sea-deep): The darkest water at the map edge. It is the hover state of the primary button, the halo stroke behind map labels, the hero background before the map loads, and the footer background.

### Secondary
- **Shallow Turquoise** (shallow): The shallow band along the coast. On the page, it is the text selection color and the hover outline of a crop tile.
- **Sea Foam** (foam): The light text on dark surfaces (the footer and the BibTeX block). In the map, a white foam line (#ffffff) and a light turquoise line (#8ff0e4) sit inside the shallow band.

### Tertiary
- **Šibenik Roof Terracotta** (roof): The roofs of the town. The map varies each roof between four tones (#a94127, #b8462a, #c4532f, #d0663b) with a dark outline (#7a2e1a). On the page, it is the focus ring, the link hover color, and the outline of the selected crop.
- **Karst Stone** (karst): The bare land in the map, with a fractal-noise grain.
- **Macchia Green** (macchia): Scrub on the land in the map. Heath (#a3a46c) sits below it.
- **Pine Green** (pine): Woods in the map, the darkest green.

### Neutral
- **Blue-Black Ink** (ink): All body text, the outline of the secondary buttons, the active filter fill, the table head rule, and the BibTeX background.
- **Slate Muted** (muted): Secondary text: affiliation, metadata, key numbers, nav links, table heads, captions, and the gallery lede.
- **Hairline Mist** (rule): The one-pixel rules under the top bar and the table rows, and the border of a filter chip.
- **Cool Tint** (tint): The views panel background, the inline code background, and the hover fill of a secondary button.
- **Crop Well** (crop-well): The background behind each crop image, so that a crop with a different aspect ratio sits in a quiet frame.
- **Paper** (paper): The page background, the title card, and the top bar.

### Named Rules
**The Roof Marks Selection Rule.** Terracotta shows where the user is: the focus ring, the link hover, and the selected crop. Do not use terracotta as a fill or as decoration on the page.

**The Map Holds the Color Rule.** The full Adriatic palette lives in the map. Below the hero, only sea blue, turquoise, and terracotta appear, and only in small roles on white paper.

## Typography

**Display Font:** Public Sans (with system-ui, sans-serif)
**Body Font:** Public Sans (with system-ui, sans-serif)
**Label/Mono Font:** ui-monospace (with SFMono-Regular, Menlo, Consolas)
**Place Font:** Libre Caslon Text italic (with Georgia, serif)

**Character:** Public Sans is a plain, public-service sans that reads as a research document. Libre Caslon italic is a chart-maker hand for the names of water, and it appears nowhere else.

### Hierarchy
- **Display** (700, 32px, 1.15): The page title in the title card only. It is 26px at 640px and less. Lines are balanced.
- **Headline** (700, 30px, 1.2): Section headings, in sea blue. They are 26px at 640px and less.
- **Title** (700, 20px, 1.3): Sub-headings inside a section. The views panel uses 18px.
- **Body** (400, 17px, 1.65): Reading text, with a maximum line length of 68ch. It is 16px at 640px and less.
- **Label** (600, 15px): Buttons, filter chips, and nav links. Nav links are muted and change to sea blue on hover.
- **Caption** (400, 13px, 1.35, tabular numbers): The class and pid under each crop.
- **Mono** (14px, 1.6): The BibTeX block, file names, and inline code at 0.88em.
- **Map labels:** English names, except the town name Šibenik. The water name in italic Libre Caslon (26px, 0.08em tracking). The town name in Public Sans 700 capitals (20px, 0.3em tracking). Points of interest in Public Sans 600 (14px, 0.05em tracking). All map labels are white with a sea-deep halo stroke (4px). A label never renders below 12px: app.js sets the map scale as `--s`, and the CSS enlarges the label when the map scale is small.

### Named Rules
**The Water Names Rule.** Libre Caslon italic is for the names of water only. Do not use it for headings, body text, or land names.

**The Tabular Numbers Rule.** All counts (key numbers, tables, filter counts, captions) use tabular figures, so that columns of numbers align.

## Layout

The page has two parts: the map hero and the reading document.

- **Top bar:** sticky, 56px high, white, with a hairline rule below. The brand is at the left and the section links are at the right. At 960px and less, the bar is static and the links wrap.
- **Hero:** the map frame is the viewBox 160 360 1440 860 of the map, from St. Nicholas Fortress to Šibenik and the marina, with the channel in the upper half. At 1400px and more, the hero is never taller than the screen below the top bar (minimum 680px). The frame keeps its aspect ratio, sits on the hero bottom and loses a strip at the top on a short screen. The title card floats fully on the south land below the channel, 30 map units above the frame bottom (map units x 460 to 1100: left 20.833%, width 44.444%), so all its corners and its shadow show at the first view. The card has two columns: the title, the key numbers, the actions and the logos span both. At 1399px and less, the map keeps the same frame and aspect ratio, and the card moves below the map with a 40px overlap and a maximum width of 760px. At 640px and less, the map is 56% of the viewport height and shows the eastern channel (viewBox 505 0 1095 1328). The image and the labels always share one viewBox.
- **Reading sections:** a 760px column with 28px side gutters and 72px top padding (56px on mobile). Paragraphs and lists stop at 68ch.
- **Wide section:** the gallery uses a 1180px container. Its heading and lede stay on the edge of the reading column. The crop grid and a 400px views panel sit side by side with a 28px gap. At 960px and less, the panel moves below the grid.
- **Crop grid:** auto-fill columns of 150px minimum with a 14px gap. Two columns at 640px and less.
- **Rhythm:** 8px between chips, 14px between tiles, 28px for gutters and large gaps, 72px above each section, and 88px above the footer.

**The Map Stays in the Hero Rule.** The map does not reach into the reading sections. The sections sit on calm white paper.

## Elevation & Depth

The system is flat, with one exception. The title card floats above the map with a soft, blurred shadow, because it must read as a separate sheet on a busy surface. All other surfaces are flat. They show depth with tonal layers (tint and crop-well on paper) and with hairline rules.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 18px 40px -8px rgb(4 30 50 / .45), 0 2px 6px rgb(4 30 50 / .2)`): The title card on the map only.

### Named Rules
**The One Sheet Rule.** Only an element that sits on the map gets a shadow. Surfaces on paper stay flat.

## Shapes

The corners are small and calm. Inline code, the view thumbnails, and the map credit use 3px. Crop frames use 4px. The title card, the views panel, and the BibTeX block use 6px. All buttons and filter chips are full pills (999px). Borders are hairlines (1px) for rules and chips, and 1.5px for buttons. A selected crop shows an inset outline (3px on a tile, 2px on a thumbnail), not a border, so the layout does not move.

## Components

### Buttons
Plain and direct. Each one is a clear academic action.
- **Shape:** a full pill (999px), minimum 44px high.
- **Primary:** sea blue fill with white text. Use it for one action only: the access request.
- **Secondary:** white fill with a 1.5px ink outline and ink text.
- **Hover / Focus:** the primary changes to sea-deep. A secondary changes to the tint fill. Color changes take 0.15s. Focus shows a 2px terracotta ring with a 2px offset.
- **Copy button:** a secondary button, 36px high, at the top right of the BibTeX block, with a paper outline.

### Chips
- **Style:** the filter chips are secondary buttons with a 1px hairline-mist border, 40px high. A muted count follows the class name.
- **State:** the active chip has an ink fill and white text.

### Cards / Containers
- **Title card:** white paper, 6px corners, card lift shadow, padding 26px 36px 22px (20px 26px 16px on the map). It holds the title, the author, the affiliation, the metadata, the collaboration line, the actions, and the key numbers.
- **Logo row:** the LABUST, FER, IRB and HRZZ logos in their original colors, each linked to its website. They sit at the bottom of the title card under a hairline rule, and again in a white strip above the footer.
- **Views panel:** cool tint fill, 6px corners, 20px padding, no shadow. It is sticky under the top bar on wide screens.

### Navigation
- **Top bar links:** Public Sans 600 at 15px, muted, no underline. They change to sea blue on hover. On narrow screens, the links wrap below the brand.
- **Body links:** sea blue with a 1px underline at 0.18em offset. They change to terracotta on hover.

### Data tables
Tables use tabular numbers, left-aligned text, and right-aligned numbers. A 2px ink rule sits under the head row. Hairline rules separate the body rows. The total row is bold with no rule. A definition list beside the table uses the same hairline rows.

### Crop Gallery (signature component)
Each tile is a 4:3 crop-well frame with the crop centered and not cropped. Below the frame, the class shows in ink and the pid shows in muted caption text. Hover adds a turquoise inset outline. Selection adds a terracotta inset outline. The views panel is a slideshow: a large 4:3 view, then a 2px progress bar (rule track, sea fill) that fills over each step while the slideshow plays, then a quiet control row (the view count at the left, and muted 40px round icon buttons at the right: previous vessel, previous view, pause or play, next view, next vessel), and the recording time with the file name in mono. It plays every view of every vessel of the selected class in turn (2.5s for each view) and loops. A click on a tile goes to the first view of that vessel. The page opens on the motorboat class. Autoplay stops when the panel is off screen or the tab is hidden, and is off by default when the user prefers reduced motion.

### Citation block
A row of style chips (BibTeX, APA, IEEE, MLA, Chicago, Harvard) sits above an ink panel with 6px corners and the copy button at the top right. The chips use the filter chip style. BibTeX shows in foam mono text, the other styles in foam Public Sans at 16px with an italic title. The copy button names the selected style and copies plain text and HTML. Without JavaScript, only the BibTeX block shows. Text selection inside the panel uses turquoise.

### Channel map (signature component)
A generated SVG of the real coast from OpenStreetMap. The sea is a radial gradient from #0d6fa3 to sea and sea-deep. The coast has four stacked strokes (#1690a8, #2fc4c6, #8ff0e4, and white) that make the shallow band and the foam line. The land is karst with a noise grain, then heath, macchia, pine, and residential (#d9cdb0) layers, light roads and piers, and terracotta roofs. On load, the map settles from 1.06 scale and low saturation in 1.6s (cubic-bezier(.16, 1, .3, 1)). When the user prefers reduced motion, the map does not move. The OpenStreetMap credit is always visible.

A canvas between the map image and the labels shows the life of the channel (app.js `initSea`). It uses the map coordinates and the slice mapping of the labels.
- **Vessels:** flat top-down shapes with white hulls, ink outlines, pale decks (#e6ddc6, #dce5e8) and white sails. They never use the roof terracotta. The largest vessel (a ferry) is about 2.7 times the length of a motorboat. Most vessels go through the channel to the Šibenik port. Others go north up the bay, come in from the open sea, or stay moored at Mandalina Marina. Hand-placed routes in `assets/routes.json`, checked by `tools/check_routes.py`.
- **Wakes:** faint foam V lines that fade in 4s.
- **Waves:** short foam crest lines from a simplex noise field with time as one input, so the pattern never loops. The swell comes from the southwest. Waves are fewer and calmer in the inner bay and near the coast.
- **Cars:** small rounded rectangles in ink, slate and sea blues (a few white), each with a windscreen of the opposite tone, so that they read on the pale land and roads. They follow pregenerated paths through the road graph (`assets/roads.json`) in two lanes, one for each direction, and most of them drive in Šibenik.
- **Traffic rule:** vessels and cars keep a gap to the agent ahead in their lane and give way at crossings. Vessels never overlap.
- The canvas stops when the hero is off screen or the tab is hidden. With reduced motion, it draws one still frame.

## Do's and Don'ts

### Do:
- **Do** make the map from real OpenStreetMap data and keep the OpenStreetMap credit visible.
- **Do** keep the karst noise grain on the land. It gives the rocky Dalmatian ground that the user asked for.
- **Do** put white map labels on a sea-deep halo stroke, and keep each label at 12px or more on the screen.
- **Do** use one filled sea-blue button for the main action, and outline pills for all other actions.
- **Do** mark focus and selection with terracotta (roof).
- **Do** use tabular numbers for all counts.

### Don't:
- **Don't** put eyebrow or kicker text above a heading or the title.
- **Don't** use Libre Caslon italic for any text that is not the name of water.
- **Don't** let the map or the full map palette reach into the reading sections.
- **Don't** add a shadow to a surface that sits on paper.
- **Don't** crop a vessel image to fill its frame. Show the full crop in the crop-well.
