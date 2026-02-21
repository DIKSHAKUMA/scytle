# Relume Style Guide Editor — Deep UX Research

> **Date**: 2025-02-20  
> **Target**: https://www.relume.io (Project: Cloudify)  
> **Method**: Hands-on exploration via browser automation, screenshot capture, DOM inspection
> **allscreenshot**: screenshot are saved in [capture](../.playwright-mcp/style-guide-anaylsis-pngs)

---

## 1. Overall Structure & Layout

### Page Layout
- **Left panel** (~40%): Style guide controls (Colors → Typography → UI Styling), scrollable vertically
- **Right panel** (~55%): Live website preview with per-section scheme overlays
- **Left sidebar** (narrow icon strip, ~5%): Two icons — Style Guide (main), Brand (logo/navbar)
- **Top bar**: `Concept N ∨` dropdown | [Pitch Concepts] | [Surprise me ✦]
- **Bottom bar** (below preview): `✦ Scheme shuffle SPACE` button
- **Bottom-right controls**: Desktop/Tablet/Mobile viewport toggles + fullscreen
- **Bottom-left**: Undo (⌘Z) / Redo (⌘⇧Z) + people/collaboration icon

### Panel Paradigm
All subpanels (color picker, font browser, buttons/cards styles) open as **left sidebar overlays** (class `.panel`) — same slot, swapping content. Each has:
- Header with title + X close button
- Scrollable content area
- Shuffle button pinned at bottom

### Command Palette Pattern
Both the `Concept` dropdown and `Typography style` dropdown use a **command-palette-style popup** with:
- `Search actions...` text input at top
- Grouped options with section headers
- Checkmarks (✓) on selected items
- Disabled items shown grayed out

### AI Integration Points
All shuffles and concept generation trigger **AI streaming completions**:
- `brief-to-theme-and-color-2` — Colors
- `brief-to-font-family-2` — Typography  
- `brief-to-ui-styling-1` — UI Styling
- Streams run **in parallel** for concept generation

---

## 2. Colors Panel

### Header Row
```
Colors                    [☀️][🌙]  [✦ Shuffle C]
```
- **Light/Dark toggle**: Two adjacent icon buttons (sun ☀️ / moon 🌙)
  - Active button gets `[disabled]` attribute (visually depressed)
  - Tooltip: "Light theme" / "Dark theme"
  - Switches the entire color system between light and dark mode
  - Preview updates instantly
- **Shuffle C**: Sparkle icon + "Shuffle" text + "C" shortcut badge
  - Tooltip: "Shuffle new colors"
  - Button gets `[disabled]` during AI generation (prevents double-click)
  - AI-powered (streams `brief-to-theme-and-color-2`)
  - Can change number of accent colors between shuffles (e.g., 4→3)

### Color Cards Grid
Layout: 2-column grid + potential 3rd column, with cards wrapping.

#### Neutrals Card
- Gray gradient preview (lightest → darkest neutral shades)
- Label: "Neutrals" (top-left)
- Eye icon (toggle) on hover (top-right)
- **Click → opens Neutrals subpanel**:
  - **Tint option**: "Apply a tint to your neutral shades using one of your brand colors"
  - Image showing tint selector UI
  - **Shades section** (7 shades in 3 groups):
    - Pastel: Lightest, Lighter
    - Mid-Tone: Light, Base, Dark
    - Deep: Darker, Darkest

#### Accent Color Cards
Each accent card shows:
- **Color fill** as background
- **Name** (top-left): e.g., "Dodger Blue", "Pizazz", "Shamrock"
- **Hex value** (bottom-left): e.g., "1E90FF"
- **"Main" badge** (bottom-right): Only on the primary accent
- **Shade dots strip** (bottom): ~7 small colored dots showing the auto-generated shade range

**Hover interactions**:
- Card gets subtle border highlight
- Top-right reveals **two icon buttons**:
  - 🗑️ **Delete** (trash icon) — removes this accent
  - 📋 **Copy** (clipboard icon) — duplicates this accent
- **Main accent** only shows copy button (no delete — must keep at least one)

**Click → opens Color Picker subpanel**:
- Header: Color name (e.g., "Curious Blue") + X close
- **2D Color Picker**: Saturation/brightness gradient square with draggable crosshair
- **Hue Slider**: Horizontal rainbow gradient slider below the 2D picker
- **Hex Input**: Text field showing hex value (e.g., "2986CC") + **Copy button** (clipboard icon)
- **Name field**: Editable text input showing color name
- **Per-color Shuffle button**: Shuffles just this one color
- **Shades section** (auto-generated, same 3-group pattern):
  - Pastel: Lightest, Lighter
  - Mid-Tone: Light, Base, Dark
  - Deep: Darker, Darkest

#### Add Accent Button (+)
- Empty card slot with centered "+" icon
- Click instantly adds a new accent with AI-generated color
- Triggers "New schemes available" notification

### "New Schemes Available" Notification
Appears when colors change (add accent, shuffle). Positioned as a floating callout overlaying the preview:
- Header: "New schemes available" + X dismiss button
- Body: "Pick a scheme to apply to your page, based on your new colors"
- **Scheme grid**: 5 rows × 8+ columns of color swatch buttons
  - Each row = a different per-section scheme pattern
  - Each column = a section in the page
  - Clicking a row applies that scheme pattern to all sections
- **Bottom bar**: Scheme chip buttons: [Dark] [Light] [Accent1] [Accent2] [+] [⌘] [📷 Image]

### Per-Section Scheme System
- **Scheme shuffle SPACE** (bottom bar): Randomizes all section schemes at once
  - Tooltip: "Reapply new schemes to sections"
  - Keyboard shortcut: SPACE
- **Per-section scheme overlay**: Appears on hover at **top edge of each section** in the preview
  - Shows same scheme chips: Dark (filled circle), Light (empty circle), each accent color swatch, "+", "⌘"
  - Currently selected scheme gets a border/ring indicator
  - Clicking a chip changes just that one section's scheme

---

## 3. Typography Panel

### Header Row
```
Typography       [Aa Regular - medium ∨]  [✦ Shuffle T]
```

#### Typography Style Dropdown (Command Palette)
Opens as floating dropdown with `Search actions...` input:

| Section  | Options                                |
|----------|----------------------------------------|
| **Size** | Small (default), Regular ✓, Large      |
| **Weight** | Normal, Medium ✓, Bold               |
| **Style** | Default ✓, Spacious, Uppercase        |

- Button label format: `{Size} - {weight}` (e.g., "Regular - medium")
- Checkmarks on currently selected options
- Immediate preview update on selection

#### Shuffle T
- Sparkle icon + "Shuffle" + "T" shortcut badge
- Tooltip: "Shuffle font pairing"
- AI-powered (`brief-to-font-family-2`)
- Button gets `[disabled]` during generation
- Changes heading and/or body fonts

### Font Cards (2-column layout)

#### Heading Card
Shows:
- "Heading" label (top-left)
- **Font name** rendered in that font (large): e.g., "Urbanist"
- **Source tag** (bottom-left): Google icon + "Free" or Monotype icon + "$"
- **External link** (↗) button (bottom-right): Opens font on source website

**Hover interactions**:
- Subtle border highlight
- Top-right reveals **two icon buttons**:
  - ✦ **Shuffle** (sparkle): Shuffle just this font
  - 🔒 **Lock** (padlock): Lock this font from global shuffles

**Click → opens Font Browser subpanel**:
- Header: "Heading" + X close
- **Search bar**: Magnifying glass + text input
- **Two tabs**: "Liked Fonts" (selected by default) | "Browse"

##### Liked Fonts Tab
- 👍 Thumbs-up icon: "Like fonts to unlock personalized recommendations"
- **My Recommendations**: "AI suggestions based on your likes"
- **"Only Free fonts"** toggle: Google icon + toggle switch
- **Font cards** (scrollable list):
  - "✚ Like for similar" hover label
  - Font specimen image preview
  - Font name + heart/like button
- **Tooltip**: "'Like' fonts to discover similar" (dismissable callout)
- **Shuffle** button (bottom, sticky)
- **Active font indicator**: "Active font Inter 🏠"

##### Browse Tab
- **Category filter buttons** (2×2 grid):
  - Sans Serif, Serif, Display, Monospace
  - Each with "Aa" icon styled in that category
- **Featured collections** section: "Handpicked for you"
  - Designer collections: Brett @ Designjoy, Dann Petty, Fons Mans, Ayush Soni (all "New")
  - Style collections: Staff favorites, Edgy, Elegant, Clean, Rounded, Compressed, Quirky, OG
  - Each with thumbnail image
- **Category drill-down** (click Sans Serif → Sans Serif list):
  - Back arrow + "Sans Serif" header + X
  - "Only Free fonts" toggle
  - Result count: "867 results"
  - Font cards: Pangram preview + font name + source icon (M=Monotype) + price ($) + save button

#### Body Card
Identical structure to Heading card:
- "Body" label, font name, source tag, hover shuffle/lock, click opens same font browser

---

## 4. UI Styling Section

### Header Row
```
UI Styling                              [✦ Shuffle U]
```
- **Shuffle U**: Sparkle icon + "Shuffle" + "U" shortcut badge
  - AI-powered (`brief-to-ui-styling-1`)

### Cards (2-column layout)

#### Buttons & Forms Card
Shows:
- "Buttons & Forms" label
- Preview: Filled button + outlined button + Label + form input (text field)
- Hover: shuffle + lock icons (top-right)

**Click → opens Buttons & Forms subpanel**:
- Header: "Buttons & Forms" + X close
- **Radius picker** (top row, 4 icons):
  - ⬜ Square (no radius)
  - ◰ Slightly rounded (~4px)
  - ◳ Medium rounded (~8px, currently selected with blue outline)
  - ⬭ Fully rounded / pill
- **6 Button style presets** (scrollable list):
  1. **Default** — standard solid/outline buttons
  2. **Bubble** — rounded/bubbly style
  3. **Brick** — squared/blocky
  4. **Gradient** — gradient fill
  5. **Sleek** — clean/minimal (shows ✅ "Selected" green badge when active)
  6. **Elevate** — elevated/shadow
- Each preset card shows:
  - Style name (top-left)
  - 👁️ Eye icon (visibility/preview toggle, top-right)
  - Preview: Filled + outlined buttons, Label + input
- **Shuffle** button (bottom, sticky)

#### Cards & Images Card
Shows:
- "Cards & Images" label
- Preview: Image cards with "Outlined Card" label + description + button

**Click → opens Cards & Images subpanel**:
- Header: "Cards & Images" + X close
- **Same radius picker** (4 icons, shared with Buttons & Forms):
  - Same 4 levels: square → slightly rounded → medium rounded → pill
- **4 Card style presets**:
  1. **Default** — flat/minimal cards
  2. **Outlined** — visible border (shows ✅ "Selected" when active)
  3. **Flat** — no borders, shadow-less
  4. **Edgy** — angular/sharp aesthetic
- Each preset card shows:
  - Style name
  - 👁️ Eye icon
  - Thumbnail previews with image cards + text cards
- **Shuffle** button (bottom)

---

## 5. Concepts System

### Concept Dropdown (Header, Command Palette Style)
```
[Concept 1 ∨]                    [Pitch Concepts]  [✦]
```

Click `Concept N ∨` → command palette:
- `Search actions...` input
- **Current concept**: "Concept 1 ✓" (checkmark = selected)
- Helper text: *"We recommend creating at least three distinct concepts before sharing"*
- **New Concept**: Creates fresh concept with full AI regeneration
- **Duplicate Concept**: Clones current concept
- **Delete Concept**: `[disabled]` when only one concept exists

### Concept Creation Flow
1. Click "New Concept" → URL changes to new concept ID
2. **3 parallel AI streams** fire:
   - `brief-to-theme-and-color-2` → new color palette
   - `brief-to-font-family-2` → new font pairing
   - `brief-to-ui-styling-1` → new button/card styles
3. All panels update simultaneously
4. "New schemes available" notification appears
5. Preview rerenders with new styles

### "Surprise me" Button (✦)
- Green sparkles circle button, top-right corner
- Tooltip: "Surprise me"
- **Regenerates the CURRENT concept** (not a new one)
- Same 3 parallel AI streams
- Loading state: "Generating concept..." with spinner animation
- Success toast: "Ta-da! Concept complete"

### Pitch Concepts Page
Full-screen client-presentation view:
- Header: "← Concept" back button + "Copy link" button
- Title: "Pitch Concepts" subtitle + "Top three concepts" heading
- Recommendation: *"We recommend choosing three distinct concepts for feedback to gain insights before moving into detail."*
- **3-column grid**:
  - Each concept shows: desktop preview + mobile preview + color palettes + section scheme strips
  - Controls per concept:
    - Name dropdown (editable)
    - 👁️ Eye icon (show/hide in client view)
    - "Add a description..." text area
  - Third slot shows "No more concepts" if < 3 concepts exist

---

## 6. Brand Panel (Left Sidebar → Second Icon)

Opens as left sidebar overlay:
- Header: "Brand" + X close
- **Navbar preview**: Logo placeholder + "Link One" + "Link Two"
- **Light/Dark toggle**: Same sun/moon buttons as Colors panel
- **Logo Asset section**:
  - Helper: "We suggest uploading your logo as a 2x PNG for best results."
  - Upload button/area with "Logo" placeholder
- **Logo height dropdown**: "2rem · 32px" with size selector

---

## 7. Preview Area & Viewport

### Live Preview (Right Panel)
- Full website preview with all sections rendered
- Updates instantly on any style change
- Shows real content (copy, images) from AI generation

### Section Hovering
When hovering over any section in the preview:
- **Section highlight**: Subtle overlay indicating section bounds
- **Top overlay bar** appears at section top edge with:
  - Scheme chips: [Dark] [Light] [Accent1] [Accent2…] [+] [⌘]
  - Section-specific scheme assignment
  - Also has some sections showing "⌘" shortcut button

### Viewport Controls (Bottom-Right)
- Desktop / Tablet / Mobile toggle buttons
- Fullscreen/expand button

### Bottom Bar
- **Scheme shuffle SPACE**: Full-width button at bottom of preview
  - Tooltip: "Reapply new schemes to sections"
  - Randomizes all section color schemes

---

## 8. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `C` | Shuffle colors |
| `T` | Shuffle typography |
| `U` | Shuffle UI styling |
| `SPACE` | Scheme shuffle (randomize section schemes) |
| `⌘Z` / `⌘⇧Z` | Undo / Redo |

---

## 9. Key UX Patterns & Micro-Interactions

### Consistent Patterns
1. **Panel paradigm**: All subpanels use same left-sidebar-overlay slot with header + X + scrollable content + sticky shuffle button bottom
2. **Shuffle pattern**: Every section (Colors, Typography, UI, per-font, per-color) has its own shuffle button, all AI-powered
3. **Lock pattern**: Font cards and main canvas cards have lock icons to prevent shuffle from changing them
4. **Hover reveal**: Action buttons (delete, copy, shuffle, lock) only appear on hover
5. **Command palette**: Dropdowns use search-enabled command palette with section headers + checkmarks
6. **Keyboard shortcuts**: Single-letter shortcuts for common actions (C, T, U, SPACE)
7. **Disabled during generation**: Buttons get `[disabled]` while AI streams are in-flight

### State Indicators
- **Selected**: Green ✅ checkmark badge on active style presets
- **Main accent**: "Main" badge on primary accent card
- **Active font**: "Active font {name} 🏠" at bottom of font browser
- **Current concept**: Checkmark (✓) in dropdown

### Tooltips
- Dark background, white text, appears below element
- Dismissable callouts for onboarding (e.g., "'Like' fonts to discover similar")

### Loading/Generation States
- **Shuffle buttons**: Go `[disabled]` during AI generation (no loading spinner on button)
- **Concept generation**: Full-screen-ish overlay with "Generating concept..." + spinner
- **Toast notifications**: Bottom-center positioned, "Ta-da! Concept complete" / "Shuffle new colors" etc.
- **"New schemes available"**: Floating callout over preview with dismiss X

### Layout Responsiveness
- Left panel scrolls independently from right preview
- Preview has its own scroll context (website-within-website)
- Subpanels overlay the main left panel but don't push it

---

## 10. Data Flow Summary

```
User Action → Zustand Store → AI Streaming (if shuffle/new) → CSS Variables → Live Preview
                                                                    ↓
                                                            Per-section scheme overrides
```

### What Gets Persisted Per Concept
- Color palette (accents + neutrals + tint) × light/dark modes
- Typography (heading font, body font, size, weight, letter-spacing style)
- UI styling (button style, button radius, card style, card radius)
- Per-section scheme assignments
- Section order & content

### What's Global (Not Per-Concept)
- Brand settings (logo, logo height, navbar)
- Project brief (used by AI for all generation)

---

## 11. Notable Differences from Scytle's Current Store

| Feature | Relume | Scytle Store Status |
|---------|--------|-------------------|
| Color picker (2D + hue slider) | ✅ Full picker | ❌ No picker UI yet |
| Auto-generated shades (7 levels) | ✅ Pastel/Mid-Tone/Deep | ✅ In store (shadeMap) |
| Neutral tint from accent | ✅ "Apply a tint" toggle | ❌ Not in store |
| Font browser (search, categories, AI recs) | ✅ Full browser | ❌ No UI, pairs only |
| Font "like" for AI recommendations | ✅ | ❌ Not planned |
| Per-color shuffle | ✅ | ❌ Store only has global shuffle |
| Per-font shuffle + lock | ✅ | ❌ Not in store |
| Button styles (6 presets) | ✅ Default/Bubble/Brick/Gradient/Sleek/Elevate | ✅ In store (4 styles) |
| Card styles (4 presets) | ✅ Default/Outlined/Flat/Edgy | ✅ In store (3 styles) |
| Shared radius picker | ✅ 4-level visual picker | ✅ In store (5 presets) |
| Concepts with parallel AI gen | ✅ Full CRUD + AI regen | ✅ CRUD in store, no AI gen |
| Pitch Concepts page | ✅ 3-column presentation | ❌ Not planned |
| Per-section scheme bar | ✅ Overlay on hover | ✅ Store has getSectionScheme |
| Scheme shuffle (SPACE) | ✅ | ✅ shuffleSectionScheme in store |
| Brand/Logo panel | ✅ Upload + height | ❌ Not in store |
| Keyboard shortcuts | ✅ C/T/U/SPACE | ❌ Not implemented |
| "Surprise me" regen | ✅ | ❌ Not planned |

---

## 12. Recommendations for Scytle Implementation

### Must-Have (matches existing store capabilities)
1. **Colors panel**: Accent cards grid + Neutrals card + light/dark toggle + Shuffle C
2. **Color picker subpanel**: 2D picker + hue slider + hex input + auto shades
3. **Typography panel**: Heading/Body font cards + Style dropdown (Size/Weight/Style) + Shuffle T
4. **UI Styling panel**: Buttons & Forms card + Cards & Images card + radius picker + Shuffle U
5. **Per-section scheme overlay**: On hover in the wireframe canvas (already in store)
6. **Concepts dropdown**: CRUD from existing store

### Nice-to-Have
7. **Font browser**: Search + categories (Sans/Serif/Display/Mono) — leverage existing 80 font pairs
8. **Keyboard shortcuts**: C/T/U/SPACE — easy wins
9. **Command palette dropdowns**: Polish, but standard select works fine for MVP
10. **Lock icons on font/color cards**: Prevent shuffle from changing locked items

### Not Needed for MVP
11. Font "likes" and AI recommendations (Relume's unique differentiator)
12. Pitch Concepts presentation page
13. Brand/Logo panel
14. "Surprise me" full regeneration
15. Neutral tint from accent colors
