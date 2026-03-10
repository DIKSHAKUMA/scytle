# Phase C7 — Theme System

> **Status**: 🔲 Not started
> **Priority**: Medium — enhances the design workflow, not blocking
> **Dependencies**: C1 (parser, nodes on canvas), C4 (workspace right panel)
> **Demo**: `src/app/demo/flow/workspace/page.tsx` → Theme tab in right panel
> **Existing code**: `src/store/style-guide-store.ts` (622 LOC)

## Purpose

Let users quickly change the visual style of all generated designs by modifying colors, fonts, border radius, and component styles. Unlike the old system (CSS variables on a wrapper div), the new theme system **directly modifies ScytleNode properties** on the canvas.

## How It Differs from the Old System

| Old (CSS Variables) | New (Direct Node Mutation) |
|--------------------|-----------------------------|
| Tokens → CSS custom properties | Tokens → walk node tree, update matching properties |
| Applied via `<TokenProvider style={computedCSS}>` | Applied via `editorStore.updateNode()` calls |
| Only worked with pre-built template components | Works with ANY ScytleNode tree (AI-generated or manual) |
| Changes invisible to node properties (CSS override) | Changes baked into node data (visible in properties panel) |
| Couldn't export themed values | Exported HTML reflects actual colors/fonts |

## Theme Data Model

```typescript
interface ThemeConfig {
    // Colors
    primary: string       // Main brand color
    background: string    // Page background
    text: string          // Primary text color
    accent: string        // CTA / highlight color
    muted: string         // Secondary text
    border: string        // Border color

    // Typography
    headingFont: string   // e.g. "Inter", "Playfair Display"
    bodyFont: string      // e.g. "Inter", "DM Sans"
    scale: number         // Typography scale multiplier (0.5 – 2.0)

    // Style
    borderRadius: number  // Global radius in px (0 – 32)
    buttonStyle: 'solid' | 'outline' | 'ghost' | 'pill'
    cardStyle: 'bordered' | 'shadow' | 'flat'
}
```

### Preset Themes (from Demo)

```typescript
const THEME_PRESETS: ThemeConfig[] = [
    { name: 'Default',  primary: '#171717', bg: '#ffffff', text: '#171717', ... },
    { name: 'Ocean',    primary: '#0ea5e9', bg: '#f0f9ff', text: '#0c4a6e', ... },
    { name: 'Forest',   primary: '#22c55e', bg: '#f0fdf4', text: '#14532d', ... },
    { name: 'Sunset',   primary: '#f97316', bg: '#fff7ed', text: '#7c2d12', ... },
    { name: 'Rose',     primary: '#e11d48', bg: '#fff1f2', text: '#4c0519', ... },
    { name: 'Dark',     primary: '#a78bfa', bg: '#0f0f0f', text: '#e5e5e5', ... },
]
```

## Theme Tab UI (from Demo)

### Presets Section
```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ ●●●     │ │ ●●●     │ │ ●●●     │
│ Default │ │ Ocean   │ │ Forest  │
└─────────┘ └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐ ┌─────────┐
│ ●●●     │ │ ●●●     │ │ ●●●     │
│ Sunset  │ │  Rose   │ │  Dark   │
└─────────┘ └─────────┘ └─────────┘
```

- 3-column grid (grid-cols-3 gap-1.5)
- Each preset: 3 color circles (primary, bg, text) + label
- Active: `border-accent bg-accent/5`
- "Shuffle" button to randomize

### Colors Section
```
[■] Primary     #171717
[■] Background  #ffffff
[■] Text        #171717
[■] Accent      #10b981
[■] Muted       #6b7280
[■] Border      #e5e7eb
```

- Each row: color swatch (w-5 h-5 rounded-md) + label + hex code
- Clickable → opens color picker (use existing shadcn color picker or Radix Popover + input)
- `hover:bg-muted/30 cursor-pointer`

### Typography Section
```
Heading   [ Inter          ▼ ]
Body      [ Inter          ▼ ]
Scale     [──────●──────] 1.0x
```

- Font dropdowns: `h-8 bg-muted/40 border rounded-lg`
- Scale slider: range 0.5x to 2.0x, thumb = `w-3 h-3 rounded-full bg-foreground`

### Style Section
```
Radius    [────────●───] 12px

Buttons   [ Solid ] [ Outline ] [ Ghost ] [ Pill ]
Cards     [ Bordered ] [ Shadow ] [ Flat ]
```

- Radius slider: 0–32px
- Button/Card style toggles: active = `bg-foreground text-background`, inactive = `bg-muted/40`

### Apply Button
```
[ Apply to All Pages ]
```

- `bg-accent text-white rounded-xl w-full py-2`
- Triggers the theme application algorithm

## Theme Application Algorithm

When "Apply to All Pages" is clicked:

```typescript
function applyTheme(theme: ThemeConfig) {
    const { nodes } = editorStore.getState()

    // Walk every node in every design frame
    function walkAndUpdate(node: ScytleNode) {
        // --- COLOR MAPPING ---
        // If node has a dark background fill → replace with theme.primary
        // If node has a light background fill → replace with theme.background
        // If node is a TextNode with dark color → replace with theme.text
        // If node is a TextNode with light/accent color → replace with theme.accent
        // If node has a border → update border.color to theme.border

        // --- TYPOGRAPHY MAPPING ---
        if (node.type === 'text') {
            // Detect if heading (fontSize >= 24 or htmlTag h1-h4) → apply headingFont
            // Otherwise → apply bodyFont
            // Apply scale multiplier to fontSize
            const isHeading = node.fontSize >= 24 ||
                              ['h1','h2','h3','h4'].includes(node.htmlTag || '')
            node.fontFamily = isHeading ? theme.headingFont : theme.bodyFont
            node.fontSize = Math.round(node.fontSize * theme.scale)
        }

        // --- BORDER RADIUS ---
        if (node.type === 'frame' && node.borderRadius > 0) {
            node.borderRadius = theme.borderRadius
        }

        // --- BUTTON STYLE ---
        if (isButtonNode(node)) {
            applyButtonStyle(node, theme.buttonStyle)
        }

        // --- CARD STYLE ---
        if (isCardNode(node)) {
            applyCardStyle(node, theme.cardStyle)
        }

        // Recurse into children
        if (node.type === 'frame') {
            node.children.forEach(walkAndUpdate)
        }
    }

    nodes.forEach(walkAndUpdate)
    editorStore.getState().setNodes(nodes)
}
```

### Color Classification

The tricky part: knowing which colors to replace. Strategy:

```typescript
function classifyColor(hex: string): 'dark' | 'light' | 'accent' | 'neutral' {
    const luminance = getLuminance(hex)
    if (luminance < 0.2) return 'dark'       // likely text/heading or dark bg
    if (luminance > 0.8) return 'light'      // likely background
    if (isSaturated(hex)) return 'accent'    // likely brand/accent
    return 'neutral'                          // likely border/muted
}

function mapColorToTheme(originalHex: string, theme: ThemeConfig): string {
    const type = classifyColor(originalHex)
    switch (type) {
        case 'dark': return theme.text
        case 'light': return theme.background
        case 'accent': return theme.primary
        case 'neutral': return theme.muted
    }
}
```

### Node Detection Heuristics

```typescript
function isButtonNode(node: ScytleNode): boolean {
    if (node.type !== 'frame') return false
    // A frame with: small height (32-56px), border-radius, solid fill, 
    // exactly one text child
    return node.height <= 56 && node.height >= 28 &&
           node.children.length === 1 && node.children[0].type === 'text' &&
           (node.fills.length > 0 || node.border)
}

function isCardNode(node: ScytleNode): boolean {
    if (node.type !== 'frame') return false
    // A frame with: moderate size, border-radius, multiple children,
    // border or shadow
    return node.width >= 200 && node.children.length >= 2 &&
           (node.border || node.shadows.length > 0)
}
```

## Theme Store

```typescript
// src/store/theme-store.ts (NEW — replaces style-guide-store for new system)

interface ThemeState {
    activePresetIndex: number
    customTheme: ThemeConfig       // Current active theme (may be modified from preset)
    presets: ThemeConfig[]

    // Actions
    selectPreset: (index: number) => void
    updateColor: (key: keyof ThemeConfig, value: string) => void
    updateFont: (which: 'heading' | 'body', font: string) => void
    updateScale: (scale: number) => void
    updateRadius: (radius: number) => void
    updateButtonStyle: (style: ThemeConfig['buttonStyle']) => void
    updateCardStyle: (style: ThemeConfig['cardStyle']) => void
    applyToAllPages: () => void
    shufflePreset: () => void
}
```

## File Structure

```
src/store/
  theme-store.ts              ← NEW: theme state + apply logic

src/lib/theme/
  apply-theme.ts              ← Tree-walking theme application algorithm
  color-utils.ts              ← Luminance, saturation, color classification
  presets.ts                  ← Default theme presets

src/components/workspace/
  theme-tab.tsx               ← Theme panel UI (presets, colors, fonts, style)
```

## Known Challenges

1. **Color mapping ambiguity**: A gray (#6b7280) could be muted text or a subtle background — heuristics needed
2. **Preserving intentional color differences**: If AI made one card blue and another green, blanket theme application would make them both the same
3. **Font availability**: Custom fonts need to be loaded (`next/font` or Google Fonts link)
4. **Undo support**: Theme application should create a single undo snapshot, not one per node
5. **Live preview**: Ideally colors update in real-time as user drags the color picker, not just on "Apply"
