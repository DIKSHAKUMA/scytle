# Figma Architecture Deep Dive — For Scytle Canvas Implementation

> **Purpose**: Comprehensive analysis of Figma's data model, node types, layer structure, properties system, and naming conventions — synthesized from Figma's Plugin API docs and REST API docs. This document provides the blueprint for Scytle's "Context-Aware AI Canvas" node system.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Figma's Node Type Hierarchy](#2-figmas-node-type-hierarchy)
3. [The Mixin Architecture](#3-the-mixin-architecture)
4. [Deep Dive: Critical Node Types](#4-deep-dive-critical-node-types)
5. [Auto-Layout System (CSS Flexbox/Grid Mapping)](#5-auto-layout-system)
6. [Sizing System](#6-sizing-system)
7. [Visual Properties (Fills, Strokes, Effects)](#7-visual-properties)
8. [Typography System](#8-typography-system)
9. [Component & Instance System](#9-component--instance-system)
10. [Layer Structure & Naming Conventions](#10-layer-structure--naming-conventions)
11. [REST API Wire Format](#11-rest-api-wire-format)
12. [Scytle Node Type Mapping](#12-scytle-node-type-mapping)
13. [Properties Panel Mapping](#13-properties-panel-mapping)
14. [Implementation Recommendations](#14-implementation-recommendations)

---

## 1. Executive Summary

Figma uses a **mixin-based composition** architecture where properties are grouped into reusable "mixins" (ChildrenMixin, GeometryMixin, BlendMixin, LayoutMixin, etc.) that are applied to different node types. This allows 37 node types to share common behaviors while having type-specific additions.

### Key Architectural Insights

| Insight | Detail | Scytle Implication |
|---------|--------|--------------------|
| **FrameNode = `<div>`** | Primary container, has children, auto-layout, padding, clipping | Our core container node — maps 1:1 to HTML div |
| **Auto-layout = CSS Flexbox/Grid** | `HORIZONTAL` = row, `VERTICAL` = column, `GRID` = CSS grid | We render to HTML/CSS — direct mapping, no translation layer needed |
| **TextNode is a leaf** | No children, rich text via `characters` string + per-range styling | Our text node can be simpler — single `characters` field |
| **RectangleNode is a leaf** | No children, independent corner radii, used for backgrounds/shapes | We can merge this into Frame for simplicity |
| **GroupNode is frameless** | No auto-layout, no fills, no corner radius — just visual grouping | May not need in v1 — Frame covers grouping |
| **Component/Instance = reusability** | Component defines, Instance copies with overrides | Important for v2, not v1 |
| **Children sorted back-to-front** | First child = bottommost layer, last = topmost | Standard z-index ordering for our renderer |
| **`figma.mixed`** | Special sentinel for mixed values across text ranges or corners | We can use `null` or a symbol for this |

### What Scytle Needs vs. What Figma Has

**Scytle needs (Phase 1):** Frame, Text, Image, Button, Icon — 5 node types
**Figma has:** 37 node types (most are for vectors, FigJam, prototyping — irrelevant to us)

We only need to understand ~6 of Figma's 37 types for our canvas:
- **FrameNode** → Scytle Frame (container)
- **TextNode** → Scytle Text (leaf)
- **RectangleNode** → Merged into Scytle Frame (leaf shape behavior handled by frames with no children)
- **ComponentNode** → Scytle Component (v2)
- **InstanceNode** → Scytle Instance (v2)
- **GroupNode** → Scytle Group (future — may not need)

---

## 2. Figma's Node Type Hierarchy

### Complete Node Type List (37 types)

```
DocumentNode (root)
├── PageNode (canvas)
│   ├── DESIGN NODES (what we care about)
│   │   ├── FrameNode         ← THE workhorse container
│   │   ├── GroupNode          ← Frameless grouping
│   │   ├── SectionNode        ← Organizational container
│   │   ├── ComponentNode      ← Reusable frame definition
│   │   ├── ComponentSetNode   ← Variant container
│   │   ├── InstanceNode       ← Copy of component
│   │   ├── TextNode           ← Rich text leaf
│   │   ├── RectangleNode      ← Shape with corner radii
│   │   ├── EllipseNode        ← Circle/oval shape
│   │   ├── LineNode           ← Line shape
│   │   ├── StarNode           ← Star shape
│   │   ├── RegularPolygonNode ← Polygon shape
│   │   ├── VectorNode         ← Generic vector path
│   │   ├── BooleanOperationNode ← Union/subtract/intersect/exclude
│   │   └── SliceNode          ← Export region
│   │
│   ├── FIGJAM NODES (irrelevant)
│   │   ├── StickyNode, ShapeWithTextNode, ConnectorNode
│   │   ├── StampNode, HighlightNode, WashiTapeNode
│   │   ├── TableNode, TableCellNode, CodeBlockNode
│   │   └── LinkUnfurlNode, EmbedNode, MediaNode
│   │
│   └── WIDGET NODE
│       └── WidgetNode         ← Third-party widgets
│
└── StyleNodes (not in tree)
    ├── PaintStyle, TextStyle, EffectStyle, GridStyle
    └── VariableCollection, Variable
```

### Capability Matrix

| Node Type | Has Children | Has Auto-Layout | Has Fills/Strokes | Has Corner Radius | Has Text Content |
|-----------|:-----------:|:---------------:|:-----------------:|:-----------------:|:----------------:|
| FrameNode | ✅ | ✅ | ✅ | ✅ | ❌ |
| GroupNode | ✅ | ❌ | ❌ (blend only) | ❌ | ❌ |
| SectionNode | ✅ | ❌ | ✅ | ❌ | ❌ |
| ComponentNode | ✅ | ✅ | ✅ | ✅ | ❌ |
| InstanceNode | ✅ | ✅ | ✅ | ✅ | ❌ |
| TextNode | ❌ | ❌ | ✅ | ❌ | ✅ |
| RectangleNode | ❌ | ❌ | ✅ | ✅ | ❌ |
| VectorNode | ❌ | ❌ | ✅ | ❌ | ❌ |
| EllipseNode | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 3. The Mixin Architecture

Figma doesn't use class inheritance — it uses **mixin composition**. Each node type is composed of a combination of mixins:

### Core Mixins

```typescript
// BASE — Every node has these
interface BaseNodeMixin {
  id: string                    // Unique: "1:3"
  name: string                  // Layer name in panels
  parent: BaseNode | null       // Parent reference
  removed: boolean              // Deletion check
}

// SCENE — Every visible node
interface SceneNodeMixin {
  visible: boolean              // Show/hide toggle
  locked: boolean               // Prevent editing
  componentPropertyReferences: object | null
  boundVariables: object        // Design token bindings
  resolvedVariableModes: object // Variable mode resolution
  explicitVariableModes: object // Explicit mode overrides
}

// CHILDREN — Containers that hold other nodes
interface ChildrenMixin {
  children: ReadonlyArray<SceneNode>  // Back-to-front order
  appendChild(child: SceneNode): void
  insertChild(index: number, child: SceneNode): void
  findAll(callback): SceneNode[]
  findOne(callback): SceneNode | null
  findChildren(callback): SceneNode[]
}

// GEOMETRY — Nodes with visual appearance
interface GeometryMixin {
  fills: Paint[] | figma.mixed
  strokes: Paint[]
  strokeWeight: number
  strokeAlign: 'INSIDE' | 'OUTSIDE' | 'CENTER'
  strokeCap: StrokeCap
  strokeJoin: StrokeJoin
  dashPattern: number[]
  fillStyleId: string
  strokeStyleId: string
}

// CORNER — Nodes with rounded corners
interface CornerMixin {
  cornerRadius: number | figma.mixed
  cornerSmoothing: number        // 0-1 (iOS squircle at 0.6)
  topLeftRadius: number
  topRightRadius: number
  bottomLeftRadius: number
  bottomRightRadius: number
}

// BLEND — Visual blending
interface BlendMixin {
  opacity: number                // 0-1
  blendMode: BlendMode           // NORMAL, MULTIPLY, etc.
  isMask: boolean
  effects: Effect[]              // Shadows, blurs
  effectStyleId: string
}

// LAYOUT — Position and size
interface LayoutMixin {
  x: number
  y: number
  width: number                  // readonly
  height: number                 // readonly
  minWidth: number | null
  maxWidth: number | null
  minHeight: number | null
  maxHeight: number | null
  rotation: number
  relativeTransform: Transform
  absoluteTransform: Transform   // readonly
  absoluteBoundingBox: Rect      // readonly
  constrainProportions: boolean
  constraints: Constraints       // { horizontal, vertical }
  layoutAlign: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'INHERIT'
  layoutGrow: number
  layoutPositioning: 'AUTO' | 'ABSOLUTE'
  layoutSizingHorizontal: 'FIXED' | 'HUG' | 'FILL'
  layoutSizingVertical: 'FIXED' | 'HUG' | 'FILL'
}

// AUTO-LAYOUT — Flexbox/Grid for containers
interface AutoLayoutMixin {
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID'
  primaryAxisSizingMode: 'FIXED' | 'AUTO'
  counterAxisSizingMode: 'FIXED' | 'AUTO'
  primaryAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN'
  counterAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE'
  counterAxisAlignContent: 'AUTO' | 'SPACE_BETWEEN'
  itemSpacing: number
  counterAxisSpacing: number | null
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  layoutWrap: 'NO_WRAP' | 'WRAP'
  itemReverseZIndex: boolean
  strokesIncludedInLayout: boolean
}

// GRID LAYOUT — CSS Grid for containers
interface GridLayoutMixin {
  gridRowCount: number
  gridColumnCount: number
  gridRowGap: number
  gridColumnGap: number
  gridRowSizes: GridTrackSize[]
  gridColumnSizes: GridTrackSize[]
}

// GRID CHILD — Children of grid containers
interface GridChildMixin {
  gridRowAnchorIndex: number
  gridColumnAnchorIndex: number
  gridRowSpan: number
  gridColumnSpan: number
  gridChildHorizontalAlign: 'MIN' | 'CENTER' | 'MAX' | 'AUTO'
  gridChildVerticalAlign: 'MIN' | 'CENTER' | 'MAX' | 'AUTO'
}

// CONTAINER — Layer panel behavior
interface ContainerMixin {
  expanded: boolean              // Layers panel expand state
  backgrounds: Paint[]           // DEPRECATED → use fills
}

// INDIVIDUAL STROKES — Per-side stroke weight
interface IndividualStrokesMixin {
  strokeTopWeight: number
  strokeBottomWeight: number
  strokeLeftWeight: number
  strokeRightWeight: number
}
```

### Mixin Composition Per Node Type

| Node Type | Children | Geometry | Corner | Blend | Layout | AutoLayout | Container | IndividualStrokes |
|-----------|:--------:|:--------:|:------:|:-----:|:------:|:----------:|:---------:|:-----------------:|
| FrameNode | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GroupNode | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| ComponentNode | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| InstanceNode | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SectionNode | ✅ | ✅ (fills only) | ❌ | ❌ | ✅ (limited) | ❌ | ❌ | ❌ |
| TextNode | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| RectangleNode | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 4. Deep Dive: Critical Node Types

### 4A. FrameNode — THE Core Container

> "A container used to define a layout hierarchy. It is similar to `<div>` in HTML."

**Type-specific properties:**
```typescript
interface FrameNode {
  type: 'FRAME'
  clipsContent: boolean           // = CSS overflow: hidden
  layoutGrids: LayoutGrid[]       // Visual grid overlays
  guides: Guide[]                 // Alignment guides
  inferredAutoLayout: InferredAutoLayoutResult | null  // AI-inferred layout
  devStatus: DevStatus            // "Ready for dev" / "Completed"
  
  // + ALL mixins: Children, Geometry, Corner, Blend, Layout, AutoLayout, Container, IndividualStrokes
}
```

**Key behaviors:**
- Can be converted to GroupNode and vice-versa in the UI
- `clipsContent: true` clips children that extend beyond bounds (= `overflow: hidden`)
- `inferredAutoLayout` — Figma heuristically infers flex layout from manual positioning (useful concept for Scytle's AI)
- Children sorted back-to-front: `children[0]` = bottommost, `children[last]` = topmost

**CSS mapping:**
```
FrameNode                     →  <div>
  clipsContent: true          →  overflow: hidden
  layoutMode: 'HORIZONTAL'   →  display: flex; flex-direction: row
  layoutMode: 'VERTICAL'     →  display: flex; flex-direction: column
  layoutMode: 'GRID'         →  display: grid
  paddingTop/Right/Bottom/Left → padding: T R B L
  itemSpacing                 →  gap
  layoutWrap: 'WRAP'          →  flex-wrap: wrap
  primaryAxisAlignItems       →  justify-content (MIN→start, MAX→end, CENTER→center, SPACE_BETWEEN→space-between)
  counterAxisAlignItems       →  align-items (MIN→start, MAX→end, CENTER→center, BASELINE→baseline)
  cornerRadius                →  border-radius
  fills (solid color)         →  background-color
  fills (gradient)            →  background: linear-gradient(...)
  fills (image)               →  background-image: url(...)
  strokes                     →  border
  effects (drop shadow)       →  box-shadow
  effects (blur)              →  filter: blur(...)
  opacity                     →  opacity
```

### 4B. TextNode — Rich Text Leaf

**Type-specific properties:**
```typescript
interface TextNode {
  type: 'TEXT'
  hasMissingFont: boolean
  
  // Content
  characters: string             // The raw text content
  autoRename: boolean            // Sync name with characters
  
  // Alignment
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM'
  
  // Auto-resize behavior
  textAutoResize: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'
  textTruncation: 'DISABLED' | 'ENDING'
  maxLines: number | null
  
  // Paragraph
  paragraphIndent: number
  paragraphSpacing: number
  listSpacing: number
  hangingPunctuation: boolean
  hangingList: boolean
  
  // Typography (can be MIXED per-range via figma.mixed)
  fontSize: number | mixed
  fontName: FontName | mixed      // { family: string, style: string }
  fontWeight: number | mixed      // readonly computed value
  textCase: TextCase | mixed      // ORIGINAL, UPPER, LOWER, TITLE, SMALL_CAPS, SMALL_CAPS_FORCED
  textDecoration: TextDecoration | mixed  // NONE, UNDERLINE, STRIKETHROUGH
  letterSpacing: LetterSpacing | mixed    // { value: number, unit: 'PIXELS' | 'PERCENT' }
  lineHeight: LineHeight | mixed          // { value: number, unit: 'PIXELS' | 'PERCENT' | 'AUTO' }
  leadingTrim: LeadingTrim | mixed
  openTypeFeatures: object
  
  // NO children — TextNode is always a leaf
  // + Geometry, Blend, Layout mixins (for fills on text, positioning, etc.)
}
```

**Key behaviors:**
- **No children** — text content is a `characters` string, not child nodes
- **Mixed styling via `figma.mixed`** — different characters can have different font sizes, colors, weights
  - Range functions: `setRangeFontSize()`, `setRangeFills()`, `setRangeListOptions()`
- **Auto-resize modes:**
  - `NONE` — Fixed width and height, text may overflow
  - `WIDTH_AND_HEIGHT` — Both expand to fit text (like inline element)
  - `HEIGHT` — Fixed width, height auto-expands (like block text)
  - `TRUNCATE` — Fixed size, text truncated with ellipsis

**CSS mapping:**
```
TextNode                         →  <p> / <span> / <h1-h6>
  characters                     →  textContent
  textAlignHorizontal: 'CENTER'  →  text-align: center
  textAlignVertical: 'CENTER'    →  display: flex; align-items: center (on parent)
  fontSize                       →  font-size
  fontName.family                →  font-family
  fontName.style                 →  font-weight + font-style
  letterSpacing                  →  letter-spacing
  lineHeight                     →  line-height
  textCase: 'UPPER'              →  text-transform: uppercase
  textDecoration: 'UNDERLINE'    →  text-decoration: underline
  textAutoResize: 'HEIGHT'       →  width: fixed; height: auto
  textTruncation: 'ENDING'       →  text-overflow: ellipsis; overflow: hidden
  maxLines: 2                    →  -webkit-line-clamp: 2
  fills (on text)                →  color (first solid fill)
```

### 4C. RectangleNode — Shape Leaf

> "The rectangle is one of the most commonly used shapes in Figma. A notable feature it has over other kinds of shapes is the ability to specify independent corner radius values."

**Type-specific properties:**
```typescript
interface RectangleNode {
  type: 'RECTANGLE'
  
  // Corner radius (independent per corner)
  cornerRadius: number | mixed        // Uniform or mixed
  cornerSmoothing: number             // 0-1 (iOS squircle at 0.6)
  topLeftRadius: number
  topRightRadius: number
  bottomLeftRadius: number
  bottomRightRadius: number
  
  // Individual border widths
  strokeTopWeight: number
  strokeBottomWeight: number
  strokeLeftWeight: number
  strokeRightWeight: number
  
  // NO children — leaf node
  // + Geometry, Blend, Layout mixins
}
```

**Key behaviors:**
- Used as: image container (with image fill), background shape, decorative element, card container, button background
- Independent corner radii = CSS `border-radius: TL TR BR BL`
- `cornerSmoothing` = Figma's "squircle" — hard to replicate in CSS (closest is `border-radius` but not identical)

**Scytle note:** We DON'T need a separate RectangleNode. Our FrameNode can handle everything RectangleNode does — a Frame with no children and corner radius IS a rectangle. The only thing Rectangle has that Frame doesn't is `cornerSmoothing` (squircle), which we can handle as a CSS custom property or ignore in v1.

### 4D. GroupNode — Frameless Grouping

**Type-specific properties:**
```typescript
interface GroupNode {
  type: 'GROUP'
  
  // Children (has ChildrenMixin)
  children: ReadonlyArray<SceneNode>
  
  // Container
  expanded: boolean
  
  // Blend (opacity, effects, masks)
  opacity: number
  blendMode: BlendMode
  effects: Effect[]
  isMask: boolean
  
  // Layout (position, size — but derived from children)
  x: number
  y: number
  width: number   // readonly, auto-calculated from children bounds
  height: number  // readonly, auto-calculated from children bounds
  
  // NO geometry (fills, strokes) — groups are "transparent"
  // NO auto-layout — just visual grouping
  // NO corner radius
}
```

**Key behaviors:**
- Group size is ALWAYS derived from children's bounding box — you can't manually set width/height
- Groups can be converted to Frames and vice-versa
- No fills/strokes of their own — only blend effects (opacity, shadow)
- Useful for: grouping related elements for mass-move, applying shared opacity/effects

**Scytle note:** We probably DON'T need GroupNode in v1. Frames serve as both containers and groups. Groups are a legacy concept from before auto-layout existed.

### 4E. ComponentNode — Reusable Element Definition

```typescript
interface ComponentNode extends FrameNode {
  type: 'COMPONENT'
  
  // Component-specific
  createInstance(): InstanceNode
  getInstancesAsync(): Promise<InstanceNode[]>
  
  // Component properties (exposed controls)
  componentPropertyDefinitions: Map<string, ComponentPropertyDefinition>
  addComponentProperty(name, type, defaultValue): string
  deleteComponentProperty(name): void
  
  // Publishable
  description: string             // Plain text annotation
  descriptionMarkdown: string     // Rich text annotation
  documentationLinks: DocumentationLink[]
  key: string                     // Import key for library
  remote: boolean                 // From team library (read-only)
  
  // Variant
  variantProperties: object | null
  
  // + ALL FrameNode properties (auto-layout, fills, children, etc.)
}
```

**Key insight:** ComponentNode IS a FrameNode with extra capabilities. It has ALL Frame properties plus component-specific methods.

**Component Property Types:** `BOOLEAN` | `TEXT` | `INSTANCE_SWAP` | `VARIANT`

### 4F. InstanceNode — Component Copy with Overrides

```typescript
interface InstanceNode extends FrameNode {
  type: 'INSTANCE'
  
  // Instance-specific
  mainComponent: ComponentNode | null        // Source component
  getMainComponentAsync(): Promise<ComponentNode | null>
  swapComponent(componentNode: ComponentNode): void
  detachInstance(): FrameNode                // Converts to plain Frame
  
  // Override system
  componentProperties: ComponentProperties   // Current property values
  setProperties(properties: object): void
  overrides: { id: string, overriddenFields: string[] }[]
  removeOverrides(): void
  
  // Nesting
  scaleFactor: number
  exposedInstances: InstanceNode[]
  isExposedInstance: boolean
  
  // + ALL FrameNode properties
}
```

**Key insight:** Instance IS a Frame that remembers its source component. Overrides = which properties differ from the component definition.

### 4G. SectionNode — Organizational Container

```typescript
interface SectionNode {
  type: 'SECTION'
  sectionContentsHidden: boolean   // Hide contents toggle
  devStatus: DevStatus             // "Ready for dev" marker
  
  // Children (has ChildrenMixin)
  children: ReadonlyArray<SceneNode>
  
  // Geometry (limited — fills only)
  fills: Paint[]
  fillStyleId: string
  
  // Layout (position/size only, no auto-layout)
  x: number
  y: number  
  width: number
  height: number
  
  // NO auto-layout, NO corner radius, NO strokes, NO blend/effects
}
```

**Scytle note:** Sections are primarily for organizing work on the canvas (like "Homepage" section, "About" section). We might use this concept for page-level containers in our canvas view.

---

## 5. Auto-Layout System

This is the MOST important system for Scytle because auto-layout maps directly to CSS Flexbox/Grid, and our canvas renders HTML/CSS.

### Figma Auto-Layout → CSS Mapping

```
┌──────────────────────────────────────────────────────────────────┐
│  FIGMA PROPERTY                │  CSS EQUIVALENT                 │
├────────────────────────────────┼─────────────────────────────────┤
│  layoutMode: 'HORIZONTAL'     │  display: flex;                 │
│                                │  flex-direction: row            │
│  layoutMode: 'VERTICAL'       │  display: flex;                 │
│                                │  flex-direction: column         │
│  layoutMode: 'GRID'           │  display: grid                  │
│  layoutMode: 'NONE'           │  position: relative (manual)    │
├────────────────────────────────┼─────────────────────────────────┤
│  FLEX ALIGNMENT                                                  │
├────────────────────────────────┼─────────────────────────────────┤
│  primaryAxisAlignItems: 'MIN' │  justify-content: flex-start    │
│  primaryAxisAlignItems: 'MAX' │  justify-content: flex-end      │
│  primaryAxisAlignItems: 'CENTER'│ justify-content: center        │
│  primaryAxisAlignItems: 'SPACE_BETWEEN'│ justify-content: space-between│
│                                │                                 │
│  counterAxisAlignItems: 'MIN' │  align-items: flex-start        │
│  counterAxisAlignItems: 'MAX' │  align-items: flex-end          │
│  counterAxisAlignItems: 'CENTER'│ align-items: center            │
│  counterAxisAlignItems: 'BASELINE'│ align-items: baseline        │
│                                │                                 │
│  counterAxisAlignContent: 'AUTO'│ align-content: stretch         │
│  counterAxisAlignContent: 'SPACE_BETWEEN'│ align-content: space-between│
├────────────────────────────────┼─────────────────────────────────┤
│  SPACING & PADDING                                               │
├────────────────────────────────┼─────────────────────────────────┤
│  itemSpacing: 16              │  gap: 16px                       │
│  counterAxisSpacing: 8        │  column-gap/row-gap: 8px        │
│  paddingTop/Right/Bottom/Left │  padding: T R B L                │
├────────────────────────────────┼─────────────────────────────────┤
│  WRAPPING                                                        │
├────────────────────────────────┼─────────────────────────────────┤
│  layoutWrap: 'WRAP'           │  flex-wrap: wrap                 │
│  layoutWrap: 'NO_WRAP'        │  flex-wrap: nowrap               │
├────────────────────────────────┼─────────────────────────────────┤
│  GRID LAYOUT                                                     │
├────────────────────────────────┼─────────────────────────────────┤
│  gridRowCount                 │  grid-template-rows              │
│  gridColumnCount              │  grid-template-columns           │
│  gridRowGap                   │  row-gap                         │
│  gridColumnGap                │  column-gap                      │
│  gridRowSizes                 │  grid-template-rows values       │
│  gridColumnSizes              │  grid-template-columns values    │
├────────────────────────────────┼─────────────────────────────────┤
│  CHILD POSITIONING                                               │
├────────────────────────────────┼─────────────────────────────────┤
│  layoutAlign: 'STRETCH'       │  align-self: stretch             │
│  layoutAlign: 'MIN'           │  align-self: flex-start          │
│  layoutAlign: 'CENTER'        │  align-self: center              │
│  layoutAlign: 'MAX'           │  align-self: flex-end            │
│  layoutGrow: 1                │  flex-grow: 1                    │
│  layoutPositioning: 'ABSOLUTE'│  position: absolute              │
│  gridRowSpan: 2               │  grid-row: span 2                │
│  gridColumnSpan: 3            │  grid-column: span 3             │
└──────────────────────────────────────────────────────────────────┘
```

### Scytle Simplification

Since we render to HTML/CSS directly, we can store CSS-native values instead of Figma's enum system:

```typescript
// Instead of Figma's enums, we store CSS values directly
interface ScytleFrameLayout {
  display: 'flex' | 'grid' | 'block'
  flexDirection?: 'row' | 'column'
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between'
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  flexWrap?: 'wrap' | 'nowrap'
  gap?: number
  padding?: { top: number, right: number, bottom: number, left: number }
  
  // Grid-specific
  gridTemplateColumns?: string
  gridTemplateRows?: string
}
```

**However**, for the AI generation pipeline, we may want to use Figma-like semantic names (HORIZONTAL/VERTICAL/MIN/MAX) because they're more intuitive for the AI to generate, and we translate at render time.

---

## 6. Sizing System

### Figma's Three Sizing Modes

| Mode | `layoutSizingHorizontal/Vertical` | CSS Equivalent | Behavior |
|------|----------------------------------|----------------|----------|
| **Fixed** | `'FIXED'` | `width: 300px` | Explicit pixel value |
| **Hug** | `'HUG'` | `width: fit-content` | Shrink to content size |
| **Fill** | `'FILL'` | `flex: 1` / `width: 100%` | Expand to fill parent |

### Size Constraints

```typescript
// Figma
minWidth: number | null     // null = no constraint
maxWidth: number | null
minHeight: number | null
maxHeight: number | null

// CSS equivalent
min-width: 200px  // or unset
max-width: 800px  // or unset
```

### Sizing Mode Interactions

```
Parent: Auto-layout HORIZONTAL
├── Child A: layoutSizingHorizontal = 'FIXED', width = 200   → width: 200px
├── Child B: layoutSizingHorizontal = 'FILL', layoutGrow = 1 → flex: 1
├── Child C: layoutSizingHorizontal = 'HUG'                  → width: fit-content
└── Child D: layoutPositioning = 'ABSOLUTE', x = 10, y = 10  → position: absolute
```

---

## 7. Visual Properties

### Fills (Paint[])

```typescript
type Paint = 
  | SolidPaint        // { type: 'SOLID', color: RGBA, opacity: number }
  | GradientPaint     // { type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND', gradientStops: [...] }
  | ImagePaint        // { type: 'IMAGE', imageHash: string, scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE' }
  | VideoPaint        // { type: 'VIDEO', videoHash: string }
```

**Key:** A node can have MULTIPLE fills stacked. First fill = bottommost. This is more powerful than CSS (which requires multiple background layers).

### Strokes

```typescript
{
  strokes: Paint[]                              // Stroke colors (same Paint types as fills)
  strokeWeight: number                          // Uniform weight
  strokeTopWeight: number                       // Individual sides
  strokeRightWeight: number
  strokeBottomWeight: number
  strokeLeftWeight: number
  strokeAlign: 'INSIDE' | 'OUTSIDE' | 'CENTER' // Where stroke renders relative to path
  strokeCap: 'NONE' | 'ROUND' | 'SQUARE' | 'LINE_ARROW' | 'TRIANGLE_ARROW'
  strokeJoin: 'MITER' | 'BEVEL' | 'ROUND'
  dashPattern: number[]                         // Dashed line pattern
}
```

**CSS mapping:**
- `strokeAlign: 'INSIDE'` → `box-sizing: border-box; border: Npx solid color` (or `outline`)
- `strokeAlign: 'OUTSIDE'` → `box-shadow: 0 0 0 Npx color` (workaround, or `outline`)
- `strokeAlign: 'CENTER'` → standard `border`
- Individual stroke weights → `border-top/right/bottom/left-width`

### Effects

```typescript
type Effect =
  | DropShadowEffect      // { type: 'DROP_SHADOW', color: RGBA, offset: Vector, radius: number, spread: number }
  | InnerShadowEffect     // { type: 'INNER_SHADOW', ... }  → box-shadow: inset
  | LayerBlurEffect       // { type: 'LAYER_BLUR', radius: number }  → filter: blur()
  | BackgroundBlurEffect  // { type: 'BACKGROUND_BLUR', radius: number }  → backdrop-filter: blur()
```

**CSS mapping:**
```
DROP_SHADOW   → box-shadow: offsetX offsetY radius spread color
INNER_SHADOW  → box-shadow: inset offsetX offsetY radius spread color
LAYER_BLUR    → filter: blur(radius)
BACKGROUND_BLUR → backdrop-filter: blur(radius)
```

---

## 8. Typography System

### Text Properties Overview

```typescript
interface TextProperties {
  // Content
  characters: string                    // The actual text

  // Block-level alignment
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM'
  
  // Box sizing behavior
  textAutoResize: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'
  textTruncation: 'DISABLED' | 'ENDING'
  maxLines: number | null
  
  // Character-level (can be mixed per range)
  fontSize: number
  fontName: { family: string, style: string }  // e.g. { family: 'Inter', style: 'Bold' }
  fontWeight: number                            // 100-900
  textCase: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED'
  textDecoration: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH'
  letterSpacing: { value: number, unit: 'PIXELS' | 'PERCENT' }
  lineHeight: { value: number, unit: 'PIXELS' | 'PERCENT' | 'AUTO' }
  
  // Paragraph
  paragraphIndent: number
  paragraphSpacing: number
  listSpacing: number
  
  // OpenType features
  openTypeFeatures: object
}
```

### CSS Mapping

```
fontSize: 16              → font-size: 16px
fontName.family: 'Inter'  → font-family: Inter
fontName.style: 'Bold'    → font-weight: 700
fontName.style: 'Italic'  → font-style: italic
letterSpacing: { value: 2, unit: 'PERCENT' } → letter-spacing: 0.02em
lineHeight: { value: 150, unit: 'PERCENT' }  → line-height: 1.5
textCase: 'UPPER'         → text-transform: uppercase
textDecoration: 'UNDERLINE' → text-decoration: underline
paragraphSpacing: 16      → margin-bottom: 16px (on <p> elements)
textAlignHorizontal       → text-align
maxLines + truncation      → -webkit-line-clamp + text-overflow: ellipsis
```

### Scytle Simplification

For **Phase 1**, we won't support mixed text styling within a single text node. Each text node has uniform styling. This means:

```typescript
interface ScytleTextNode {
  type: 'text'
  characters: string
  
  // Typography (always uniform, no mixed)
  fontFamily: string          // 'Inter'
  fontWeight: number          // 400, 500, 600, 700
  fontSize: number            // 16
  lineHeight: number | 'auto' // 1.5 or 'auto'
  letterSpacing: number       // 0 (in pixels)
  textAlign: 'left' | 'center' | 'right' | 'justify'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textDecoration: 'none' | 'underline' | 'line-through'
  
  // Color (from fills)
  color: string               // oklch or hex
}
```

If we need rich text later, we can add it by supporting a "segments" array with per-range styling.

---

## 9. Component & Instance System

### How Figma's Component System Works

```
ComponentNode (Definition)
├── Has all FrameNode properties + componentPropertyDefinitions
├── Acts as a "master" that instances reference
├── Can define exposed properties: BOOLEAN, TEXT, INSTANCE_SWAP, VARIANT
│
├── InstanceNode A (Copy)
│   ├── Links to ComponentNode via mainComponent
│   ├── Inherits all properties from component
│   ├── Can override: fills, strokes, effects, text, visibility, etc.
│   ├── overrides: [{ id: "1:5", overriddenFields: ["fills", "characters"] }]
│   └── Can be detached: detachInstance() → returns FrameNode
│
├── InstanceNode B (Another copy)
│   └── Different overrides
│
└── ComponentSetNode (Variant container)
    ├── Contains multiple ComponentNode variants
    ├── Variants differ by named properties (e.g., Size=Large, State=Hover)
    └── Instances can switch between variants via componentProperties
```

### REST API Wire Format for Components

```json
{
  "type": "COMPONENT",
  "name": "Button",
  "componentPropertyDefinitions": {
    "Label#1:1": { "type": "TEXT", "defaultValue": "Click me" },
    "Icon#1:2": { "type": "INSTANCE_SWAP", "defaultValue": "icon-arrow" },
    "Disabled#1:3": { "type": "BOOLEAN", "defaultValue": false }
  },
  "children": [...]
}

{
  "type": "INSTANCE",
  "name": "Button",
  "componentId": "42:100",
  "componentProperties": {
    "Label#1:1": { "type": "TEXT", "value": "Get Started" },
    "Disabled#1:3": { "type": "BOOLEAN", "value": false }
  },
  "overrides": [
    { "id": "42:101", "overriddenFields": ["fills"] }
  ],
  "children": [...]
}
```

### Scytle Phase 1 Approach

**Skip components/instances entirely.** Every element is a unique node. In Phase 2, we add:
- Define reusable "Scytle Components" (basically a saved frame tree with exposed properties)
- Instances that reference a component and track overrides
- AI generates instances of common components (Button, Card, NavItem) rather than raw primitives

---

## 10. Layer Structure & Naming Conventions

### Figma's Layer Naming Patterns

From analyzing Figma files, common conventions:

```
Page: Homepage
├── Section: Hero                     ← SectionNode or top-level FrameNode
│   ├── Frame: Container             ← Main content wrapper (max-width)
│   │   ├── Frame: Content Left      ← Flex child
│   │   │   ├── Text: Heading        ← Semantic name
│   │   │   ├── Text: Subheading
│   │   │   └── Frame: CTA Group     ← Button container
│   │   │       ├── Frame: Button Primary
│   │   │       │   └── Text: Label
│   │   │       └── Frame: Button Secondary
│   │   │           └── Text: Label
│   │   └── Frame: Image Container   ← Right side
│   │       └── Rectangle: Hero Image ← Image fill
│   └── Rectangle: Background        ← Background shape/gradient
│
├── Section: Features
│   ├── Frame: Container
│   │   ├── Text: Section Title
│   │   ├── Text: Section Description
│   │   └── Frame: Grid              ← Grid layout
│   │       ├── Frame: Feature Card 1
│   │       │   ├── Frame: Icon Container
│   │       │   │   └── Instance: Icon/Check
│   │       │   ├── Text: Title
│   │       │   └── Text: Description
│   │       ├── Frame: Feature Card 2
│   │       └── Frame: Feature Card 3
```

### Naming Convention Patterns

| Pattern | Example | Purpose |
|---------|---------|---------|
| Semantic role | "Hero", "Features", "Footer" | Section identification |
| Content description | "Heading", "Subheading", "Body Text" | Text role |
| Layout role | "Container", "Grid", "Row", "Column" | Layout structure |
| Component type | "Button Primary", "Card", "NavItem" | UI component |
| State suffix | "Button/Hover", "Card/Active" | Interactive states |
| Number suffix | "Feature Card 1", "Feature Card 2" | Repeated items |
| Slash hierarchy | "Icon/Check", "Button/Primary/Large" | Component variants |

### How AI Should Name Layers in Scytle

```typescript
// AI-generated layer naming rules
const NAMING_RULES = {
  // Sections get semantic names
  section: 'Hero' | 'Features' | 'Pricing' | 'Testimonials' | 'CTA' | 'Footer',
  
  // Containers get structural names
  container: 'Container' | 'Wrapper' | 'Content' | 'Grid' | 'Row' | 'Column',
  
  // Text gets content-role names
  text: 'Heading' | 'Subheading' | 'Description' | 'Label' | 'Caption' | 'Body',
  
  // Interactive elements get type names
  interactive: 'Button Primary' | 'Button Secondary' | 'Link' | 'Input',
  
  // Images get context names
  image: 'Hero Image' | 'Avatar' | 'Logo' | 'Feature Icon' | 'Background',
}
```

### Children Ordering

- **Back-to-front**: `children[0]` = bottommost visual layer, `children[last]` = topmost
- In a layers panel, this is displayed **bottom-up** (topmost layer at the TOP of the panel)
- For Scytle: We use CSS `z-index` or DOM order for layering. In auto-layout, DOM order = visual order (no z-index needed). For absolute-positioned elements, later children are on top.

---

## 11. REST API Wire Format

### How Figma Serializes Nodes (JSON)

This is the format used in Figma's REST API (`GET /v1/files/:key`). Understanding this helps design Scytle's storage format.

#### FRAME (also used by GROUP, COMPONENT, INSTANCE)

```json
{
  "id": "1:2",
  "name": "Hero Section",
  "type": "FRAME",
  "visible": true,
  "locked": false,
  
  "absoluteBoundingBox": { "x": 0, "y": 0, "width": 1440, "height": 800 },
  "absoluteRenderBounds": { "x": -4, "y": -4, "width": 1448, "height": 808 },
  "relativeTransform": [[1, 0, 0], [0, 1, 0]],
  
  "clipsContent": true,
  "constraints": { "horizontal": "MIN", "vertical": "MIN" },
  
  "layoutMode": "VERTICAL",
  "primaryAxisSizingMode": "AUTO",
  "counterAxisSizingMode": "FIXED",
  "primaryAxisAlignItems": "MIN",
  "counterAxisAlignItems": "CENTER",
  "paddingLeft": 80, "paddingRight": 80,
  "paddingTop": 120, "paddingBottom": 120,
  "itemSpacing": 32,
  "layoutWrap": "NO_WRAP",
  
  "fills": [
    { "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL",
      "color": { "r": 0.96, "g": 0.96, "b": 0.98, "a": 1 } }
  ],
  "strokes": [],
  "strokeWeight": 1,
  "strokeAlign": "INSIDE",
  
  "cornerRadius": 0,
  "rectangleCornerRadii": [0, 0, 0, 0],
  
  "effects": [
    { "type": "DROP_SHADOW", "visible": true, "blendMode": "NORMAL",
      "color": { "r": 0, "g": 0, "b": 0, "a": 0.1 },
      "offset": { "x": 0, "y": 4 }, "radius": 8, "spread": 0 }
  ],
  
  "blendMode": "PASS_THROUGH",
  "opacity": 1,
  
  "children": [
    { "id": "1:3", "name": "Heading", "type": "TEXT", "..." },
    { "id": "1:4", "name": "Content", "type": "FRAME", "..." }
  ]
}
```

#### TEXT

```json
{
  "id": "1:3",
  "name": "Heading",
  "type": "TEXT",
  "visible": true,
  
  "absoluteBoundingBox": { "x": 80, "y": 120, "width": 600, "height": 72 },
  
  "characters": "Build Better Products",
  
  "style": {
    "fontFamily": "Inter",
    "fontPostScriptName": "Inter-Bold",
    "fontWeight": 700,
    "fontSize": 56,
    "textAlignHorizontal": "LEFT",
    "textAlignVertical": "TOP",
    "letterSpacing": -1.12,
    "lineHeightPx": 67.2,
    "lineHeightPercent": 120,
    "lineHeightUnit": "FONT_SIZE_%"
  },
  
  "characterStyleOverrides": [],
  "styleOverrideTable": {},
  
  "fills": [
    { "type": "SOLID", "color": { "r": 0.07, "g": 0.07, "b": 0.09, "a": 1 } }
  ],
  
  "layoutAlign": "STRETCH",
  "layoutGrow": 0,
  "layoutSizingHorizontal": "FILL",
  "layoutSizingVertical": "HUG"
}
```

#### KEY OBSERVATIONS

1. **Flat structure within children** — Each child has its full properties, no inheritance in the JSON
2. **Colors are RGBA 0-1 floats** — Not hex, not 0-255
3. **`style` object on TEXT** — Contains the default typography, `styleOverrideTable` has per-character overrides
4. **`layoutMode` on container + `layoutAlign`/`layoutGrow`/`layoutSizingHorizontal`/`layoutSizingVertical` on children** — Layout is a parent-child relationship
5. **Transform matrix** — `relativeTransform` is a 2x3 affine matrix, not just x/y. For our purposes, we only need x, y, width, height, rotation
6. **`absoluteBoundingBox` vs `absoluteRenderBounds`** — Bounding box excludes effects (shadows), render bounds includes them

---

## 12. Scytle Node Type Mapping

Based on everything above, here's the recommended Scytle node type system:

### Phase 1: 5 Node Types

```typescript
// ============================================
// SCYTLE NODE TYPES — Phase 1
// ============================================

type ScytleNodeType = 'frame' | 'text' | 'image' | 'icon' | 'button'

// Shared base for all nodes
interface ScytleBaseNode {
  id: string              // Generated unique ID
  name: string            // Layer name (AI-generated semantic name)
  type: ScytleNodeType
  visible: boolean
  locked: boolean
  
  // Position & Size
  x: number
  y: number
  width: number | 'auto'  // 'auto' = hug content
  height: number | 'auto'
  
  // Sizing within parent auto-layout
  sizing: {
    horizontal: 'fixed' | 'hug' | 'fill'
    vertical: 'fixed' | 'hug' | 'fill'
  }
  
  // Constraints (for absolute positioning)
  positioning: 'auto' | 'absolute'
  
  // Visual
  opacity: number         // 0-1
  rotation: number        // degrees
  overflow: 'visible' | 'hidden'  // = clipsContent
  
  // Border radius
  borderRadius: number | {
    topLeft: number
    topRight: number
    bottomRight: number
    bottomLeft: number
  }
  
  // Fills
  fills: ScytleFill[]
  
  // Strokes/Borders
  border?: {
    color: string
    width: number | { top: number, right: number, bottom: number, left: number }
    style: 'solid' | 'dashed' | 'dotted'
  }
  
  // Effects
  shadows: ScytleShadow[]
  blur?: number            // filter: blur()
  backdropBlur?: number    // backdrop-filter: blur()
}

// Fill types
type ScytleFill = 
  | { type: 'solid', color: string }                    // oklch or hex
  | { type: 'gradient', gradient: string }               // CSS gradient string
  | { type: 'image', src: string, fit: 'cover' | 'contain' | 'fill' }

// Shadow type
interface ScytleShadow {
  type: 'drop' | 'inner'
  color: string
  x: number
  y: number
  blur: number
  spread: number
}

// ============================================
// FRAME NODE — Container (= Figma FrameNode)
// ============================================
interface ScytleFrameNode extends ScytleBaseNode {
  type: 'frame'
  children: ScytleNode[]    // Back-to-front order
  
  // Layout
  layout: {
    mode: 'flex' | 'grid' | 'none'
    
    // Flex properties
    direction?: 'row' | 'column'
    justify?: 'start' | 'end' | 'center' | 'between'
    align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
    wrap?: boolean
    gap?: number
    
    // Grid properties
    columns?: number | string    // 3 or "1fr 2fr 1fr"
    rows?: number | string
    columnGap?: number
    rowGap?: number
  }
  
  // Padding
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// ============================================
// TEXT NODE — Rich text leaf (= Figma TextNode)
// ============================================
interface ScytleTextNode extends ScytleBaseNode {
  type: 'text'
  // NO children
  
  // Content
  characters: string
  
  // Typography
  fontFamily: string
  fontWeight: number           // 100-900
  fontSize: number
  lineHeight: number | 'auto'  // multiplier (1.5) or 'auto'
  letterSpacing: number         // pixels
  textAlign: 'left' | 'center' | 'right' | 'justify'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textDecoration: 'none' | 'underline' | 'line-through'
  
  // Text box behavior
  autoResize: 'none' | 'width-and-height' | 'height' | 'truncate'
  maxLines?: number
  
  // Color (overrides fills for text)
  color: string
  
  // HTML tag hint (for semantic HTML generation)
  htmlTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'a' | 'li'
}

// ============================================
// IMAGE NODE — Image container (= Figma Rectangle with image fill)
// ============================================
interface ScytleImageNode extends ScytleBaseNode {
  type: 'image'
  // NO children
  
  src: string               // Image URL or placeholder
  alt: string               // Alt text for accessibility
  fit: 'cover' | 'contain' | 'fill'
  
  // Placeholder state (for wireframe mode)
  isPlaceholder: boolean
  placeholderLabel?: string  // "Hero Image", "Avatar"
}

// ============================================
// ICON NODE — SVG icon (= Figma vector/component instance)
// ============================================
interface ScytleIconNode extends ScytleBaseNode {
  type: 'icon'
  // NO children
  
  iconName: string          // Icon library reference: "lucide:arrow-right"
  iconSize: number          // Rendered size in px
  color: string             // Icon color
}

// ============================================
// BUTTON NODE — Interactive element (= Figma Frame with text child in auto-layout)
// ============================================
interface ScytleButtonNode extends ScytleBaseNode {
  type: 'button'
  // NO children (self-contained)
  
  label: string
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size: 'sm' | 'md' | 'lg'
  
  // Optional icon
  icon?: string             // Icon name
  iconPosition?: 'left' | 'right'
  
  // Link behavior
  href?: string
}

// Union type
type ScytleNode = ScytleFrameNode | ScytleTextNode | ScytleImageNode | ScytleIconNode | ScytleButtonNode
```

### Phase 2 Additions

```typescript
// COMPONENT — Reusable definition
interface ScytleComponentNode extends ScytleFrameNode {
  type: 'component'
  componentId: string            // Unique component reference
  exposedProperties: {
    name: string
    type: 'text' | 'boolean' | 'instance-swap' | 'variant'
    defaultValue: string | boolean
  }[]
}

// INSTANCE — Copy of component
interface ScytleInstanceNode extends ScytleFrameNode {
  type: 'instance'
  componentId: string            // Reference to component
  overrides: Record<string, unknown>  // Changed properties
}

// GROUP — Visual grouping without layout
interface ScytleGroupNode extends ScytleBaseNode {
  type: 'group'
  children: ScytleNode[]
  // No layout, fills, or corner radius — just grouping
}
```

---

## 13. Properties Panel Mapping

### What Figma Shows in the Properties Panel (Right Sidebar)

When you select a node in Figma, the right panel shows:

```
┌─────────────────────────────────────────┐
│  DESIGN  PROTOTYPE  INSPECT  DEV MODE   │  ← Tab bar
├─────────────────────────────────────────┤
│                                         │
│  ▸ Alignment tools (6 buttons)          │  Row: align left/center/right/top/middle/bottom
│  ▸ Distribute (2 buttons)              │  Horizontal/vertical spacing
│                                         │
│  ── Position & Size ──                  │
│  X: 80      Y: 120                      │  Position inputs
│  W: 600     H: 72      🔒              │  Size inputs + lock aspect
│  ↺ 0°                                   │  Rotation
│                                         │
│  ── Auto Layout ──                      │  (only for frames with layoutMode)
│  ▸ Direction: → (row) / ↓ (column)     │
│  ▸ Gap: 16                              │
│  ▸ Padding: 24 24 24 24                │
│  ▸ Alignment matrix (3x3 grid)         │  Visual justify/align picker
│                                         │
│  ── Fill ──                             │
│  🟦 #1A1A2E  100%  ＋                   │  Color swatch + opacity + add
│                                         │
│  ── Stroke ──                           │
│  ⬜ #E5E5E5  1px  Inside  ＋            │
│                                         │
│  ── Effects ──                          │
│  ▸ Drop shadow ☀                        │
│  ▸ Blur (expand to configure)          │
│                                         │
│  ── Typography ── (text nodes only)     │
│  Inter  Bold  16  Auto                  │  Font/weight/size/lineHeight
│  Aa  ≡  ∥                               │  Case/align/spacing
│  Letter: 0  Paragraph: 0               │
│                                         │
│  ── Corner Radius ──                    │
│  ◰ 8   (or individual: 8 8 0 0)        │
│                                         │
│  ── Constraints ──                      │
│  H: Left    V: Top                      │  Constraint dropdowns
│                                         │
│  ── Component Properties ──             │  (instances only)
│  Label: "Click me"                      │
│  Show Icon: ✓                           │
│  Variant: Primary                       │
│                                         │
│  ── Export ──                           │
│  ＋ Add export setting                   │
│                                         │
└─────────────────────────────────────────┘
```

### Scytle Properties Panel — Simplified for Phase 1

```
┌─────────────────────────────────────────┐
│  DESIGN                                  │
├─────────────────────────────────────────┤
│                                         │
│  ── Position & Size ──                  │
│  X: ___  Y: ___                         │
│  W: ___ (Fixed ▾) H: ___ (Hug ▾)      │  Sizing mode dropdown
│                                         │
│  ── Layout ── (frames only)             │
│  Mode: [Flex ▾] [Row ▾]                │  
│  Justify: ← → ↔ ⇔                      │  Visual buttons
│  Align: ↑ ↕ ↓ ↕↕ ⊥                     │  Visual buttons  
│  Gap: ___                                │
│  Wrap: [toggle]                         │
│  Padding: T___ R___ B___ L___           │  Individual or uniform
│                                         │
│  ── Fill ──                             │
│  [color picker] opacity: ___%           │
│                                         │
│  ── Border ──                           │
│  Color: [picker] Width: ___ Style: [▾] │
│  Radius: ___ (or individual corners)    │
│                                         │
│  ── Effects ──                          │
│  Shadow: [add/configure]                │
│  Blur: ___                               │
│                                         │
│  ── Typography ── (text nodes only)     │
│  Font: [▾] Weight: [▾] Size: ___       │
│  Line Height: ___  Letter Spacing: ___  │
│  Align: [L C R J]  Transform: [▾]      │
│  Color: [picker]                        │
│                                         │
│  ── Visibility ──                       │
│  Visible: [toggle]  Opacity: ___%      │
│  Overflow: [visible ▾ / hidden]         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 14. Implementation Recommendations

### 14A. Node Storage Format

Store Scytle nodes as a flat map + tree references (like Figma's internal model):

```typescript
// Option A: Nested tree (simple, what we have now)
interface PageTree {
  rootFrame: ScytleFrameNode  // Contains nested children
}

// Option B: Flat map + parent references (better for large docs, like Figma)
interface PageDoc {
  nodes: Map<string, ScytleNode>   // id → node (children stored as id arrays)
  rootId: string
}

// RECOMMENDATION: Start with Option A (nested tree) for Phase 1.
// It's simpler, the AI generates a tree naturally, and our documents won't be huge.
// Migrate to Option B if performance becomes an issue with 1000+ nodes.
```

### 14B. AI Generation Output Format

The AI should generate a nested frame tree:

```json
{
  "type": "frame",
  "name": "Hero Section",
  "layout": { "mode": "flex", "direction": "column", "justify": "center", "align": "center", "gap": 32 },
  "padding": { "top": 120, "right": 80, "bottom": 120, "left": 80 },
  "sizing": { "horizontal": "fill", "vertical": "hug" },
  "fills": [{ "type": "solid", "color": "oklch(0.98 0.01 280)" }],
  "children": [
    {
      "type": "text",
      "name": "Heading",
      "characters": "Build Better Products, Faster",
      "fontFamily": "Inter",
      "fontWeight": 700,
      "fontSize": 56,
      "lineHeight": 1.15,
      "textAlign": "center",
      "color": "oklch(0.15 0.02 280)",
      "sizing": { "horizontal": "fill", "vertical": "hug" },
      "htmlTag": "h1"
    },
    {
      "type": "text",
      "name": "Subheading",
      "characters": "The AI-powered platform that turns your ideas into production-ready designs.",
      "fontFamily": "Inter",
      "fontWeight": 400,
      "fontSize": 20,
      "lineHeight": 1.6,
      "textAlign": "center",
      "color": "oklch(0.45 0.02 280)",
      "sizing": { "horizontal": "fill", "vertical": "hug" },
      "maxLines": null,
      "htmlTag": "p"
    },
    {
      "type": "frame",
      "name": "CTA Group",
      "layout": { "mode": "flex", "direction": "row", "gap": 16, "justify": "center" },
      "sizing": { "horizontal": "hug", "vertical": "hug" },
      "children": [
        {
          "type": "button",
          "name": "Primary CTA",
          "label": "Get Started Free",
          "variant": "primary",
          "size": "lg"
        },
        {
          "type": "button",
          "name": "Secondary CTA",
          "label": "Watch Demo",
          "variant": "outline",
          "size": "lg",
          "icon": "lucide:play",
          "iconPosition": "left"
        }
      ]
    }
  ]
}
```

### 14C. Renderer Implementation Priority

1. **Frame renderer** — `<div>` with flexbox/grid, padding, fills (background), border, border-radius, shadow, overflow
2. **Text renderer** — `<p>`/`<h1-h6>`/`<span>` with all typography CSS
3. **Image renderer** — `<img>` or `<div>` with background-image, placeholder state
4. **Button renderer** — Styled `<button>` or `<a>` with variant classes
5. **Icon renderer** — SVG icon from icon library (Lucide recommended)

### 14D. What We Intentionally Skip from Figma

| Figma Feature | Why We Skip It |
|---------------|----------------|
| Vector paths (`VectorNode`) | We render HTML, not SVG canvas |
| Boolean operations | No vector editing in Phase 1 |
| Masks (`isMask`) | Complex, rarely needed for web layouts |
| Blend modes beyond NORMAL | Limited CSS support, edge case |
| `cornerSmoothing` (squircle) | No CSS equivalent, visual-only |
| `relativeTransform` matrix | We use simple x/y/rotation |
| `constrainProportions` | Not needed for flex/grid layouts |
| `strokeCap`, `strokeJoin`, `dashPattern` | Vector-specific, not for web borders |
| `inferredAutoLayout` | We always use explicit auto-layout |
| `layoutGrids` (visual overlays) | IDE feature, not in output |
| Design tokens/variables | Phase 2 feature |
| Prototyping/reactions | Not a prototyping tool |
| FigJam nodes (sticky, connector, etc.) | Completely irrelevant |

### 14E. Key CSS-to-Figma Translations for the Renderer

```typescript
function scytleNodeToCSS(node: ScytleNode): React.CSSProperties {
  const base: React.CSSProperties = {
    position: node.positioning === 'absolute' ? 'absolute' : 'relative',
    ...(node.positioning === 'absolute' && { left: node.x, top: node.y }),
    opacity: node.opacity,
    ...(node.rotation && { transform: `rotate(${node.rotation}deg)` }),
    overflow: node.overflow,
    borderRadius: typeof node.borderRadius === 'number' 
      ? node.borderRadius 
      : `${node.borderRadius.topLeft}px ${node.borderRadius.topRight}px ${node.borderRadius.bottomRight}px ${node.borderRadius.bottomLeft}px`,
  }
  
  // Width/Height based on sizing mode
  if (node.sizing.horizontal === 'fixed') base.width = node.width
  else if (node.sizing.horizontal === 'fill') base.flex = 1
  // 'hug' = no width set (auto)
  
  if (node.sizing.vertical === 'fixed') base.height = node.height
  // 'hug' and 'fill' handled by flex
  
  // Fills
  if (node.fills.length > 0) {
    const fill = node.fills[0]
    if (fill.type === 'solid') base.backgroundColor = fill.color
    else if (fill.type === 'gradient') base.background = fill.gradient
    else if (fill.type === 'image') base.backgroundImage = `url(${fill.src})`
  }
  
  // Shadows
  if (node.shadows.length > 0) {
    base.boxShadow = node.shadows.map(s => 
      `${s.type === 'inner' ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
    ).join(', ')
  }
  
  // Frame-specific layout
  if (node.type === 'frame') {
    const { layout, padding } = node as ScytleFrameNode
    if (layout.mode === 'flex') {
      base.display = 'flex'
      base.flexDirection = layout.direction
      base.justifyContent = { start: 'flex-start', end: 'flex-end', center: 'center', between: 'space-between' }[layout.justify ?? 'start']
      base.alignItems = { start: 'flex-start', end: 'flex-end', center: 'center', stretch: 'stretch', baseline: 'baseline' }[layout.align ?? 'stretch']
      if (layout.gap) base.gap = layout.gap
      if (layout.wrap) base.flexWrap = 'wrap'
    } else if (layout.mode === 'grid') {
      base.display = 'grid'
      if (layout.columns) base.gridTemplateColumns = typeof layout.columns === 'number' ? `repeat(${layout.columns}, 1fr)` : layout.columns
    }
    base.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
  }
  
  // Text-specific
  if (node.type === 'text') {
    const t = node as ScytleTextNode
    base.fontFamily = t.fontFamily
    base.fontWeight = t.fontWeight
    base.fontSize = t.fontSize
    base.lineHeight = t.lineHeight === 'auto' ? 'normal' : t.lineHeight
    base.letterSpacing = t.letterSpacing
    base.textAlign = t.textAlign
    base.textTransform = t.textTransform
    base.textDecoration = t.textDecoration
    base.color = t.color
  }

  return base
}
```

---

## Summary: What Scytle Takes from Figma

| Figma Concept | Scytle Adaptation |
|---|---|
| Frame = `<div>` with flexbox | FrameNode → our core container, renders as div |
| Auto-layout → CSS Flexbox/Grid | Store CSS-friendly layout values, 1:1 mapping |
| Sizing modes (Fixed/Hug/Fill) | Keep these exact modes, map to CSS width/flex |
| Text as leaf with `characters` | TextNode with single uniform style (Phase 1) |
| Fills array (solid/gradient/image) | Simplified fills, one fill per node (Phase 1) |
| Effects (shadow, blur) | Direct CSS mapping |
| Mixin composition | TypeScript interfaces with shared base |
| Children back-to-front | DOM order = visual order |
| Component/Instance | Phase 2 |
| Layer naming conventions | AI generates semantic layer names |
| REST API JSON format | Our storage format is similar but CSS-native |

---

*Generated from Figma Plugin API docs and REST API docs. Sources:*
- *https://developers.figma.com/docs/plugins/api/nodes/*
- *https://developers.figma.com/docs/plugins/api/node-properties/*
- *https://developers.figma.com/docs/plugins/api/FrameNode/*
- *https://developers.figma.com/docs/plugins/api/TextNode/*
- *https://developers.figma.com/docs/plugins/api/RectangleNode/*
- *https://developers.figma.com/docs/plugins/api/GroupNode/*
- *https://developers.figma.com/docs/plugins/api/ComponentNode/*
- *https://developers.figma.com/docs/plugins/api/InstanceNode/*
- *https://developers.figma.com/docs/plugins/api/SectionNode/*
- *https://developers.figma.com/docs/rest-api/file-node-types/*
- *https://developers.figma.com/docs/rest-api/files/*
