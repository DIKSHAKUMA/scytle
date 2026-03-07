# Figma UI Visual Analysis — Playwright Deep Dive

> **Purpose**: Documents every observable UI pattern in Figma's editor, captured via Playwright browser automation on a real design file ([Minimal Landing Page Design](https://www.figma.com/community/file/1189093728838364665)). Complements the API-based [FIGMA-ARCHITECTURE-DEEP-DIVE.md](./FIGMA-ARCHITECTURE-DEEP-DIVE.md) with actual UI behavior, interaction patterns, and exact control types.

---

## Table of Contents

1. [Shell Layout & Navigation](#1-shell-layout--navigation)
2. [Layers Panel (Left Sidebar)](#2-layers-panel-left-sidebar)
3. [Properties Panel — Frame Node](#3-properties-panel--frame-node)
4. [Properties Panel — Auto-Layout Frame](#4-properties-panel--auto-layout-frame)
5. [Properties Panel — Text Node](#5-properties-panel--text-node)
6. [Properties Panel — Component Instance](#6-properties-panel--component-instance)
7. [Properties Panel — Freeform Frame (No Layout)](#7-properties-panel--freeform-frame-no-layout)
8. [Assets Panel](#8-assets-panel)
9. [Toolbar & Tools](#9-toolbar--tools)
10. [Context Menu](#10-context-menu)
11. [Key Interaction Patterns](#11-key-interaction-patterns)
12. [Real-World Layout Examples](#12-real-world-layout-examples)
13. [Scytle Implementation Implications](#13-scytle-implementation-implications)

---

## 1. Shell Layout & Navigation

### Global Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Logo ▾]  [File name ▾]  [Drafts]  [Free]          [Avatar ▾] [▷] [Share] │
├──────────────────────────────────────────────────────────────────────────┤
│ LEFT SIDEBAR (~240px)  │  CANVAS (WebGL/WebGPU)       │ RIGHT SIDEBAR   │
│                        │                               │  (~300px)       │
│ ┌────────────────────┐ │                               │ ┌─────────────┐│
│ │ [File] [Assets] 🔍 │ │                               │ │[Design][Proto││
│ ├────────────────────┤ │                               │ │type]    52%▾ ││
│ │ Pages          [+] │ │      Main Canvas              │ ├─────────────┤│
│ │  Style Guide       │ │      (zoom/pan/select)        │ │ Properties   ││
│ │  Design ←selected  │ │                               │ │ Panel        ││
│ ├────────────────────┤ │                               │ │ (varies by   ││
│ │ Layers         [⊟] │ │                               │ │  selection)  ││
│ │  ▸ Landing Page    │ │                               │ │              ││
│ │    ▸ Frame 36      │ │                               │ │              ││
│ │    ▸ Footer        │ │                               │ │              ││
│ │    ▸ Dot           │ │                               │ │              ││
│ │    ▸ Body          │ │                               │ └─────────────┘│
│ │    ▾ Home          │ │                               │                │
│ │      ▸ Hero Section│ │                               │                │
│ │      ▸ Clients     │ │                               │                │
│ │      ▸ Community   │ │                               │                │
│ └────────────────────┘ │                               │                │
├────────────────────────┴───────────────────────────────┴────────────────┤
│  TOOLBAR: [Move▾][Frame▾][Shape▾][Pen▾][T][💬][⚡][🧩][🎨] [Draw|Design|Dev] │
└──────────────────────────────────────────────────────────────────────────┘
```

### Top Bar
- **Left**: Figma logo (main menu dropdown) · Minimize UI button
- **Center**: File name (editable) · Edit file menu · Breadcrumb: "Drafts" link · "Free" badge
- **Right**: Avatar button · Play/Present (▷) · Share button

### Tab System
- **Left sidebar tabs**: `File` | `Assets` + 🔍 Find button
- **Right sidebar tabs**: `Design` | `Prototype` + zoom percentage dropdown (e.g., "52%")
- **Bottom toolbar modes**: `Draw` | `Design` (default) | `Dev Mode` — radio button group

---

## 2. Layers Panel (Left Sidebar)

### Tree Structure

The layers panel shows a hierarchical tree where each node has:

```
[expand arrow] [type icon] [layer name]
```

**Observed node type icons:**

| Icon | Label | Description | Example |
|------|-------|-------------|---------|
| `#` grid | `"Frame"` | Frame without auto-layout | Landing Page, Illustration |
| `≡` lines | `"Auto layout"` | Frame with auto-layout enabled | Home, Hero Section, Footer |
| `◇` diamond | `"Instance"` | Component instance | Button |
| `T` letter | `"Text"` | Text node (leaf) | "Lessons and insights..." |
| `◈` | `"Component"` | Component definition | (seen in Assets panel) |

### Interaction Behaviors

1. **Single click** on layer name → selects the node, shows properties in right panel, highlights on canvas
2. **Double-click** on layer name → enters/drills into the frame (makes children directly selectable)
3. **Expand arrow** (▸/▾) → toggles children visibility in tree without selecting
4. **Hover** reveals lock (🔒) and visibility (👁) icons on the right side of the row
5. **Selected layer** gets blue highlight background
6. **Tooltip** on type icon shows the node type (e.g., hovering `#` shows "Frame")
7. **Collapse layers** button in header collapses all expanded nodes

### Tree Hierarchy Observed

```
# Landing Page (Frame, 1440 × 4376)
├── # Frame 36
├── ≡ Footer
├── ≡ Dot
├── ≡ Body
└── ≡ Home (Vertical auto-layout, 1440 Hug × 1285 Hug)
    ├── ≡ Hero Section (Horizontal, 1440 Fill × 599 Hug)
    │   ├── ≡ Frame 1 (Vertical, 657 Fill × 276 Hug)
    │   │   ├── ≡ Text (Vertical, 657 Fill × 192 Hug)
    │   │   │   ├── T "Lessons and insights from 8 years"
    │   │   │   └── T "Where to grow your business as a photographer..."
    │   │   └── ◇ Button (Instance, 128 Hug × 52 Hug)
    │   └── # Illustration (Freeform, 391 × 407)
    ├── ≡ Clients
    └── ≡ Community
```

> **Key Observation**: Every visual grouping is a Frame with auto-layout. The tree nesting directly represents flex containers. Frames own the layout; all sizing and positioning flows through the ancestor chain.

---

## 3. Properties Panel — Frame Node

### Section Anatomy (Top to Bottom)

When a Frame node is selected, the right panel (`Design` tab) shows these sections in order:

```
┌─────────────────────────────────┐
│  [Design]  [Prototype]    52% ▾ │
├─────────────────────────────────┤
│                                 │
│  Position                       │  ← only when NOT root frame
│  ┌──────────────────┐           │
│  │ X [___]  Y [___] │           │
│  └──────────────────┘           │
│  Rotation                       │
│  ↺ [0°]  [⟳90] [↔flip] [↕flip] │
│                                 │
│  ── Layout ──          [⊞] [⊟] │
│  Flow:  ⊞Freeform ⊟Vert ⊟Horiz ⊞Grid │  ← radio group (4 icons)
│  Dimensions:                    │
│  W [1440] [▾Hug]  H [1285] [▾Hug] │  ← value + sizing mode dropdown
│  ☐ Clip content                 │
│                                 │
│  ── Appearance ──     [👁] [🔘] │
│  Opacity: [100%]                │
│  Corner radius: [0] [⊞corners] │
│                                 │
│  ── Fill ──                 [+] │
│  [■ color] [hex] [opacity%] [👁] [-] │  ← per-fill row
│                                 │
│  ── Stroke ──               [+] │
│  (empty — click + to add)       │
│                                 │
│  ── Effects ──              [+] │
│  (empty — click + to add)       │
│                                 │
│  ── Selection colors ──        │
│  [●][●][●][●] +N               │  ← color dots from descendants
│                                 │
│  ── Layout guide ──         [+] │
│                                 │
│  ── Export ──               [+] │
│                                 │
└─────────────────────────────────┘
```

### Position Section

| Control | Type | Notes |
|---------|------|-------|
| X position | `textbox` (disabled in auto-layout children) | Numeric input |
| Y position | `textbox` (disabled in auto-layout children) | Numeric input |
| Rotation | `textbox` | Shows "0°" with degree symbol |
| Rotate 90° right | `button` | Icon button |
| Flip horizontal | `button` | Icon button |
| Flip vertical | `button` | Icon button |

> **Key**: X/Y are **disabled** when the frame is a child of an auto-layout parent. This is critical — Scytle should also disable position fields for flex children.

### Layout Section

| Control | Type | Values | Notes |
|---------|------|--------|-------|
| Resize to fit | `button` | — | Icon button in section header |
| Toggle auto layout | `checkbox` | on/off | Toggles the auto-layout engine |
| Flow mode | `radiogroup` (4 options) | Freeform / Vertical / Horizontal / Grid | Visual icon radio buttons |
| Width | `combobox` | numeric | Editable |
| Width sizing | `dropdown` | Fixed / Hug / Fill / Add min / Add max | Separate dropdown next to width |
| Height | `combobox` | numeric | Editable |
| Height sizing | `dropdown` | Fixed / Hug / Fill / Add min / Add max | Separate dropdown next to height |
| Lock aspect ratio | `checkbox` | on/off | Between W and H inputs |
| Clip content | `checkbox` | on/off | Maps to CSS `overflow: hidden` |

**Width/Height Sizing Dropdown Options:**
```
┌─────────────────────────┐
│ ✓ Fixed width (391)     │  ← css: width: 391px
│   Fill container        │  ← css: flex: 1
│   ─────────────         │
│   Add min width…        │  ← css: min-width
│   Add max width…        │  ← css: max-width
└─────────────────────────┘
```

> **Note**: "Hug" only appears when auto-layout is enabled. For Freeform frames, only Fixed/Fill/min/max are available.

### Appearance Section

| Control | Type | Values |
|---------|------|--------|
| Show/Hide | `button` (👁) | Toggle visibility |
| Blend mode | `button` (🔘) | Opens blend mode dropdown |
| Opacity | `textbox` | "100%" with % suffix |
| Corner radius | `textbox` | "0" (uniform) |
| Individual corners | `button` (⊞) | Opens 4-corner input mode |

### Fill Section

Each fill is a row:

```
[color swatch] [hex input] [opacity %] [visibility toggle 👁] [remove ✕]
```

- Click `+` to add a new fill
- Multiple fills supported (layered)
- Supports: Solid color, Linear gradient, Radial gradient, Angular gradient, Diamond gradient, Image fill
- Color swatch opens full color picker popup

### Stroke/Effects

- Both start collapsed with just a `+` button
- Each added item gets its own row with controls

---

## 4. Properties Panel — Auto-Layout Frame

When a frame has auto-layout enabled, the Layout section transforms:

```
┌─────────────────────────────────┐
│  Resizing                       │
│  W [1440] [Hug ▾]  H [1285] [Hug ▾] │
│                                 │
│  Alignment         Gap          │
│  [⦿][·][·]     ≡ [40] [▾]     │  ← 3×3 alignment grid + gap input
│  [·][·][·]                     │
│  [·][·][·]                     │
│                                 │
│  Padding                        │
│  |●| [0]  ≡ [0]  [⊞individual] │  ← H padding, V padding
│                                 │
│  ☐ Clip content                 │
│                                 │
└─────────────────────────────────┘
```

### Auto-Layout Specific Controls

| Control | Type | CSS Mapping | Notes |
|---------|------|-------------|-------|
| Alignment grid | 3×3 button matrix | `justify-content` + `align-items` | Visual 9-position picker |
| Gap | `textbox` | `gap` | With dropdown for "Auto" option |
| Gap settings | `button` (⚙) | — | Opens advanced gap config |
| Horizontal padding | `textbox` | `padding-left` + `padding-right` | With icon |
| Vertical padding | `textbox` | `padding-top` + `padding-bottom` | With icon |
| Individual padding | `button` | — | Toggle 4-value padding mode |

### Alignment Grid (3×3 Matrix)

```
┌─────┬─────┬─────┐
│ TL  │ TC  │ TR  │  ← justify-content: start/center/end + align-items: start
├─────┼─────┼─────┤
│ ML  │ MC  │ MR  │  ← justify-content: start/center/end + align-items: center
├─────┼─────┼─────┤
│ BL  │ BC  │ BR  │  ← justify-content: start/center/end + align-items: end
└─────┴─────┴─────┘
```

> **Critical for Scytle**: This 3×3 visual alignment grid is the single most important UX pattern in Figma's layout system. It replaces abstract `justify-content`/`align-items` dropdowns with an intuitive spatial picker. **We must implement this exact pattern.**

### Observed Auto-Layout Examples

| Frame | Direction | W × H | Gap | Padding |
|-------|-----------|-------|-----|---------|
| Home | Vertical | 1440 Hug × 1285 Hug | 40 | 0,0 |
| Hero Section | Horizontal | 1440 Fill × 599 Hug | 104 | 144/96 |
| Frame 1 | Vertical | 657 Fill × 276 Hug | 32 | 0,0 |
| Text | Vertical | 657 Fill × 192 Hug | 16 | 0,0 |
| Button (instance) | Horizontal | 128 Hug × 52 Hug | 10 | — |

---

## 5. Properties Panel — Text Node

### Full Section Layout

```
┌─────────────────────────────────┐
│  Text                           │
│  [Select matching] [Link] [≡] [⋯] │
├─────────────────────────────────┤
│                                 │
│  Position                       │
│  ☐ Ignore auto layout           │  ← checkbox to break out of flex
│  Alignment: (disabled)          │
│  X [___]  Y [___]  (disabled)  │
│  Rotation: [0°] [⟳] [↔] [↕]   │
│                                 │
│  ── Layout ──                   │
│  Resizing:                      │
│  ○ Auto width ○ Auto height ○ Fixed │  ← radio group (3 options)
│  W [657] [Fill ▾]              │
│  H [152] [Hug ▾]              │
│                                 │
│  ── Appearance ──               │
│  Opacity: [100%]                │
│  Corner radius: [0]            │
│                                 │
│  ── Typography ──               │
│  Style: [Heading/Headline 1 · 64/76 ▾] │  ← text style dropdown
│  Horizontal: ○ Left ● Center ○ Right │  ← alignment radio
│  Vertical:   ● Top  ○ Middle ○ Bottom │  ← alignment radio
│  [Type settings]                │  ← opens advanced type panel
│                                 │
│  ── Fill ──                     │
│  "Click + to replace mixed content" │  ← when text has mixed colors
│                                 │
│  ── Selection colors ──        │
│  [Brand/Primary] [Neutral/D_Grey] │  ← shows all colors used
│                                 │
│  ── Stroke ──                   │
│  ── Effects ──                  │
│  ── Export ──                   │
│                                 │
└─────────────────────────────────┘
```

### Text-Specific Controls

| Control | Type | CSS Mapping | Values |
|---------|------|-------------|--------|
| Ignore auto layout | `checkbox` | `position: absolute` | Breaks text out of flex flow |
| Resizing mode | `radiogroup` (3) | — | Auto width / Auto height / Fixed size |
| Text style | `dropdown` | font-family, weight, size, line-height | "Heading/Headline 1 · 64/76" format |
| Horizontal align | `radiogroup` (3) | `text-align` | Left / Center / Right |
| Vertical align | `radiogroup` (3) | `align-self` / `vertical-align` | Top / Middle / Bottom |
| Type settings | `button` | — | Opens advanced panel (letter-spacing, paragraph spacing, etc.) |

### Text Resizing Modes

| Mode | Behavior | CSS Equivalent |
|------|----------|----------------|
| **Auto width** | Text box grows horizontally to fit content | `width: auto; white-space: nowrap` |
| **Auto height** | Fixed width, height grows to fit content | `width: 657px; height: auto` |
| **Fixed size** | Both dimensions fixed, text may overflow/clip | `width: 657px; height: 152px; overflow: hidden` |

### Text Style Format

The style dropdown shows: `{Category}/{Style Name} · {fontSize}/{lineHeight}`

Example: `Heading/Headline 1 · 64/76`
- Category: `Heading`
- Style: `Headline 1`
- Font size: `64px`
- Line height: `76px`

> **Scytle implication**: We should support text styles as presets — a dropdown that sets font-family, weight, size, and line-height in one click.

---

## 6. Properties Panel — Component Instance

### Instance-Specific Header

```
┌─────────────────────────────────┐
│  Button ▾                       │  ← component name dropdown
│  From this file                 │  ← origin indicator
├─────────────────────────────────┤
│                                 │
│  ── Variant Properties ──       │
│  Type:  [Primary ▾]            │  ← combobox dropdown
│  Size:  [Medium ▾]             │  ← combobox dropdown
│  State: [Default ▾]            │  ← combobox dropdown
│  Icon:  [No ▾]                 │  ← combobox dropdown
│                                 │
│  ── Position ──                 │
│  (same as Frame, X/Y disabled) │
│                                 │
│  ── Auto Layout ──              │
│  Horizontal, 128 Hug × 52 Hug  │
│  (ALL CONTROLS DISABLED)        │  ← inherited from component
│                                 │
│  ── Appearance ──               │
│  (same as Frame)                │
│                                 │
│  ── Fill / Stroke / Effects ── │
│  (same as Frame)                │
│                                 │
└─────────────────────────────────┘
```

### Key Instance Behaviors

| Behavior | Observation | Scytle Implication |
|----------|-------------|-------------------|
| Component name is a dropdown | Users can swap to a different component | Important for v2 component system |
| "From this file" indicator | Shows component origin (local vs library) | Useful for component library UX |
| Variant props as dropdowns | Each property is a combobox with predefined values | Define component variants with enum properties |
| Layout controls DISABLED | Auto-layout settings inherited from component definition | Instances show but don't allow editing layout |
| Overridable fields | Fill colors, text content, visibility can be overridden | Need override system for component instances |

---

## 7. Properties Panel — Freeform Frame (No Layout)

The "Illustration" frame demonstrates a Freeform (no auto-layout) frame:

```
┌─────────────────────────────────┐
│  Position                       │
│  X [905]  Y [96]  (disabled — parent has auto-layout) │
│  Rotation: [0°]                 │
│                                 │
│  ── Layout ──                   │
│  Flow: ● Freeform ○ Vert ○ Horiz ○ Grid │
│  Dimensions: W [391] H [407]    │
│  Lock aspect ratio: ☐           │  ← available in Freeform
│  Clip content: ☐                │
│                                 │
│  ── Appearance ──               │
│  Opacity: 100%                  │
│  Corner radius: 0               │
│                                 │
│  ── Fill ──              [+]    │
│  (empty)                        │
│                                 │
│  ── Selection colors ──        │
│  [●Brand/Primary] [●Shade/S5] [●Neutral/Silver] +9 │
│                                 │
└─────────────────────────────────┘
```

**Key differences from auto-layout Frame:**
- Shows `Lock aspect ratio` checkbox
- No Alignment grid, Gap, or Padding controls
- Children positioned by absolute X/Y coordinates
- Sizing dropdowns show: Fixed / Fill container / Add min / Add max (**no "Hug"** — Hug requires auto-layout)

---

## 8. Assets Panel

### Layout

```
┌─────────────────────────────────┐
│  [File]  [Assets] 🔍            │  ← tab bar
├─────────────────────────────────┤
│  🔍 Search assets               │
│                                 │
│  Created in this file           │
│  122 components                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Icon │ │ Logo │ │Button│   │  ← thumbnail grid
│  └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────┐            │
│  │Icon  │ │ ...  │            │
│  │button│ │      │            │
│  └──────┘ └──────┘            │
│                                 │
│  ── UI Kits ──                  │
│  iOS and iPadOS 26 (175)       │
│  Material 3 Design Kit (355)   │
│  Simple Design System (1840)   │
│                                 │
│  [+ Add more libraries]        │
│                                 │
└─────────────────────────────────┘
```

### Key Observations

- Components displayed as thumbnail cards in a grid
- Each card shows a visual preview + name
- UI kits show as expandable list items with component counts
- Search is unified across local and library components
- **Drag from Assets to Canvas** to instantiate (standard Figma pattern)

> **Scytle implication**: We need a component/section library panel with previews that can be dragged onto the canvas. Start with section templates, evolve to component library.

---

## 9. Toolbar & Tools

### Complete Toolbar Layout

```
[Pen▾] [Frame▾] [Shape▾] [Vector▾] [Text] [Comment] [Actions] [Components] [Styling]
                                                                    [Draw | Design | Dev Mode]
```

### Tool Inventory

#### 1. Move Tools (dropdown)

| Tool | Shortcut | Purpose |
|------|----------|---------|
| Move | `V` | Default selection/move tool |
| Hand tool | `H` | Pan canvas without selecting |
| Scale | `K` | Proportionally scale selection |

#### 2. Frame/Region Tools (dropdown)

| Tool | Shortcut | Purpose |
|------|----------|---------|
| Frame | `F` | Draw a new frame (container) |
| Section | `⌥S` | Organizational container (like a slide) |
| Slice | `S` | Define export region |

#### 3. Shape Tools (dropdown)

| Tool | Shortcut | Purpose |
|------|----------|---------|
| Rectangle | `R` | Draw rectangle/square |
| Line | `L` | Draw a line |
| Arrow | `⇧L` | Draw an arrow |
| Ellipse | `O` | Draw circle/ellipse |
| Polygon | — | Draw polygon |
| Star | — | Draw star |
| Image/video | `⌥⌘K` | Place image or video |

#### 4. Pen/Creation Tools (dropdown)

| Tool | Shortcut | Purpose |
|------|----------|---------|
| Pen | `P` | Vector pen tool (Bézier curves) |
| Pencil | `⌥P` | Freehand drawing tool |

#### 5. Standalone Tools

| Tool | Shortcut | Purpose |
|------|----------|---------|
| Text | `T` | Click to create text node |
| Comment | `C` | Add comment pin to canvas |
| Actions | — | Prototyping actions/interactions |

### Toolbelt Mode Radio

```
○ Draw  ● Design  ○ Dev Mode
```

- **Draw**: Full editing — create, move, style nodes
- **Design** (default): Design-focused view with properties panel
- **Dev Mode**: Developer-focused view (inspect mode, CSS export, assets)

> **Scytle Note**: For Phase 1, we only need: Move, Frame, Text, Image placement, and Hand tool. Shapes, Pen, and Pencil are Phase 2+.

---

## 10. Context Menu

Right-click on canvas shows:

### Full Context Menu

```
┌─────────────────────────────────┐
│  Copy                     ⌘C    │
│  Paste here                     │
│  Paste to replace         ⇧⌘R   │
│  Copy/Paste as →                │  ← submenu
│  Send to Figma Make             │
│  ─────────────────────────────  │
│  Select layer →                 │  ← submenu (pick child)
│  Move to page →                 │  ← submenu
│  Bring to front           ]     │
│  Send to back             [     │
│  ─────────────────────────────  │
│  Group selection          ⌘G    │
│  Frame selection          ⌥⌘G   │
│  Ungroup                        │
│  ─────────────────────────────  │
│  Flatten                  ⌥⇧F   │
│  Outline stroke           ⌥⌘O   │
│  Use as mask              ⌥⌘M   │
│  Set as thumbnail               │
│  ─────────────────────────────  │
│  Remove auto layout       ⌥⇧A   │
│  More layout options →          │  ← submenu
│  ─────────────────────────────  │
│  Create component         ⌥⌘K   │
│  ─────────────────────────────  │
│  Plugins →                      │  ← submenu
└─────────────────────────────────┘
```

### Key Actions for Scytle

| Action | Shortcut | Scytle Priority |
|--------|----------|-----------------|
| Copy/Paste | ⌘C/⌘V | **P1** — essential |
| Group selection | ⌘G | **P1** — wrap in frame |
| Frame selection | ⌥⌘G | **P1** — same as group for us |
| Bring to front/back | ] / [ | **P1** — z-index reorder |
| Remove auto layout | ⌥⇧A | **P1** — toggle flex off |
| Create component | ⌥⌘K | **P2** — component system |
| Select layer | — | **P1** — deep selection in nested frames |

---

## 11. Key Interaction Patterns

### Canvas Navigation

| Action | Trigger | Notes |
|--------|---------|-------|
| Pan | Space + drag, or scroll | Hand tool or space bar hold |
| Zoom | ⌘+scroll, ⌘+ / ⌘- | Zoom to cursor position |
| Zoom to fit | ⌘1 | Fit all content in viewport |
| Zoom to selection | ⌘2 | Focus on selected node |

### Selection & Drilling

| Action | Trigger | Notes |
|--------|---------|-------|
| Select | Click on canvas element | Selects topmost frame |
| Deep select | Double-click | Drills into frame, selects child |
| Multi-deep select | Double-click repeatedly | Goes deeper into nested frames |
| Multi-select | Shift+click | Add to selection |
| Select all children | ⌘A (inside frame) | Selects all direct children |
| Deselect | Click empty canvas | Clears selection |
| Exit frame | Escape | Goes up one level in frame hierarchy |

### State Transitions

```
Nothing selected → Click frame → Frame selected → Double-click → Inside frame
                                                                → Click child → Child selected
                                                                → Escape → Back to frame selected
```

> **Critical for Scytle**: The double-click-to-drill-in pattern is essential. When inside a frame:
> - Single click selects children directly
> - Escape goes back up
> - The layers panel highlights what's selected and what you're "inside"

### Auto-Layout Behavior

When selecting a child of an auto-layout frame:
1. **X/Y position fields become disabled** — position is determined by flex layout
2. **An "Ignore auto layout" checkbox appears** — checking it makes the child `position: absolute`
3. **Drag reordering** snaps to flex order positions (visual insertion point indicator)
4. **Resizing** snaps to the three modes: Fixed / Hug / Fill

---

## 12. Real-World Layout Examples

### Example 1: Hero Section (Horizontal Auto-Layout)

```
Hero Section ≡ (Horizontal, Fill × Hug, gap: 104, padding: 144px 96px)
├── Frame 1 ≡ (Vertical, Fill × Hug, gap: 32)
│   ├── Text ≡ (Vertical, Fill × Hug, gap: 16)
│   │   ├── T "Lessons and insights from 8 years" (Fill × Hug)
│   │   └── T "Where to grow your business..." (Fill × Hug)
│   └── ◇ Button (Instance, Hug × Hug)
└── # Illustration (Freeform, 391 × 407)
```

**CSS equivalent:**
```css
.hero-section {
  display: flex;
  flex-direction: row;
  width: 100%;           /* Fill */
  height: auto;          /* Hug */
  gap: 104px;
  padding: 144px 96px;
}

.frame-1 {
  display: flex;
  flex-direction: column;
  flex: 1;               /* Fill */
  gap: 32px;
}

.text-group {
  display: flex;
  flex-direction: column;
  flex: 1;               /* Fill */
  gap: 16px;
}

.heading {
  width: 100%;           /* Fill */
  height: auto;          /* Hug */
  font-size: 64px;
  line-height: 76px;
}

.button {
  width: auto;           /* Hug */
  height: auto;          /* Hug */
}

.illustration {
  width: 391px;          /* Fixed */
  height: 407px;         /* Fixed */
  position: relative;    /* Freeform children positioned absolutely within */
}
```

### Example 2: Home Container (Vertical Stacking)

```
Home ≡ (Vertical, 1440 Hug × 1285 Hug, gap: 40, padding: 0)
├── Hero Section ≡ (fills full width)
├── Clients ≡ (fills full width)
└── Community ≡ (fills full width)
```

**CSS equivalent:**
```css
.home {
  display: flex;
  flex-direction: column;
  width: fit-content;     /* Hug — but child fills make it 1440 */
  gap: 40px;
}
```

---

## 13. Scytle Implementation Implications

### 13A. Properties Panel Architecture

Based on Figma's panel, Scytle's properties panel should be:

1. **Context-sensitive** — show different sections based on selected node type
2. **Section-based** — collapsible sections for Position, Layout, Appearance, Fill, Typography, etc.
3. **Smart defaults** — disable irrelevant controls (e.g., X/Y for flex children)

**Panel sections by node type:**

| Section | Frame | Text | Image | Button | Icon |
|---------|-------|------|-------|--------|------|
| Position | ✓ | ✓ | ✓ | ✓ | ✓ |
| Layout (auto-layout) | ✓ | — | — | — | — |
| Resizing | ✓ | ✓ | ✓ | ✓ | ✓ |
| Alignment (3×3 grid) | ✓ (when auto-layout) | — | — | — | — |
| Gap | ✓ (when auto-layout) | — | — | — | — |
| Padding | ✓ (when auto-layout) | — | — | — | — |
| Appearance (opacity, radius) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Fill | ✓ | ✓ (text color) | — | ✓ | ✓ |
| Stroke/Border | ✓ | — | ✓ | ✓ | — |
| Effects (shadow, blur) | ✓ | ✓ | ✓ | ✓ | — |
| Typography | — | ✓ | — | — | — |
| Image source | — | — | ✓ | — | — |
| Component props | — | — | — | ✓ (variant) | — |

### 13B. Must-Have Control Types

From observing Figma's actual controls:

| Control Pattern | Where Used | Implementation |
|----------------|------------|----------------|
| **3×3 alignment grid** | Auto-layout frames | 9-button matrix, highlights active position |
| **Sizing mode dropdown** | W/H fields | Dropdown: Fixed / Hug / Fill with min/max options |
| **Flow radio group** | Layout section | 4-icon radio: Freeform / Vertical / Horizontal / Grid |
| **Text resizing radio** | Text nodes | 3-option radio: Auto width / Auto height / Fixed |
| **Color swatch + hex + opacity** | Fill section | Inline row with color picker popup |
| **Variant property dropdowns** | Component instances | Combobox per variant property |
| **Section toggles** | All sections | Expand/collapse with + button to add items |

### 13C. Layer Panel Design

Must support:
1. **Type-distinguished icons** — Frame (⊞), Auto-layout (≡), Text (T), Image (🖼), Instance (◇)
2. **Expand/collapse arrows** — show/hide children
3. **Double-click to rename** — inline text editing
4. **Drag to reorder** — with flex-aware insertion point
5. **Lock and visibility toggles** — appear on hover
6. **Selected state** — blue highlight, synced with canvas selection

### 13D. Keyboard Shortcuts (Phase 1 Minimum)

| Shortcut | Action |
|----------|--------|
| `V` | Move tool (select) |
| `F` | Frame tool (draw frame) |
| `T` | Text tool (create text) |
| `H` | Hand tool (pan) |
| `⌘G` | Group / Wrap in frame |
| `⌘C` / `⌘V` | Copy / Paste |
| `Delete` / `Backspace` | Delete selected |
| `⌘Z` / `⇧⌘Z` | Undo / Redo |
| `]` / `[` | Bring forward / Send backward |
| `Escape` | Deselect or exit frame |
| `Enter` | Enter selected frame |
| `⌘+` / `⌘-` | Zoom in / out |
| `⌘1` | Zoom to fit |

### 13E. Critical UX Principles Observed

1. **Everything is a frame** — Frames are the universal container. Buttons, cards, sections, pages — all frames with auto-layout and styling.

2. **Auto-layout = default** — Almost every frame in this design has auto-layout. Freeform is the exception (only used for the vector illustration). **Scytle should default new frames to auto-layout.**

3. **Sizing modes drive responsiveness** — The Fill/Hug/Fixed system, combined with auto-layout, creates responsive layouts without media queries. This is the key abstraction.

4. **Disabled controls communicate constraints** — X/Y disabled = "this is positioned by flex". Layout controls disabled on instances = "inherited from component". Scytle should use the same pattern.

5. **Selection colors aggregate descendants** — Shows all colors used in children, enabling quick recoloring. Nice-to-have for Scytle v2.

6. **Text styles as presets** — "Heading/Headline 1 · 64/76" format packages multiple properties into one selection. Essential for design consistency.

---

## Appendix A: Comparison — Figma Panel vs Scytle Spec

| Figma Panel Section | Scytle Phase 1 | Notes |
|---------------------|-----------------|-------|
| Position (X, Y) | ✅ Include | Disable for flex children |
| Rotation | ⏳ Phase 2 | Not critical for web layouts |
| Flip H/V | ⏳ Phase 2 | — |
| Flow (Freeform/V/H/Grid) | ✅ Include | Skip Grid for Phase 1 |
| Dimensions (W, H) | ✅ Include | With sizing mode dropdowns |
| Lock aspect ratio | ⏳ Phase 2 | Only for images |
| Clip content | ✅ Include | Maps to overflow: hidden |
| Alignment (3×3 grid) | ✅ Include | Critical UX pattern |
| Gap | ✅ Include | — |
| Padding | ✅ Include | 2-value and 4-value modes |
| Opacity | ✅ Include | — |
| Corner radius | ✅ Include | Uniform + individual corners |
| Fill (color) | ✅ Include | Single fill for Phase 1 |
| Fill (gradient) | ⏳ Phase 2 | — |
| Fill (image) | ✅ Include | For Image nodes |
| Stroke/Border | ✅ Include | Simplified (width, color, style) |
| Effects (shadow) | ✅ Include | Box shadow |
| Effects (blur) | ⏳ Phase 2 | — |
| Blend mode | ❌ Skip | Rarely used in web |
| Constraints | ❌ Skip | We use flex/auto-layout instead |
| Component properties | ⏳ Phase 2 | Component system |
| Selection colors | ⏳ Phase 2 | Nice-to-have |
| Layout guide | ❌ Skip | IDE feature |
| Export | ⏳ Phase 2 | — |
| Prototype tab | ❌ Skip | Not a prototyping tool |
| Dev Mode | ❌ Skip | We ARE the code output |

---

*Analyzed via Playwright browser automation on 2025-03-02*
*Source file: [Minimal Landing Page Design (Figma Community)](https://www.figma.com/community/file/1189093728838364665)*
