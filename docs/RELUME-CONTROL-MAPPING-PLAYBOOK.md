# Relume Control Mapping Playbook

> **Purpose**: Step-by-step research protocol for extracting every variant and control axis from Relume's wireframe component library using Playwright MCP browser automation. One complete execution per category produces a `{CATEGORY}-CONTROL-MAP.md` file.

**Relume Project URL**:
```
https://www.relume.io/app/project/P3059625_OIRmGRq7hglh8t0hNpRgEZEcih_gIw7i36MOwfD3TNQ#mode=wireframe
```

**Figma File Key**: `Ehft8P02yDqutz3LhXtJqZ`

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Pre-Flight Setup](#2-pre-flight-setup)
3. [Phase 1 — Get a Section on Canvas](#3-phase-1--get-a-section-on-canvas)
4. [Phase 2 — Enumerate All Base Components](#4-phase-2--enumerate-all-base-components)
5. [Phase 3 — Map One Base Component's Axes](#5-phase-3--map-one-base-components-axes)
6. [Phase 4 — Sweep All Remaining Base Components](#6-phase-4--sweep-all-remaining-base-components)
7. [Phase 5 — Group into Families & Complete Tables](#7-phase-5--group-into-families--complete-tables)
8. [Phase 6 — Write the Output File](#8-phase-6--write-the-output-file)
9. [DOM Reference — Section Panel Structure](#9-dom-reference--section-panel-structure)
10. [Known Patterns & Rules](#10-known-patterns--rules)
11. [Category Tracker](#11-category-tracker)

---

## 1. Core Concepts

### Why "one base component" is not enough

Each Relume category has **N base components** visible in the "Replace Component" panel (e.g., CTA has 27). A single base component only exposes the axis controls for **its own family**. Different base components within the same category may have:

- **Completely different axes** (e.g., CTA 1 has Style/Asset Style/Element; CTA 7 has Style/Background/Element)
- **Different numbers of axes** (e.g., CTA 33 has 1 axis; CTA 3 has up to 6)
- **Different dynamic behavior** (e.g., CTA 7 has no dynamics; CTA 3 has deeply nested axis hiding)

### The research unit is a "family"

A **family** is a group of component variants that share the same axis set and are all reachable through toggles from one base state. For example:

- **CTA Family A** (base: CTA 1): 6 variants via Style × Asset Style × Element
- **CTA Family D** (base: CTA 7): 12 variants via Style × Background × Element

The goal per category is to:
1. Discover every base component in the Replace Component panel
2. Load each one, check its axes
3. Group into families (bases with identical axis sets)
4. Map every reachable variant within each family
5. Produce a complete `{CATEGORY}-CONTROL-MAP.md`

### The Replace Component panel is the master list

The **Replace Component panel** (opened by clicking the component name/chevron in the Section Panel) shows ALL base components for the current category under a "Suggested" tab. This is the authoritative list. The "Add Section" left sidebar only shows a subset.

---

## 2. Pre-Flight Setup

### Step 1 — Kill Chrome (Playwright needs its own instance)
```bash
pkill -f "Google Chrome" 2>/dev/null; sleep 2
```

### Step 2 — Navigate to Relume project
```
mcp_microsoft_pla_browser_navigate → URL above
```

### Step 3 — Verify page loaded
```
mcp_microsoft_pla_browser_take_screenshot
```
- Should see: Cloudify project, Wireframe tab active, page canvas with sections
- If login page: re-authenticate manually first

### Step 4 — Take a snapshot to get element refs
```
mcp_microsoft_pla_browser_snapshot
```
- Refs change every snapshot — **never hardcode them**
- Always take a fresh snapshot before clicking anything

---

## 3. Phase 1 — Get a Section on Canvas

**Goal**: Add one instance of the target category to the wireframe so we can access its Section Panel.

### 1.1 Open the Add Section panel
```
Click the "+ Section" button (purple, in left sidebar area)
→ Look for: button with "+" icon or text "+ Section"
```

### 1.2 Select the category
```
In the Add Section panel, scroll the categories list (alphabetical)
→ Click the target category button (e.g., "CTA", "FAQ", "Pricing")
→ A sub-panel shows numbered variants with thumbnails
```

### 1.3 Add the first variant
```
Click the first component (e.g., "CTA 1" / "FAQ 1")
→ It appears on the canvas (usually at the bottom of the page)
→ Close the Add panel if it remains open
```

### 1.4 Select the section on canvas
```
Scroll to the new section (press End key to jump to bottom)
→ Click on any text element (heading/paragraph) inside it
→ The Section Panel opens on the right side
→ Take a snapshot to see the panel contents
```

---

## 4. Phase 2 — Enumerate All Base Components

**Goal**: Get the complete list of base components for this category — this defines how many families may exist.

### 2.1 Open the Replace Component panel
```
In the Section Panel, find the component identifier area:
  - Shows an image + component name (e.g., "CTA 1") + chevron icon
  - The whole area has [cursor=pointer]
→ Click the component name or the chevron
→ The Replace Component panel opens, showing ALL base components
```

### 2.2 Count and record all base component entries
```
Take a snapshot → scroll through the "Suggested" tab
→ Record EVERY component entry with its name/number
→ e.g., CTA has 27 entries: CTA 1, CTA 3, CTA 7, CTA 9, CTA 13, ...
```

**IMPORTANT**: The Replace Component panel numbers are NOT sequential. Record the exact numbers shown. These become your checklist — you must visit every single one.

### 2.3 Create a tracking checklist
```
Example for CTA:
☐ CTA 1    ☐ CTA 3    ☐ CTA 7    ☐ CTA 9    ☐ CTA 13
☐ CTA 15   ☐ CTA 19   ☐ CTA 21   ☐ CTA 23   ☐ CTA 25
☐ CTA 27   ☐ CTA 31   ☐ CTA 33   ☐ CTA 35   ☐ CTA 36
☐ CTA 39   ☐ CTA 40   ☐ CTA 41   ☐ CTA 45   ☐ CTA 47
☐ CTA 51   ☐ CTA 53   ☐ CTA 57   ☐ CTA 59   ☐ CTA 61
☐ CTA 63   ☐ CTA 65
```

### 2.4 Close the Replace panel
```
Click outside the panel or press Escape
→ Return to the Section Panel with the currently loaded component
```

---

## 5. Phase 3 — Map One Base Component's Axes

**Goal**: Exhaustively map the first base component — discover all axes, dynamic behaviors, and reachable variants. This establishes the first family.

### 3.1 Record the initial state
```
From the Section Panel, record:
  ✦ Component name (e.g., "CTA 1")
  ✦ Number of visible axes
  ✦ For each axis:
    - Label (e.g., "Style", "Asset", "Element")
    - All options listed (text or icon buttons)
    - Currently selected option ([disabled] = active)
    - Button type: text-toggle or icon-toggle
```

### 3.2 Toggle each axis one at a time (solo sweep)

For EACH axis, click each non-selected option ONE AT A TIME:

```
1. Note the full current state (all axis values + component name)
2. Click the next option on the target axis
3. Take snapshot immediately
4. Record:
   a) New component name  →  did the number change?
   b) Axis count          →  did any axes APPEAR or DISAPPEAR?
   c) New axis options    →  did any option sets change?
   d) Other axis values   →  did [disabled] shift on another axis?
5. Click back to the original value before moving to the next axis
```

**CRITICAL**: After EVERY single click, re-count axes and check for structural changes. Axes can appear, disappear, or change their option sets.

### 3.3 Investigate dynamic behaviors

If toggling Axis A caused changes to other axes, you need to explore both paths:

**When Axis A hides Axis B:**
```
1. Set A to the value that SHOWS B
2. Toggle B through all its options, record component names
3. Set A to the value that HIDES B
4. Note what axes remain + any NEW axes that appeared
5. Toggle remaining/new axes, record component names
```

**When Axis A changes Axis B's options:**
```
1. Set A to each value
2. For each A-value, record what options B has
3. Toggle B through all options at each A-value
```

**When Axis A introduces a NEW axis:**
```
1. Set A to the value that shows the new axis
2. Toggle the new axis through all its options
3. Check if the new axis itself has dynamic effects on other axes
```

### 3.4 Full combination matrix

After understanding the axis structure and dynamics, systematically walk through every reachable combination:

```
For static axes (always visible, no dynamics):
  → Enumerate all combos: Axis1[val1,val2] × Axis2[val1,val2,val3] × ...
  → Click through each combo, record the component name

For dynamic axes:
  → Partition by the controlling axis value
  → Within each partition, enumerate combos of the visible axes
  → Record which axes are hidden and what their retained values are
```

**Example: CTA 1 had 3 axes with dynamics**
```
Partition 1: Style=Normal, Asset Style=Default → Element visible
  Normal + Default + Button = CTA 1
  Normal + Default + Form   = CTA 2

Partition 2: Style=Normal, Asset Style=Expand → Element hidden
  Normal + Expand + (Button hidden) = CTA 59
  Normal + Expand + (Form hidden)   = CTA 60

Partition 3: Style=Card → Asset Style hidden, Element visible
  Card + (Default hidden) + Button = CTA 39
  Card + (Default hidden) + Form   = CTA 40
```

### 3.5 Mark the base component done on your checklist
```
☑ CTA 1 → Family A: 6 variants (CTA 1, 2, 39, 40, 59, 60)
```

Also mark any other Replace Panel entries that appeared as variants in this family's combo table (e.g., CTA 39, 40, 59 are all in Family A — no need to re-investigate them individually).

---

## 6. Phase 4 — Sweep All Remaining Base Components

**Goal**: Load each unchecked base component from the Replace Component panel, check its axes, and either map it as a new family or confirm it belongs to an already-mapped family.

### 4.1 Open Replace Component panel and select next unchecked component
```
1. Click the component name/chevron in the Section Panel
2. The Replace Component panel opens
3. Find the next unchecked component number from your list
4. Click it to load it into the section
5. The panel closes and the section updates
```

### 4.2 Check if axes match a known family
```
Take snapshot → read the Section Panel axes
→ Compare axes (labels + options) against already-mapped families
```

**If axes are IDENTICAL to a known family:**
```
→ Verify by checking which combo in that family's table matches
→ Mark this component as belonging to that family
→ Check it off the list
→ Move to the next unchecked component
```

**If axes are DIFFERENT from all known families:**
```
→ This is a NEW family — run the full Phase 3 mapping
→ Solo sweep each axis, investigate dynamics, build combo table
→ Mark all component numbers in the new family's combos as checked
```

### 4.3 Repeat until all base components are checked
```
Continue until every entry from the Replace Component panel is either:
  a) Mapped as a variant within a known family, OR
  b) Identified as the base of a new family (and that family is fully mapped)
```

### 4.4 Efficiency tips

- **Skip known variants**: If you already mapped CTA 1's family and CTA 39 appeared in its combo table, you can skip CTA 39 in the Replace Panel — just check it off.
- **Quick-check shortcut**: Often just reading the axis labels is enough to identify the family. You only need a full matrix sweep for genuinely new axis combinations.
- **Track as you go**: Maintain a running mapping of `component number → family letter` so you don't re-investigate.

---

## 7. Phase 5 — Group into Families & Complete Tables

**Goal**: Organize all findings into a clean family structure before writing the output file.

### 5.1 Assign family letters
```
Family A = first base component investigated (e.g., CTA 1)
Family B = second distinct axis set found (e.g., CTA 13)
Family C = third distinct axis set found (e.g., CTA 3)
...
```

### 5.2 For each family, compile

1. **Base component number** (the one you entered from the Replace Panel)
2. **Layout description** (1-line summary of what the section looks like)
3. **Axis list** with: label, options, type (text/icon), default, conditions
4. **Dynamic behavior rules** (what hides/shows/changes when)
5. **Complete combo table** (every reachable combination → component number)
6. **Total variant count**

### 5.3 Build the master mapping table
```
Map every Replace Panel entry → Family + specific combo:

| Panel Entry | Family | Combo Description |
|-------------|--------|-------------------|
| CTA 1       | A      | Normal + Default + Button |
| CTA 3       | C      | Left + Normal + Image + Button |
| CTA 7       | D      | Normal + None + Button |
...
```

### 5.4 Cross-reference for gaps
```
Look at all component numbers that appeared in combo tables
→ Are there any numbers NOT reachable from any family?
→ Are there any gaps in the numbering? (e.g., CTA 37-38 not found)
→ Document these as notes
```

---

## 8. Phase 6 — Write the Output File

**Goal**: Create `docs/{CATEGORY}-CONTROL-MAP.md` with all findings.

### Required sections in the output file:

```markdown
# {Category} Section — Complete Control Map

> Generated from exhaustive Relume browser testing of all N base components
> in the Replace Component panel.
> Total: **X families**, **Y unique component variants**.

## Summary of Families
(Table: Family | Base | Axes | Variant Count | Component IDs)

## Replace Component Panel → Family Mapping
(Table: every panel entry → family + combo description)

## Family A — {Base Component}
  ### Layout description
  ### Axis list
  ### Dynamic Behavior
  ### Combo Table(s)

## Family B — {Base Component}
  ...

## Cross-Family Patterns
  ### Common axis types and their behaviors
  ### Universal rules
  ### Numbering patterns
  ### Gaps

## Implementation Notes for Scytle
  ### LayoutControlDef strategy
  ### Key considerations
```

**Reference**: See [`CTA-CONTROL-MAP.md`](CTA-CONTROL-MAP.md) for a completed example.

---

## 9. DOM Reference — Section Panel Structure

### Full Section Panel tree (from snapshot)
```
generic [ref=eXXXX]:                            ← Panel container
  generic:
    paragraph: Section                           ← Panel title
    button [close]                               ← Close panel
  generic:
    button "Make a global section"
    generic:
      paragraph: Name *
      textbox: [Section Name]                    ← e.g., "CTA Section"
    generic:
      paragraph: Description
      textbox: [Description text]
    generic:                                     ← ⭐ CONTROLS AREA
      generic [cursor=pointer]:                  ← Component selector (CLICK TO OPEN REPLACE PANEL)
        generic:
          img "Component category image"
          paragraph: [COMPONENT NAME]            ← e.g., "CTA 1" — READ THIS
        img (chevron)                            ← Chevron icon
      generic:                                   ← AXES CONTAINER
        generic:                                 ← Axis 1
          paragraph: [AXIS LABEL]                ← e.g., "Style"
          generic:                               ← Options row
            button "Option A" [disabled]         ← [disabled] = currently selected
            button "Option B"
        generic:                                 ← Axis 2
          paragraph: [AXIS LABEL]
          generic:
            button [disabled]                    ← Icon button (img inside)
              img
            button
              img
    button "Generate copy"
```

### Button types

**Text buttons** — have a visible label:
```
button "Normal" [disabled] [ref=eXXXX]:
  paragraph: Normal
```

**Icon buttons** — image only, meaning inferred from axis label + position:
```
button [disabled] [ref=eXXXX]:   ← Position 1 = typically "None" or "Left"
  img
button [ref=eYYYY]:               ← Position 2 = typically "Image" or "Center"
  img
button [ref=eZZZZ]:               ← Position 3 = typically "Video" or "Right"
  img
```

**Icon button tooltips**: Hover to see the value name ("None", "Image", "Video", "Left", "Center", "Default", "Expand"). Use `mcp_microsoft_pla_browser_hover` if unsure.

**Numeric buttons**:
```
button "3" [disabled] [ref=eZZZZ]:
  paragraph: 3
```

### Replace Component panel structure
```
Opened by clicking the component selector area (cursor=pointer)
→ Shows a panel with tabs: "Suggested" | "All"
→ Under "Suggested": grid of components for the current category
→ Each entry: clickable card with thumbnail + name (e.g., "CTA 13")
→ Click an entry to replace the current section with that component
→ Section Panel updates with the new component's axes
```

---

## 10. Known Patterns & Rules

### Rule 1 — Always re-check axes after EVERY click
Axes can appear, disappear, or change option sets after ANY toggle. Never assume the axis structure is stable.

### Rule 2 — `[disabled]` means currently selected
In the accessibility tree, the active option button has `[disabled]`. It's not "greyed out" — it means "already selected, can't click again."

### Rule 3 — Refs change every snapshot
After any click or interaction, ALL element refs in the DOM tree are invalidated. Always take a fresh `mcp_microsoft_pla_browser_snapshot` before clicking.

### Rule 4 — Hidden axis values are retained
When an axis is hidden (e.g., Expand hides Element), the hidden value is still tracked internally. Different hidden values produce different component numbers (e.g., CTA 59 = Expand+Button, CTA 60 = Expand+Form).

### Rule 5 — Expand mode is a universal collapser
Across all families that have an "Expand" or "Asset Style=Expand" option, it consistently hides most other axes — typically leaving only the Asset Style axis visible.

### Rule 6 — Card mode may restrict options
When Style=Card is selected:
- Some families lose the BG=None option (e.g., CTA Family C Text=Left)
- Some families keep all BG options (e.g., CTA Family D, Family C Text=Center)
- Some families hide entire axes (e.g., CTA Family A hides Asset Style)

### Rule 7 — Asset toggles between two axis paths
When an Asset axis offers None/Image icons:
- **Asset=None** → shows Background axis (None/Image/Video)
- **Asset=Image** → shows Asset Style axis (Default/Expand)
These are mutually exclusive paths that produce different variant sets.

### Rule 8 — Component name prefixes by category
| Category | Component prefix | Example |
|----------|-----------------|---------|
| Hero Header | Header | Header 1, Header 84 |
| CTA | CTA | CTA 1, CTA 39 |
| About / Stats | Layout | Layout 2, Layout 26 |
| FAQ | FAQ | FAQ 1, FAQ 2 |
| Pricing | Pricing | Pricing 1, Pricing 18 |
| Contact | Contact | Contact 1, Contact 5 |
| Testimonial | Testimonial | Testimonial 1 |
| Footer | Footer | Footer 1 |
| Navbar | Navbar | Navbar 1 |

### Rule 9 — The Add Section sidebar shows a subset
The left sidebar "Add Section" panel for a category shows more variants than are base components in the Replace Component panel. Many of these sidebar entries are just pre-configured axis states of the same base component. **Only the Replace Component panel gives the authoritative list of distinct base components.**

---

## 11. Category Tracker

### All Relume Categories (from Add Panel)

| # | Relume Category | Scytle Category | Status | Output File |
|---|----------------|-----------------|--------|-------------|
| 1 | About | `content` | Not started | — |
| 2 | Announcement Banner | — | Skip (P4) | — |
| 3 | Benefits | `features` | Not started | — |
| 4 | Blog List Header | `blog` | Not started | — |
| 5 | Blog List | `blog` | Not started | — |
| 6 | Blog Post Body | `blog` | Not started | — |
| 7 | Blog Post Header | `blog` | Not started | — |
| 8 | Contact | `contact` | Not started | — |
| 9 | **CTA** | `cta` | **✅ DONE** | [`CTA-CONTROL-MAP.md`](CTA-CONTROL-MAP.md) |
| 10 | Event Item Header | — | Skip (P4) | — |
| 11 | Events List | — | Skip (P4) | — |
| 12 | FAQ | `faq` | Not started | — |
| 13 | Feature | `features` | Not started | — |
| 14 | Features List | `features` | Not started | — |
| 15 | Footer | `footer` | Not started | — |
| 16 | Gallery | `gallery` | Not started | — |
| 17 | Header | `content` | Not started | — |
| 18 | **Hero Header** | `hero` | **✅ DONE** | (inline below) |
| 19 | How It Works | `features` | Skip (P4) | — |
| 20 | Job Listings | — | Skip (P4) | — |
| 21 | Logo List | `logos` | Not started | — |
| 22 | Navbar | `navbar` | Not started | — |
| 23 | Portfolio Item Body | `gallery` | Not started | — |
| 24 | Portfolio Item Header | `gallery` | Not started | — |
| 25 | Portfolio List | `gallery` | Not started | — |
| 26 | Pricing | `pricing` | Not started | — |
| 27 | Product Header | `content` | Skip (P4) | — |
| 28 | Products List | `content` | Skip (P4) | — |
| 29 | Stats | `stats` | Not started | — |
| 30 | Team | `team` | Not started | — |
| 31 | Testimonial | `testimonials` | Not started | — |

### Hero Header — Quick Reference (mapped before this playbook was formalized)

- **Axes**: Style (Normal/Card), Asset (Image/Video), Asset Placement (Left/Right), Element (Form/Button)
- **Dynamics**: None — all 4 axes always visible
- **Sample combos**: Normal+Image+Right+Button = Header 1, Card+Image+Right+Button = Header 84
- **Note**: Needs full re-mapping using this playbook's Phase 2-5 methodology (Replace Panel enumeration, all families). Current data is from a partial single-component test.

---

## Quick Reference — Playwright MCP Tools

| Action | Tool | Key Parameters |
|--------|------|---------------|
| Navigate | `mcp_microsoft_pla_browser_navigate` | `url` |
| Screenshot | `mcp_microsoft_pla_browser_take_screenshot` | — |
| DOM snapshot | `mcp_microsoft_pla_browser_snapshot` | — |
| Click | `mcp_microsoft_pla_browser_click` | `element` (description), `ref` (from snapshot) |
| Hover | `mcp_microsoft_pla_browser_hover` | `element`, `ref` |
| Press key | `mcp_microsoft_pla_browser_press_key` | `key` (e.g., "End", "Escape") |
