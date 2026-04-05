# Pencil.dev MCP Deep Dive — AI Generation Pipeline Research

> Researched: 2026-04-03
> Method: Hands-on interaction with Pencil MCP tools via Claude Code
> Status: COMPLETE — includes live design generation test

---

## 1. How the AI Gets Its Instructions

Pencil's entire AI generation system works through **layered prompt injection via MCP tools**. There is NO single "system prompt" — instead, the AI accumulates context through multiple tool calls:

### Layer 1: Schema + Editor State (`get_editor_state`)
The very first call returns:
- The active `.pen` file path
- Current user selection (if any)
- List of top-level frames (screens)
- List of reusable components in the document
- **The complete `.pen` file schema** (TypeScript types for every node type)

This schema is ~300+ lines and defines:
- All node types: `Frame`, `Rectangle`, `Ellipse`, `Line`, `Polygon`, `Path`, `Text`, `Note`, `Prompt`, `Context`, `Group`, `IconFont`, `Ref`
- Layout system: `layout`, `gap`, `padding`, `justifyContent`, `alignItems`
- Sizing: `SizingBehavior` (`fit_content`, `fill_container`)
- Fills: colors, gradients, images, mesh gradients
- Strokes, effects (blur, shadow)
- Components & instances (`reusable`, `ref`, `descendants`)
- Variables & theming system
- Text system (`textGrowth`, `TextStyle`)

### Layer 2: General Design Instructions (embedded in `get_editor_state` response)
Attached to the schema response is a massive set of general instructions (~200 lines):
- Placeholder workflow (MUST set `placeholder: true` during work)
- Flexbox layout rules
- Text sizing rules (critical — `textGrowth` must be set before width/height)
- Component/instance override patterns
- Coordinate system rules
- Fill rules (text has NO color by default — MUST set `fill`)
- Table hierarchy rules (Table → Row → Cell → Content)
- Graph/chart guidelines
- Image handling (NO image node type — images are fills on frames)
- Validation workflow

### Layer 3: Task-Specific Guides (`get_guidelines`)
Available guides:
| Guide | Purpose |
|-------|---------|
| **Web App** | 16 design principles for product UI (Purpose First, Dominant Region Rule, Progressive Disclosure, etc.) |
| **Landing Page** | Conversion-focused design (hero compression, headline hierarchy, section rhythm) |
| **Mobile App** | Mobile screen composition (Status Bar → App Content → Bottom Bar), touch ergonomics |
| **Design System** | Component composition patterns (Sidebar, Card, Tab, Dropdown, Table, Pagination) |
| **Slides** | Presentation design (20 layout contracts L01-L20, typography minimums) |
| **Table** | Table hierarchy and responsive patterns |
| **Code** | Design-to-code workflow (component analysis, React creation, Tailwind mapping) |
| **Tailwind** | Tailwind v4 implementation specifics |

### Layer 4: Visual Style (`get_guidelines` with style)
Available styles (each parameterized):
- Aerial Gravitas, Artisan Editorial, Cinematic Alternating
- Editorial Scientific, Illustrated Warm, Inline Friendly
- Monumental Editorial, Product Demo, **Soft Bento**, Spatial Plus

Each style has configurable parameters:
- `colorPalette`: 10 options (Carbon Frost, Deep Space Neon, Fern Journal, etc.)
- `roundness`: Basic Roundness
- `elevation`: Gentle Lift, Sharp Depth, Soft Cloud, Soft Lift
- `headings`, `body`, `captions`, `data`: 8 font options each
- Some styles add `decorativeImagery`

**When instantiated**, a style returns:
1. **Identity** — What makes this style THIS style (the non-negotiable DNA)
2. **Composition** — Layout philosophy (grid type, weight distribution)
3. **Spatial Density** — Moderate/compact/airy and rules
4. **Scale Contrast** — Size relationships between elements
5. **Edge Behavior** — How content relates to boundaries
6. **Separation** — How sections are divided (gap vs. borders vs. shadows)
7. **Typography** — Role assignment (headings/body/captions/data fonts)
8. **Shape** — Corner radius system
9. **Color Rules** — Surface/foreground/accent color usage
10. **Decoration** — Non-typographic visual content philosophy
11. **Actual color palette** (YAML with hex values)
12. **Roundness values** (YAML)
13. **Elevation/shadow definitions** (YAML with shadow effect objects)

### Layer 5: Design Variables (`get_variables`)
The document's variable/theming system, e.g.:
```yaml
themes:
  Mode: [Light, Dark]
variables:
  --background: "#F2F3F0" (Light) / "#111111" (Dark)
  --foreground: "#111111" (Light) / "#FFFFFF" (Dark)
  --primary: "#FF8400" (both)
  --font-primary: "JetBrains Mono"
  --font-secondary: "Geist"
  --radius-m: 16
  --radius-pill: 999
  # ... 30+ variables
```

### Layer 6: Component Structure (`batch_get`)
Before using any component, the AI reads its full structure:
```
batch_get({ nodeIds: ["componentId"], readDepth: 3 })
```
Returns the complete node tree with all children, slots, and default values.

---

## 2. The Generation Workflow

The actual design generation follows this strict sequence:

### Step 1: Understand Context
```
get_editor_state({ include_schema: true })
```
→ Returns active file, selection, components, and full schema

### Step 2: Decision — Creative or Compositional?
- **Creative** (new screens, style exploration) → Load a style guide
- **Compositional** (add button, move element) → Skip style, use existing patterns

### Step 3: Read Design Tokens
```
get_variables()
```
→ Get all color/typography/spacing variables. **Never hardcode values.**

### Step 4: Inspect Components
```
batch_get({ nodeIds: [...], readDepth: 3 })
```
→ Understand component structure before instantiation

### Step 5: Check Layout
```
snapshot_layout({ parentId: "...", maxDepth: 2 })
```
→ Understand existing spatial relationships

### Step 6: Load Task Guide
```
get_guidelines("guide", "Web App")  // or Landing Page, Mobile App, etc.
```
→ Get task-specific design principles

### Step 7: Generate Design
```
batch_design({ operations: "..." })
```
→ Execute insert/copy/update/replace/move/delete/image operations
→ **Max 25 operations per call**
→ Operations use a mini scripting language:

```javascript
// Create placeholder screen
screen=I(document,{type:"frame",layout:"vertical",width:1440,height:"fit_content(900)",fill:"$--background",placeholder:true})

// Add sidebar component
sidebar=I(screen,{type:"ref",ref:"sidebarId",height:"fill_container"})

// Add main content area
main=I(screen,{type:"frame",layout:"vertical",width:"fill_container",padding:32,gap:24})

// Override component text
U(sidebar+"/labelId",{content:"Dashboard"})

// Generate AI image
heroImg=I(main,{type:"frame",width:400,height:300})
G(heroImg,"ai","modern office workspace bright")
```

### Step 8: Visual Verification
```
get_screenshot({ nodeId: "screenId" })
```
→ AI sees the actual rendered result and can self-correct

### Step 9: Repeat 7-8
Continue adding sections, verify after each batch.

### Step 10: Remove Placeholder
```
U("screenId",{placeholder:false})
```
→ Mark screen as complete

---

## 3. Operation Language (batch_design)

The `batch_design` tool accepts a mini scripting language:

| Operation | Syntax | Purpose |
|-----------|--------|---------|
| **Insert** | `foo=I("parent",{...})` | Add new node |
| **Copy** | `bar=C("nodeId","parent",{...})` | Duplicate node (creates instance if reusable) |
| **Update** | `U("path",{...})` | Modify properties (NOT children) |
| **Replace** | `baz=R("instance/slot",{...})` | Swap node entirely |
| **Move** | `M("nodeId","parent",index)` | Reposition node |
| **Delete** | `D("nodeId")` | Remove node |
| **Image** | `G("nodeId","ai","prompt")` | Generate/apply image fill |

Key rules:
- Every I/C/R **must** have a binding name
- Bindings are used as parent references in subsequent operations
- **Cannot Update descendants of a just-Copied node** (IDs change)
- Instance descendant overrides use path syntax: `instance+"/childId"`
- Operations execute sequentially; errors roll back the entire batch

---

## 4. What the AI Actually "Sees"

The AI's context at generation time consists of:

1. **Schema** (~300 lines of TypeScript) — The complete .pen format specification
2. **General Instructions** (~200 lines) — Universal design rules and operation patterns
3. **Task Guide** (~100-200 lines) — Domain-specific principles (web app, landing page, etc.)
4. **Style Guide** (~100 lines) — Visual identity, composition, typography, color rules
5. **Variables** — All design tokens with themed values
6. **Component Structures** — Full node trees of reusable components
7. **Layout Snapshot** — Current spatial arrangement
8. **Screenshots** — Rendered visual output for verification

**Total context per generation: ~1000-2000 lines of structured instructions**

---

## 5. Key Differences from Scytle's Approach

| Aspect | Scytle (Current) | Pencil |
|--------|-------------------|--------|
| **Generation target** | HTML + Tailwind → parse to canvas | Native .pen JSON directly |
| **AI instructions** | Single system prompt with section guidance + few-shot examples | Layered: schema + general rules + task guide + style + variables |
| **Layout control** | 12 hardcoded archetypes | AI decides freely, guided by design principles |
| **Color system** | Hardcoded palettes, fallback hex | Variable system (`$--primary`, `$--background`) with theming |
| **Component system** | None — regenerates everything | Reusable components with instance overrides |
| **Design variety** | Constrained by few-shot HTML skeletons | Style archetypes with parameterized fonts/colors/imagery |
| **Verification** | None (one-shot) | `get_screenshot` for visual verification loop |
| **Iteration** | Regenerate from scratch | Multi-turn refinement on existing design |
| **Parser** | Complex HTML→canvas parser (source of bugs) | **No parser at all** — AI writes canvas format directly |
| **Tables** | HTML tables → parse issues | Strict flexbox hierarchy: Table→Row→Cell→Content |
| **Images** | `<img>` tags → parse to image nodes | `G()` operation applies AI/stock image as fill to frame |
| **Operation format** | HTML string | Mini scripting language (I/C/U/R/M/D/G) |

---

## 6. Implications for Scytle

### The Core Insight
Pencil's approach is fundamentally different from Scytle's. The key innovation is:
- **The AI writes directly to the canvas format** — no intermediate HTML step
- **Layered, composable prompts** instead of a single monolithic system prompt
- **Visual verification loop** — the AI can see what it generated and fix it
- **Parameterized style system** — styles are templates, not hardcoded designs
- **Component-based composition** — build with reusable parts, not from scratch

### What Scytle Could Adopt (Short-Medium Term)
1. **Layered prompt system** — Break the monolithic system prompt into composable layers
2. **Variable-based colors** — Use `$variable` references instead of hardcoded hex
3. **Screenshot verification loop** — Let AI see its output and self-correct
4. **Style archetypes** — Parameterized style guides instead of hardcoded palettes
5. **Remove rigid section guidance** — Replace with design principles
6. **Component-based generation** — Define reusable node patterns

### Long-Term Consideration
The fundamental architecture question: Should Scytle generate ScytleNode JSON directly (like Pencil generates .pen JSON) instead of going through HTML? This would:
- Eliminate the HTML→canvas parser entirely
- Give AI full control over every canvas property
- Enable the same visual verification loop
- Support component/instance model natively
- Remove all parser-related bugs (padding, colors, layout)

---

## 7. Observed Pencil Outputs

The welcome file contains 4 frames:
1. **Greeting Visual** — Welcome graphics
2. **Greeting Content** — Welcome text
3. **SaaS AI Landing Page** — Full landing page (Hero, Features, Social Proof, Pricing, Footer)
4. **SaaS AI Landing Page V2** — Variant with different layout (Nav, Split Hero, Zigzag Features, Horizontal Pricing, Footer)

Both landing pages demonstrate:
- Gradient fills on hero sections
- Multiple sections with different background colors
- Typography hierarchy (eyebrow labels, large titles, body text)
- Card-based layouts with consistent spacing
- Pricing grids
- Footer with dividers and link columns
- All using CSS variable-style tokens (`$--background`, `$--foreground`, etc.)
- Professional design quality without HTML intermediate step
