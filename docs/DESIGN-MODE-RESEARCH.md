# Relume Design Mode — Deep Research

> Research conducted via Playwright MCP browser automation on the Relume "Cloudify" project.
> Focus: Background images, videos, aspect ratios, color schemes, and every Design-mode-specific feature.

---

## 1. Architecture: Wireframe → Design Mode

### URL Patterns
| Mode       | URL Hash                              |
|------------|---------------------------------------|
| Sitemap    | (none)                                |
| Wireframe  | `#mode=wireframe`                     |
| Style Guide| `#mode=style-guide`                   |
| Design     | `#mode=design`                        |
| + Tablet   | `#mode=design&breakpoint=tablet`      |
| + Mobile   | `#mode=design&breakpoint=mobile`      |
| + Desktop  | `#mode=design&breakpoint=desktop`     |

### Canvas Rendering
- Canvas uses **CSS transform pan/zoom**: `scale(0.71618) translate(Xpx, Ypx)` with `overflow: hidden`
- NOT traditional scrolling — must manipulate `transform` values for navigation
- Canvas class: `.src-editor-canvas__canvas`
- Sidebar panel scrollable via: `.---base-ui-scrollable__scrollableInner`

### AI Events on Mode Entry
- **Design mode load**: Console logs `"Streaming a page-schemes-1 completion"` — AI auto-generates color scheme assignments for all sections
- **Section click**: Console logs `"Streaming a section-text-count-1 completion"` — AI analyzes text content

---

## 2. What Changes from Wireframe → Design

### Visual Rendering

| Feature           | Wireframe                              | Design                                 |
|-------------------|----------------------------------------|----------------------------------------|
| Images            | Gray placeholder boxes with mountain/sun icon | Real AI-generated stock photos         |
| Typography        | Generic black sans-serif               | Styled fonts from style guide          |
| Colors            | Black/white/gray only                  | Full color scheme application          |
| Buttons           | Black filled / outlined                | Styled with accent colors (e.g., blue) |
| Backgrounds       | White/gray only                        | Per-section color scheme (white, light blue, dark, etc.) |
| Overlays          | None                                   | Dark overlays on background images     |
| Logo              | "Logo" in decorative script            | Same (no real logo upload on Relume)   |
| Section spacing   | Uniform                                | Same                                   |

### Section Panel Controls

| Control              | Wireframe | Design | Notes                                |
|----------------------|-----------|--------|--------------------------------------|
| Name                 | ✅        | ✅     | Required field, same                 |
| Description          | ✅        | ✅     | AI-generated, "Prompt +" button      |
| Template picker      | ✅        | ✅     | Same component, same templates       |
| Make global section  | ✅        | ✅     | Same                                 |
| Style (Normal/Card)  | ✅        | ✅     | Same toggle                          |
| Asset (Image/Video)  | ✅        | ✅     | Same toggle (Hero-type sections)     |
| Asset Placement (L/R)| ✅        | ✅     | Same toggle (Hero-type sections)     |
| Background (⊘/🖼️/📹) | ✅        | ✅     | Same toggle (CTA-type sections)      |
| Text (alignment)     | ✅        | ✅     | Same toggle (CTA-type sections)      |
| Element (Form/Button)| ✅        | ✅     | Same toggle                          |
| **Scheme selector**  | ❌        | ✅     | **Design-only** — shows assigned scheme with color swatch |
| **Image sub-panel**  | ❌        | ✅     | **Design-only** — upload, ratio, position, fill mode, etc. |
| Generate copy        | ✅        | ✅     | Same AI button                       |

### Responsive Previews
- **3 breakpoints**: Desktop, Tablet, Mobile (icons in bottom bar)
- URL parameter: `&breakpoint=desktop|tablet|mobile`
- Canvas re-renders at target width; other pages ghost in background
- Tablet: cards stack vertically, narrower content area
- Mobile: full vertical stack, single column

---

## 3. Section Panel — Layout Controls

Layout toggles **vary by section template category**. The controls are determined by the Webflow component's variants.

### Hero/Header Sections (e.g., Header 84)
| Row             | Options          | Default  |
|-----------------|------------------|----------|
| Style           | Normal \| Card   | Card     |
| Asset           | 🖼️ Image \| 📹 Video | Image |
| Asset Placement | ← Left \| → Right| Right    |
| Element         | Form \| Button   | Button   |

### CTA Sections (e.g., CTA 53)
| Row        | Options                  | Default  |
|------------|--------------------------|----------|
| Text       | ≡ Left \| ☰ Center      | Center   |
| Style      | Normal \| Card           | Card     |
| Background | ⊘ None \| 🖼️ Image \| 📹 Video | Image |
| Element    | Form \| Button           | Button   |

### Toggle Behavior
- Active/selected state uses `[disabled]` attribute (counterintuitive)
- Clicking a toggle instantly updates the canvas component
- Video toggle changes the entire component variant (resets content to generic placeholders)
- Console warns: `"Component was not cached: section_header"` on variant switch

---

## 4. Color Schemes (Design-Only)

### Page-Level Scheme Assignment
- On entering Design mode, AI streams `"page-schemes-1 completion"` to auto-assign schemes to all sections
- Creates visual rhythm: white → white → light blue → white → dark → light blue → gray → white

### Section-Level Scheme Selector
- Shows current scheme name + color swatch preview + chevron
- Click to open **Schemes sub-panel**

### Schemes Sub-Panel
- Lists all available schemes (e.g., Scheme 1, Scheme 2, Scheme 3)
- Each shows a mini color swatch strip
- Currently applied scheme has green checkmark ✅
- **"+" button** to add more schemes
- **"..." options menu** per scheme → Edit | Delete
- Clicking a scheme **instantly applies** it to the section

### Scheme Editor (5 Semantic Color Roles)
| Role       | Purpose                     | Example Value            |
|------------|-----------------------------|--------------------------| 
| Background | Section background color    | Neutral • White          |
| Text       | Primary text color          | Neutral • Darkest        |
| Foreground | Secondary/card color        | Neutral • White          |
| Border     | Border color + opacity      | Neutral • Darkest 15%    |
| Accent     | CTA/button/link color       | Azure • Radiance         |

### Color Picker
- Searchable text input at top
- Colors organized by **family** with named **shades**:
  - **Neutral**: White, Lightest, Lighter, Light, Base, Dark, Darker, Darkest (8 shades)
  - **Azure Radiance**: Lightest → Darkest (7 shades)
  - **Jade**: Lightest → Darkest (7 shades)
  - **Flush Orange**: Lightest → Darkest (7 shades)
- Currently selected shade shows checkmark ✓
- Some shades grayed out (context-dependent availability)
- Color families and shades come from the **Style Guide** (palette configured in Style Guide mode)

---

## 5. Image Controls (Design-Only)

### Entry Point
Click **"Image — Assets and Image controls"** button with section thumbnail + chevron.

### Sub-Panel Header
- Back arrow (←) returns to Section panel
- Title: "Image"
- X close button

### Image Upload
- Large image preview thumbnail (shows current image with checkered transparency)
- **"Upload"** button + camera icon button
- Uploaded images apply to the section immediately

### 7 Image Control Properties

| Control    | Values                                          | CSS Mapping          |
|------------|--------------------------------------------------|----------------------|
| Ratio      | Auto, 16:9, 3:2, 4:3, 1:1, 3:4                | `aspect-ratio`       |
| Position   | 9-point grid (Top/Center/Bottom × Left/Center/Right) | `object-position` |
| Fill Mode  | Cover \| Contain                                | `object-fit`         |
| Width      | Dropdown (varies by component)                   | `width`/`max-width`  |
| Shape      | Rectangle \| Rounded (2 toggle icons)            | `border-radius`      |
| Overlay    | Yes \| No                                        | Dark overlay layer   |
| Foreground | Color \| None                                    | Tint/color filter    |

### Inline Image vs Background Image Controls

Controls **adapt based on image type** within the section:

| Control    | Inline Image (Hero) | Background Image (CTA) |
|------------|---------------------|------------------------|
| Ratio      | ✅ Active: Auto, 16:9, 3:2, 4:3, 1:1, 3:4 | 🚫 "Default" (disabled) |
| Position   | ✅ Active: 9-point grid | ✅ Active: 9-point grid |
| Fill Mode  | ✅ Active: Cover / Contain | 🚫 "Select" (disabled) |
| Width      | 🚫 Disabled         | 🚫 "Not available on this component" |
| Shape      | ✅ Active: Rectangle / Rounded | 🚫 Both disabled |
| Overlay    | ✅ Yes / No          | ✅ **Yes** / No (key for readability!) |
| Foreground | ✅ Color / None      | 🚫 Both disabled |

**Key insight**: Background images fill the entire section, so Ratio, Fill Mode, Width, and Shape don't apply. Only Position and Overlay are relevant for bg images.

### Console Debug Logs
When opening Image panel, console logs:
- `"Debug info Default Formula: Ratio, Position,..."`
- `"Debug info Formula 1: Full width & viewport ..."`

---

## 6. Video Asset

### Toggling Image → Video
- Click the 📹 Video toggle in the **Asset** or **Background** row
- The entire component **variant changes** — it's a different Webflow component variant
- Gray placeholder area appears with centered ▶ play button icon
- Content resets to generic placeholders (heading → "Medium length heading goes here", body → lorem ipsum, CTA → "Button")
- Console warns: `"Component was not cached: section_header"`

### Video Controls (Expected — same panel structure)
The Image sub-panel likely transforms into a Video sub-panel when video is selected, with video-specific controls (upload, autoplay, loop, muted, etc.). Not fully explored due to content reset behavior.

---

## 7. Template Picker (Replace Component)

### Entry
Click the template name row (e.g., "Header 84" or "CTA 53") in the Section panel.

### Panel Structure
| Element          | Description                                    |
|------------------|------------------------------------------------|
| Title            | "Replace Component" with ← back + X close     |
| Search           | Text input + filter settings icon (⚙️)         |
| Tabs             | **Suggested** \| **Saved**                     |
| Template cards   | Name, wireframe preview thumbnail, bookmark icon |
| Current template | Green checkmark ✓ "Selected" badge             |
| Shuffle button   | ✨ "Shuffle component" — randomizes selection  |

### Template Count Example (CTA category)
24 templates: CTA 1, 3, 7, 9, 13, 15, 19, 21, 23, 25, 27, 31, 33, 39, 40, 41, 45, 47, 51, 53, 57, 59, 61, 63, 65

### Template Naming Convention
Internal names: `section_{category}{number}` (e.g., `section_cta53`, `section_header84`)

### Saved Tab
- Bookmarked templates via the bookmark (🔖) icon on each card
- Persists across sessions

---

## 8. Add Section Library

### Entry
Click the **"+"** button in the left sidebar.

### Panel Structure
```
Add [X close]
├── Global sections
│   ├── Footer (5 instances) [+]
│   └── Navbar (5 instances) [+]
├── Saved
│   ├── Components [>]
│   └── Page Templates [>]
└── Categories (32 total)
    ├── Blank Section [+]
    ├── About [>]
    ├── Announcement Banner [>]
    ├── Benefits [>]
    ├── Blog List Header [>]
    ├── Blog List [>]
    ├── Blog Post Body [>]
    ├── Blog Post Header [>]
    ├── Contact [>]
    ├── CTA [>]
    ├── Event Item Header [>]
    ├── Events List [>]
    ├── FAQ [>]
    ├── Feature [>]
    ├── Features List [>]
    ├── Footer [>]
    ├── Gallery [>]
    ├── Header [>]
    ├── Hero Header [>]
    ├── How It Works [>]
    ├── Job Listings [>]
    ├── Logo List [>]
    ├── Navbar [>]
    ├── Portfolio Item Body [>]
    ├── Portfolio Item Header [>]
    ├── Portfolio List [>]
    ├── Pricing [>]
    ├── Product Header [>]
    ├── Products List [>]
    ├── Stats [>]
    ├── Team [>]
    └── Testimonial [>]
```

### Global Sections
- Marked with green sparkle ✨ icon
- Show instance count
- "+" adds another instance
- Shared across all pages

### Category Types
- **Section categories**: Hero Header, Features List, CTA, FAQ, Pricing, etc.
- **Page item categories**: Blog Post Body/Header, Portfolio Item Body/Header, Event Item Header, Product Header
- **Utility**: Blank Section (direct add), Announcement Banner

---

## 9. AI Features

| Feature                | Where                         | Behavior                           |
|------------------------|-------------------------------|------------------------------------|
| Page Scheme Generation | Design mode entry             | AI auto-assigns color schemes to all sections; streams `page-schemes-1` |
| Section Text Analysis  | Section click                 | Streams `section-text-count-1` completion |
| Prompt + (Description) | Section panel, Description field | Orange button; regenerates section description |
| Generate Copy          | Section panel, bottom button  | ≡ icon; regenerates all text content in section |
| Ask AI (Inline)        | Canvas, text selection        | ✨ sparkle button appears near selected text; provides AI text rewriting |

---

## 10. Export Options

### Figma Design Tab
1. Get a copy of the **Relume Figma Kit** (Community file)
2. Import into the Figma Kit with the **Relume Figma Plugin**

### Figma Sites Tab (New)
1. Same steps 1-2 as Figma Design
3. Copy and paste all pages into a new Figma Sites file
4. For each page, select both **Desktop** and **Mobile** breakpoints, right click → 'Create Page'

### Key Limitation
Relume exports to **Figma only** — no direct code export. This is where Scytle differentiates.

---

## 11. Page-Level Features

### Page Header Bar
- Shows page name (e.g., "Home") with house icon
- **"..."** options menu for page-level actions
- Multiple pages visible as cards: Home, Features, Pricing, Blog, About

### Other Pages
- "Upgrade to view pages" — Free plan limits to Home page only
- Other pages (Features, Pricing, Blog) shown as locked ghost cards

### Bottom Bar
| Element    | Function                          |
|------------|-----------------------------------|
| Project    | Project settings dropdown         |
| ☰ Menu     | Project structure/pages list      |
| Desktop 🖥️ | Desktop breakpoint (default)      |
| Tablet 📱  | Tablet responsive preview         |
| Mobile 📱  | Mobile responsive preview         |
| 72%        | Zoom level dropdown               |

---

## 12. Left Sidebar UI Elements

| Position   | Icon      | Function                           |
|------------|-----------|--------------------------------------|
| Top (y=56) | ✨ Sparkle | **Edit Panel Toggle** — opens/closes Section panel for selected section |
| y=104      | ➕ Plus    | **Add Section** — opens section library panel |
| Bottom (y=593) | ❓     | **Help** button                     |
| Bottom (y=641) | 🤖     | **AI Assistant** (bottom-left)      |

---

## 13. Canvas Interaction Patterns

### Section Selection
- Click any text element → selects that section → opens Section panel on left
- Selected section shows blue outline border
- Floating **"Section"** pill button appears at bottom of selected section (clicking opens panel)

### Between-Section Buttons
- **"+ Section"** blue pill button appears between sections when section is selected
- Clicking opens the Add Section library

### Editable Text
- Clicking text on canvas activates inline editing
- Blue dashed outline appears around editable text blocks
- Double-click to enter text editing mode

### Ask AI Inline
- When text is selected on canvas, a ✨ sparkle icon appears
- Clicking opens AI text rewriting/suggestion UI

---

## 14. Section Templates — Complete Cloudify Page

| # | Section Name     | Template    | Scheme  | Background | Key Visual                          |
|---|------------------|-------------|---------|------------|-------------------------------------|
| 1 | Navbar           | Navbar X    | Scheme 1| White      | Logo + nav links + Login/Start      |
| 2 | Hero Header      | Header 84   | Scheme 1| White      | H1 + body + buttons + side image    |
| 3 | Features (Core)  | Feature X   | Scheme 1| White      | 3 dark cards with overlaid images   |
| 4 | Advantages       | Feature X   | Scheme 1| White      | Asymmetric cards + photos           |
| 5 | Process          | How It Works| Scheme 3| **Light blue** | Large image + 3 numbered steps  |
| 6 | Stats (Results)  | Stats X     | Scheme 1| White      | Large photo + 50K / 1000 / 98%      |
| 7 | Testimonials     | Testimonial | Scheme 1| White      | 3 cards, 5-star ratings, avatars    |
| 8 | Pricing (Plans)  | Pricing X   | Scheme 1| White      | 3 outlined cards ($19/$49/$99)      |
| 9 | CTA              | CTA 53      | **Scheme 2** | **Dark bg image** | Overlay + white text + ghost buttons |
| 10| FAQ (Questions)  | FAQ X       | Scheme 3| **Light blue** | Accordion items, "Contact us"    |
| 11| Newsletter       | CTA X       | Scheme 1| Gray       | Email input + Subscribe button      |
| 12| Footer           | Footer X    | Scheme 1| White      | Logo, address, socials, nav cols    |

### Scheme Distribution Pattern
- **Scheme 1** (white/default): 8 sections — majority
- **Scheme 2** (dark): 1 section — CTA only, creates emphasis
- **Scheme 3** (light accent): 2 sections — Process + FAQ, creates rhythm breaks

---

## 15. Implementation Plan for Scytle

### What Scytle Already Has (from Style Guide)
- ✅ Color palette with families and shades
- ✅ Typography scale
- ✅ UI styling (border radius, spacing)
- ✅ Scheme definitions (semantic color roles)

### What Design Mode Needs

#### Priority 1: Section-Level Scheme Assignment
- Each section stores a `schemeId` reference
- Scheme selector in section panel (dropdown with color swatch preview)
- Apply scheme colors to section: background, text, borders, accent buttons
- AI auto-assignment of schemes on entering Design mode

#### Priority 2: Section Image Controls
- **Image upload** per section (stored in Appwrite storage)
- **Image properties**: ratio, position, fillMode, shape, overlay, foreground
- Two image modes:
  - **Inline image**: Full controls (ratio, position, fill, width, shape, overlay, foreground)
  - **Background image**: Limited controls (position, overlay only)
- **Background toggle**: None / Image / Video (for CTA-type sections)
- **Asset toggle**: Image / Video (for Hero-type sections)

#### Priority 3: Real Content Rendering
- Apply style guide typography to headings/body
- Apply scheme accent color to buttons/links
- Apply scheme background color to section containers
- Real image rendering (vs gray placeholders in wireframe)

#### Priority 4: Template System Enhancement
- Replace Component panel with search + filter
- Suggested + Saved tabs
- Shuffle component randomization
- Template preview thumbnails

#### Priority 5: Responsive Preview
- Desktop / Tablet / Mobile breakpoint toggle
- Re-render sections at target breakpoint width
- URL hash parameter for breakpoint state

### Data Model Changes Needed

```typescript
// Section-level design properties (add to Section type)
interface SectionDesignProps {
  schemeId?: string           // Reference to scheme in style guide
  backgroundType: 'none' | 'image' | 'video'  // For CTA-type sections
  assetType: 'image' | 'video'  // For Hero-type sections
  image?: {
    url: string               // Uploaded image URL
    ratio: 'auto' | '16:9' | '3:2' | '4:3' | '1:1' | '3:4'
    position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    fillMode: 'cover' | 'contain'
    width?: string
    shape: 'rectangle' | 'rounded'
    overlay: boolean
    foreground: 'color' | 'none'
  }
  video?: {
    url: string
    autoplay: boolean
    loop: boolean
    muted: boolean
  }
}
```

### Key Architecture Decisions
1. **Background vs Inline image** is determined by the section template's variant configuration (what Relume calls "Background" vs "Asset")
2. **Scheme assignment** is at section level, not block level — each section gets ONE scheme
3. **Template variant controls** (`Style`, `Asset`, `Background`, `Text`, `Element`, `Asset Placement`) are per-template — different templates expose different control rows
4. **Image controls adapt** based on whether the image is inline or background — the Image sub-panel renders different enabled/disabled states
5. **No direct code export** — Relume exports to Figma; Scytle's advantage is direct code generation
