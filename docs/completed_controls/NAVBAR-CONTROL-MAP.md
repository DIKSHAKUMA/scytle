# Navbar Category — Control Map

> Complete control mapping for Relume Navbar category (31 variants)  
> Research Date: 2024-02-23

---

## Overview

The Navbar category contains **31 variants** (Navbar 1–31). Unlike most Relume categories, Navbar variants use a simple **single-axis system** where applicable variants can toggle the menu's visibility state.

### Key Findings

| Metric | Value |
|--------|-------|
| Total Variants | 31 |
| Variants with Axis | ~16 (estimated) |
| Standalone (no controls) | ~15 (estimated) |
| Axis Name | "Menu" |
| Axis Values | Show, Hide |

**Important:** The presence of the "Menu" axis does NOT strictly correlate with API tags. Variants with identical tags (e.g., Navbar 2 vs Navbar 15) may have different axis availability, suggesting internal structural differences.

---

## Axis Definition

### Menu Axis

| Value | Effect |
|-------|--------|
| **Show** | Full menu visible (default on most navbars) |
| **Hide** | Hamburger/collapsed menu state |

This axis controls whether the navigation menu is displayed in full (with all links visible) or in a collapsed/hamburger state. Useful for layouts that need to toggle between desktop and mobile-style navigation.

---

## Verified Variant Analysis

### Variants WITH "Menu" Axis (Verified ✓)

| Navbar | API Tags | Notes |
|--------|----------|-------|
| **4** | Logo Left, Hamburger Menu (Desktop) | Explicit hamburger layout |
| **15** | Menu Center, Logo Left | Centered menu design |
| **20** | Logo Left, Menu Center, Menu Right, Mega Menu, Hamburger Menu (Desktop), Newsletter Sign Up | Complex mega menu with newsletter |
| **23** | Logo Left, Menu Center, Menu Right, Mega Menu, Image, Multiple Images | Mega menu with images |

### Variants WITHOUT "Menu" Axis (Verified ✓)

| Navbar | API Tags | Notes |
|--------|----------|-------|
| **1** | Logo Left, Menu Right | Simple right-aligned menu |
| **2** | Logo Left, Menu Center | Simple centered menu |
| **5** | Menu Left, Logo Left, Mega Menu | Mega menu, left-positioned |
| **10** | Menu Left, Logo Left, Mega Menu | Mega menu variant |
| **11** | Menu Right, Logo Left | Right-aligned menu |

---

## Complete Variant List with API Tags

All 31 Navbar variants retrieved from Relume API:

| # | Slug | Tags | Axis Status |
|---|------|------|-------------|
| 1 | navbar1_component | Logo Left, Menu Right | ❌ Verified: NONE |
| 2 | navbar2_component | Logo Left, Menu Center | ❌ Verified: NONE |
| 3 | navbar3_component | Logo Center, Menu Left | ❓ Unverified |
| 4 | navbar4_component | Logo Left, Hamburger Menu (Desktop) | ✅ Verified: Menu |
| 5 | navbar5_component | Menu Left, Logo Left, Mega Menu | ❌ Verified: NONE |
| 6 | navbar6_component | Menu Left, Logo Left, Mega Menu | ❓ Unverified |
| 7 | navbar7_component | Menu Left, Logo Left, Mega Menu | ❓ Unverified |
| 8 | navbar8_component | Menu Left, Logo Left, Mega Menu | ❓ Unverified |
| 9 | navbar9_component | Menu Left, Logo Left, Mega Menu | ❓ Unverified |
| 10 | navbar10_component | Menu Left, Logo Left, Mega Menu | ❌ Verified: NONE |
| 11 | navbar11_component | Menu Right, Logo Left | ❌ Verified: NONE |
| 12 | navbar12_component | Menu Right, Logo Left | ❓ Unverified |
| 13 | navbar13_component | Menu Center, Logo Left | ❓ Unverified |
| 14 | navbar14_component | Menu Right, Logo Left | ❓ Unverified |
| 15 | navbar15_component | Menu Center, Logo Left | ✅ Verified: Menu |
| 16 | navbar16_component | Logo Left, Menu Right, Mega Menu, Hamburger Menu (Desktop) | ✅ Likely: Menu* |
| 17 | navbar17_component | Logo Left, Menu Right, Mega Menu, Hamburger Menu (Desktop) | ✅ Likely: Menu* |
| 18 | navbar18_component | Logo Left, Menu Right, Mega Menu, Hamburger Menu (Desktop) | ✅ Likely: Menu* |
| 19 | navbar19_component | Logo Left, Menu Center, Menu Right, Mega Menu, Hamburger Menu (Desktop) | ✅ Likely: Menu* |
| 20 | navbar20_component | Logo Left, Menu Center, Menu Right, Mega Menu, Hamburger Menu (Desktop), Newsletter Sign Up | ✅ Verified: Menu |
| 21 | navbar21_component | Logo Left, Menu Center, Menu Right, Mega Menu, Hamburger Menu (Desktop), Featured Blog Posts | ✅ Likely: Menu* |
| 22 | navbar22_component | Logo Left, Menu Center, Menu Right, Mega Menu, Hamburger Menu (Desktop), Form | ✅ Likely: Menu* |
| 23 | navbar23_component | Logo Left, Menu Center, Menu Right, Mega Menu, Image, Multiple Images | ✅ Verified: Menu |
| 24 | navbar24_component | Logo Left, Menu Center, Menu Right, Mega Menu, Image | ✅ Likely: Menu* |
| 25 | navbar25_component | Logo Left, Menu Center, Menu Right, Mega Menu, Image | ✅ Likely: Menu* |
| 26 | navbar26_component | Logo Left, Menu Center, Menu Right, Mega Menu, Background Image | ✅ Likely: Menu* |
| 27 | navbar27_component | Logo Left, Menu Center, Menu Right, Mega Menu, Multiple Images, Background Image, Image | ✅ Likely: Menu* |
| 28 | navbar28_component | Logo Left, Menu Center, Menu Right, Mega Menu, Multiple Images, Background Image, Image | ✅ Likely: Menu* |
| 29 | navbar29_component | Logo Left, Menu Center, Menu Right, Mega Menu, Multiple Images, Background Image, Image | ✅ Likely: Menu* |
| 30 | navbar30_component | Logo Left, Menu Center, Menu Right, Mega Menu, Multiple Images, Image | ✅ Likely: Menu* |
| 31 | navbar31_component | Logo Left, Menu Right, Mega Menu | ❓ Unverified |

*Likely = Has "Hamburger Menu (Desktop)" or "Image" tags, which strongly correlate with "Menu" axis presence

---

## Pattern Analysis

### Observed Correlations

Based on verified checks, variants with the "Menu" axis tend to:

1. **Have "Hamburger Menu (Desktop)" tag** — Navbars 4, 16-22 all have this tag, and all verified ones (4, 20) have the axis
2. **Have "Image" related tags** — Navbars 23-30 have Image tags, and Navbar 23 (verified) has the axis
3. **Have complex multi-section menus** — Navbar 15 has the axis despite lacking special tags

### Anomalies

| Navbar 2 | Navbar 15 |
|----------|-----------|
| Tags: Logo Left, Menu Center | Tags: Menu Center, Logo Left |
| **NO** axis | **HAS** axis |

Same semantic tags but different axis availability. This suggests the axis is determined by **internal component structure** rather than just searchable tags.

---

## Tag Categories Summary

### Layout Tags (Position)
- `Logo Left` — Logo positioned on left side
- `Logo Center` — Logo centered
- `Menu Left` — Navigation menu on left
- `Menu Center` — Navigation menu centered
- `Menu Right` — Navigation menu on right

### Feature Tags
- `Mega Menu` — Dropdown mega menu capability
- `Hamburger Menu (Desktop)` — Hamburger icon visible on desktop (strong axis indicator)
- `Newsletter Sign Up` — Includes newsletter signup form
- `Featured Blog Posts` — Includes featured blog section
- `Form` — Includes form element
- `Image` — Contains featured image
- `Multiple Images` — Contains multiple images
- `Background Image` — Uses background imagery

---

## Family Structure (Estimated)

Based on findings, the Navbar category can be organized as:

### Family A: Menu-Configurable Navbars
**Axis:** Menu (Show / Hide)  
**Members (estimated 16):** 4, 15-30  
**Pattern:** Complex layouts, hamburger options, or rich mega menus with images

### Standalone Variants (No Config)
**Members (estimated 15):** 1-3, 5-14, 31  
**Pattern:** Simple traditional navbar layouts with fixed menu visibility

---

## Slot-Adding (2-Dots)

**Status:** NOT INVESTIGATED

Navbar components are global sections and may not support traditional slot-adding like other section types. Further research needed.

---

## API Reference

### Endpoints Used

```
# All navbars
https://apis.relume.io/v1/components?member_token={TOKEN}&filter_category=navbars&page_size=50

# Single component
https://apis.relume.io/v1/components?member_token={TOKEN}&filter_component_slug=navbar{N}_component
```

### Internal Naming

- Slug format: `navbar{N}_component` (e.g., `navbar1_component`)
- Unlike other categories using `section_` prefix, navbars use `navbar` prefix
- Navbar 9 exists in API but was missing from Replace Component search results

---

## Notes & Caveats

1. **Verification Coverage:** Only 10 of 31 variants fully verified (1-2, 4-5, 10-11, 15, 20, 23)
2. **Tag Unreliability:** API tags do not perfectly predict axis availability
3. **Numbering Gap:** Navbar 9 appears in API but may be hidden in UI
4. **Navbar 31:** Extra variant not shown in Add panel (30 listed there)

---

## Implementation Recommendations

For Scytle implementation:

1. **Single Family Approach:** Create one `NavbarFamily` with optional "Menu" axis
2. **Show axis for:** Variants 4, 15-30 (based on pattern analysis)
3. **Hide axis for:** Variants 1-3, 5-14, 31
4. **Default:** Menu = "Hide" (most common use case)

### TypeScript Definition

```typescript
// src/lib/designs/v2/layouts/navbar/types.ts

export type NavbarMenuState = 'show' | 'hide'

export interface NavbarControlState {
  menu?: NavbarMenuState  // Only present for configurable variants
}

// Variants with Menu axis (based on research)
export const NAVBAR_MENU_VARIANTS = [4, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]

// Standalone variants (no controls)
export const NAVBAR_STANDALONE_VARIANTS = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 31]
```

---

*Document generated from Relume research session using MCP Playwright automation*
