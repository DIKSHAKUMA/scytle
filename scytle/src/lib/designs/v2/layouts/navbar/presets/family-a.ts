/**
 * Navbar Family A — Block Factories & Preset Configs
 *
 * 32 presets: Navbar 1–32
 * All variants are standalone (no matrix axes).
 *
 * Layout groups:
 *   Standard (logo L, links+buttons R):  1, 5–12, 23–30 (19 variants)
 *   Center-links (logo L, links C, btn R): 2, 17, 20 (3 variants)
 *   Center-logo (links L, logo C, btn R):  3 (1 variant)
 *   Hamburger (logo L, btn+menu R):        4, 16, 22, 31, 32 (5 variants)
 *   Hamburger+links:                        18, 19, 21 (3 variants)
 *   Floating:                               13 (1 variant)
 *   Two-row:                                14, 15 (2 variants)
 */

import type { Block } from '../../../blocks/types'
import type { NavbarPresetConfig } from '../types'
import {
    buildStandardBar,
    buildCenterLinksBar,
    buildCenterLogoBar,
    buildHamburgerBar,
    buildHamburgerLinksBar,
    buildTwoRowBar,
} from './shared-builders'

// ============================================
// Block Factories (32 total)
// ============================================

// ── Standard bar variants ───────────────────────────────────

/** Navbar 1 — Standard: Logo L, 4 links, 2 buttons */
export function buildNavbar1Blocks(): Block[] { return buildStandardBar(4, 2) }

/** Navbar 5 — Standard: Logo L, 5 links, 2 buttons (mega menu) */
export function buildNavbar5Blocks(): Block[] { return buildStandardBar(5, 2) }

/** Navbar 6 — Standard: Logo L, 4 links, 2 buttons (mega menu) */
export function buildNavbar6Blocks(): Block[] { return buildStandardBar(4, 2) }

/** Navbar 7 — Standard: Logo L, 4 links, 2 buttons (mega menu, search) */
export function buildNavbar7Blocks(): Block[] { return buildStandardBar(4, 2) }

/** Navbar 8 — Standard: Logo L, 3 links, 2 buttons (mega menu) */
export function buildNavbar8Blocks(): Block[] { return buildStandardBar(3, 2) }

/** Navbar 9 — Standard: Logo L, 4 links, 1 button (mega menu) */
export function buildNavbar9Blocks(): Block[] { return buildStandardBar(4, 1) }

/** Navbar 10 — Standard: Logo L, 5 links, 2 buttons (mega menu) */
export function buildNavbar10Blocks(): Block[] { return buildStandardBar(5, 2) }

/** Navbar 11 — Standard: Logo L, 4 links, 2 buttons (icon dropdowns) */
export function buildNavbar11Blocks(): Block[] { return buildStandardBar(4, 2) }

/** Navbar 12 — Standard: Logo L, 4 links, 2 buttons (icon dropdowns) */
export function buildNavbar12Blocks(): Block[] { return buildStandardBar(4, 2) }

/** Navbar 23 — Standard: Logo L, 5 links, 2 buttons (mega menu, images) */
export function buildNavbar23Blocks(): Block[] { return buildStandardBar(5, 2) }

/** Navbar 24 — Standard: Logo L, 4 links, 2 buttons (mega menu, images) */
export function buildNavbar24Blocks(): Block[] { return buildStandardBar(4, 2) }

/** Navbar 25 — Standard: Logo L, 4 links, 2 buttons (mega menu) */
export function buildNavbar25Blocks(): Block[] { return buildStandardBar(4, 2) }

/** Navbar 26 — Standard: Logo L, 3 links, 2 buttons (mega menu) */
export function buildNavbar26Blocks(): Block[] { return buildStandardBar(3, 2) }

/** Navbar 27 — Standard: Logo L, 3 links, 2 buttons (mega menu) */
export function buildNavbar27Blocks(): Block[] { return buildStandardBar(3, 2) }

/** Navbar 28 — Standard: Logo L, 4 links, 2 buttons (mega menu) */
export function buildNavbar28Blocks(): Block[] { return buildStandardBar(4, 2) }

/** Navbar 29 — Standard: Logo L, 5 links, 2 buttons (mega menu) */
export function buildNavbar29Blocks(): Block[] { return buildStandardBar(5, 2) }

/** Navbar 30 — Standard: Logo L, 3 links, 2 buttons (mega menu) */
export function buildNavbar30Blocks(): Block[] { return buildStandardBar(3, 2) }

// ── Center-links variants ───────────────────────────────────

/** Navbar 2 — Center Links: Logo L, 4 links center, 1 button R */
export function buildNavbar2Blocks(): Block[] { return buildCenterLinksBar(4, 1) }

/** Navbar 17 — Center Links: Logo L, 3 links center, 1 button + hamburger R */
export function buildNavbar17Blocks(): Block[] { return buildCenterLinksBar(3, 1) }

/** Navbar 20 — Center Links: Logo L, 4 links center, 2 buttons + hamburger R */
export function buildNavbar20Blocks(): Block[] { return buildCenterLinksBar(4, 2) }

// ── Center-logo variant ─────────────────────────────────────

/** Navbar 3 — Center Logo: 3 links L, logo center, 1 button R */
export function buildNavbar3Blocks(): Block[] { return buildCenterLogoBar(3, 1) }

// ── Hamburger variants (no inline links) ────────────────────

/** Navbar 4 — Hamburger: Logo L, 1 button + menu R */
export function buildNavbar4Blocks(): Block[] { return buildHamburgerBar(1) }

/** Navbar 16 — Hamburger: Logo L, 1 button + menu R (full overlay) */
export function buildNavbar16Blocks(): Block[] { return buildHamburgerBar(1) }

/** Navbar 22 — Hamburger: Logo L, 1 button + menu R (full overlay) */
export function buildNavbar22Blocks(): Block[] { return buildHamburgerBar(1) }

/** Navbar 31 — Hamburger: Logo L, 1 button + menu R (full overlay, tabs) */
export function buildNavbar31Blocks(): Block[] { return buildHamburgerBar(1) }

/** Navbar 32 — Hamburger: Logo L, 2 buttons + menu R (full overlay, tabs) */
export function buildNavbar32Blocks(): Block[] { return buildHamburgerBar(2) }

// ── Hamburger with inline links ─────────────────────────────

/** Navbar 18 — Hamburger+Links: Logo L, 4 links + 2 buttons + menu R */
export function buildNavbar18Blocks(): Block[] { return buildHamburgerLinksBar(4, 2) }

/** Navbar 19 — Hamburger+Links: Logo L, 4 links + 2 buttons + menu R */
export function buildNavbar19Blocks(): Block[] { return buildHamburgerLinksBar(4, 2) }

/** Navbar 21 — Hamburger+Links: Logo L, 4 links + 2 buttons + menu R */
export function buildNavbar21Blocks(): Block[] { return buildHamburgerLinksBar(4, 2) }

// ── Floating variant ────────────────────────────────────────

/** Navbar 13 — Floating: Logo L, 4 links, 1 button, bordered bar */
export function buildNavbar13Blocks(): Block[] { return buildStandardBar(4, 1) }

// ── Two-row variants ────────────────────────────────────────

/** Navbar 14 — Two-row: top info links + standard nav bar */
export function buildNavbar14Blocks(): Block[] { return buildTwoRowBar(4, 2) }

/** Navbar 15 — Two-row: top info links + standard nav bar */
export function buildNavbar15Blocks(): Block[] { return buildTwoRowBar(4, 2) }

// ============================================
// Preset Configs (32 total)
// ============================================

const NAVBAR_1_CONFIG: NavbarPresetConfig = {
    id: 'navbar-1', name: 'Navbar 1',
    description: 'Standard bar with logo left, links and buttons right',
    tags: ['navbar', 'standard', 'logo-left', 'links-right'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_2_CONFIG: NavbarPresetConfig = {
    id: 'navbar-2', name: 'Navbar 2',
    description: 'Bar with centered navigation links',
    tags: ['navbar', 'center-links', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'center-links', linkCount: 4, buttonCount: 1, axes: {},
}

const NAVBAR_3_CONFIG: NavbarPresetConfig = {
    id: 'navbar-3', name: 'Navbar 3',
    description: 'Bar with centered logo, links left',
    tags: ['navbar', 'center-logo', 'links-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'center-logo', linkCount: 3, buttonCount: 1, axes: {},
}

const NAVBAR_4_CONFIG: NavbarPresetConfig = {
    id: 'navbar-4', name: 'Navbar 4',
    description: 'Hamburger menu with full-screen dropdown',
    tags: ['navbar', 'hamburger', 'dropdown', 'mobile-first'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'hamburger', linkCount: 0, buttonCount: 1, axes: {},
}

const NAVBAR_5_CONFIG: NavbarPresetConfig = {
    id: 'navbar-5', name: 'Navbar 5',
    description: 'Standard bar with mega menu dropdown',
    tags: ['navbar', 'standard', 'mega-menu', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 5, buttonCount: 2, axes: {},
}

const NAVBAR_6_CONFIG: NavbarPresetConfig = {
    id: 'navbar-6', name: 'Navbar 6',
    description: 'Standard bar with multi-column mega menu',
    tags: ['navbar', 'standard', 'mega-menu', 'logo-left', 'multi-column'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_7_CONFIG: NavbarPresetConfig = {
    id: 'navbar-7', name: 'Navbar 7',
    description: 'Standard bar with mega menu and search',
    tags: ['navbar', 'standard', 'mega-menu', 'search', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_8_CONFIG: NavbarPresetConfig = {
    id: 'navbar-8', name: 'Navbar 8',
    description: 'Compact bar with mega menu, 3 links',
    tags: ['navbar', 'standard', 'mega-menu', 'compact', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 3, buttonCount: 2, axes: {},
}

const NAVBAR_9_CONFIG: NavbarPresetConfig = {
    id: 'navbar-9', name: 'Navbar 9',
    description: 'Standard bar with mega menu, single button',
    tags: ['navbar', 'standard', 'mega-menu', 'single-button', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 4, buttonCount: 1, axes: {},
}

const NAVBAR_10_CONFIG: NavbarPresetConfig = {
    id: 'navbar-10', name: 'Navbar 10',
    description: 'Standard bar with mega menu, 5 links',
    tags: ['navbar', 'standard', 'mega-menu', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 5, buttonCount: 2, axes: {},
}

const NAVBAR_11_CONFIG: NavbarPresetConfig = {
    id: 'navbar-11', name: 'Navbar 11',
    description: 'Standard bar with icon dropdowns',
    tags: ['navbar', 'standard', 'dropdown', 'icons', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_12_CONFIG: NavbarPresetConfig = {
    id: 'navbar-12', name: 'Navbar 12',
    description: 'Standard bar with descriptive dropdowns',
    tags: ['navbar', 'standard', 'dropdown', 'descriptions', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_13_CONFIG: NavbarPresetConfig = {
    id: 'navbar-13', name: 'Navbar 13',
    description: 'Floating bordered bar with inset padding',
    tags: ['navbar', 'floating', 'bordered', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'floating', layout: 'standard', linkCount: 4, buttonCount: 1, axes: {},
}

const NAVBAR_14_CONFIG: NavbarPresetConfig = {
    id: 'navbar-14', name: 'Navbar 14',
    description: 'Two-row: announcement bar + standard nav',
    tags: ['navbar', 'two-row', 'announcement', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'two-row', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_15_CONFIG: NavbarPresetConfig = {
    id: 'navbar-15', name: 'Navbar 15',
    description: 'Two-row: info bar + navigation bar',
    tags: ['navbar', 'two-row', 'info-bar', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'two-row', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_16_CONFIG: NavbarPresetConfig = {
    id: 'navbar-16', name: 'Navbar 16',
    description: 'Hamburger with full-screen overlay, stacked links',
    tags: ['navbar', 'hamburger', 'overlay', 'full-screen'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'hamburger', linkCount: 0, buttonCount: 1, axes: {},
}

const NAVBAR_17_CONFIG: NavbarPresetConfig = {
    id: 'navbar-17', name: 'Navbar 17',
    description: 'Center links with hamburger and overlay',
    tags: ['navbar', 'center-links', 'hamburger', 'overlay'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'center-links', linkCount: 3, buttonCount: 1, axes: {},
}

const NAVBAR_18_CONFIG: NavbarPresetConfig = {
    id: 'navbar-18', name: 'Navbar 18',
    description: 'Hamburger with inline links and overlay',
    tags: ['navbar', 'hamburger-links', 'overlay', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'hamburger-links', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_19_CONFIG: NavbarPresetConfig = {
    id: 'navbar-19', name: 'Navbar 19',
    description: 'Hamburger with inline links, grid overlay',
    tags: ['navbar', 'hamburger-links', 'overlay', 'grid'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'hamburger-links', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_20_CONFIG: NavbarPresetConfig = {
    id: 'navbar-20', name: 'Navbar 20',
    description: 'Center links with hamburger and 2 buttons',
    tags: ['navbar', 'center-links', 'hamburger', 'overlay'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'center-links', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_21_CONFIG: NavbarPresetConfig = {
    id: 'navbar-21', name: 'Navbar 21',
    description: 'Hamburger with inline links, stacked overlay',
    tags: ['navbar', 'hamburger-links', 'overlay', 'stacked'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'hamburger-links', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_22_CONFIG: NavbarPresetConfig = {
    id: 'navbar-22', name: 'Navbar 22',
    description: 'Minimal hamburger with full-screen overlay',
    tags: ['navbar', 'hamburger', 'overlay', 'minimal'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'hamburger', linkCount: 0, buttonCount: 1, axes: {},
}

const NAVBAR_23_CONFIG: NavbarPresetConfig = {
    id: 'navbar-23', name: 'Navbar 23',
    description: 'Standard bar with image-rich mega menu',
    tags: ['navbar', 'standard', 'mega-menu', 'images', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 5, buttonCount: 2, axes: {},
}

const NAVBAR_24_CONFIG: NavbarPresetConfig = {
    id: 'navbar-24', name: 'Navbar 24',
    description: 'Standard bar with image gallery mega menu',
    tags: ['navbar', 'standard', 'mega-menu', 'gallery', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_25_CONFIG: NavbarPresetConfig = {
    id: 'navbar-25', name: 'Navbar 25',
    description: 'Standard bar with categorized mega menu',
    tags: ['navbar', 'standard', 'mega-menu', 'categories', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_26_CONFIG: NavbarPresetConfig = {
    id: 'navbar-26', name: 'Navbar 26',
    description: 'Compact bar with compact mega menu',
    tags: ['navbar', 'standard', 'mega-menu', 'compact', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 3, buttonCount: 2, axes: {},
}

const NAVBAR_27_CONFIG: NavbarPresetConfig = {
    id: 'navbar-27', name: 'Navbar 27',
    description: 'Compact bar with tabbed mega menu',
    tags: ['navbar', 'standard', 'mega-menu', 'tabs', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 3, buttonCount: 2, axes: {},
}

const NAVBAR_28_CONFIG: NavbarPresetConfig = {
    id: 'navbar-28', name: 'Navbar 28',
    description: 'Standard bar with featured mega menu',
    tags: ['navbar', 'standard', 'mega-menu', 'featured', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 4, buttonCount: 2, axes: {},
}

const NAVBAR_29_CONFIG: NavbarPresetConfig = {
    id: 'navbar-29', name: 'Navbar 29',
    description: 'Wide bar with multi-section mega menu',
    tags: ['navbar', 'standard', 'mega-menu', 'multi-section', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 5, buttonCount: 2, axes: {},
}

const NAVBAR_30_CONFIG: NavbarPresetConfig = {
    id: 'navbar-30', name: 'Navbar 30',
    description: 'Compact bar with sidebar-style mega menu',
    tags: ['navbar', 'standard', 'mega-menu', 'sidebar', 'logo-left'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'standard', linkCount: 3, buttonCount: 2, axes: {},
}

const NAVBAR_31_CONFIG: NavbarPresetConfig = {
    id: 'navbar-31', name: 'Navbar 31',
    description: 'Hamburger with tabbed full-screen overlay',
    tags: ['navbar', 'hamburger', 'overlay', 'tabs', 'full-screen'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'hamburger', linkCount: 0, buttonCount: 1, axes: {},
}

const NAVBAR_32_CONFIG: NavbarPresetConfig = {
    id: 'navbar-32', name: 'Navbar 32',
    description: 'Hamburger with dual buttons and tabbed overlay',
    tags: ['navbar', 'hamburger', 'overlay', 'tabs', 'dual-button'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'bar', layout: 'hamburger', linkCount: 0, buttonCount: 2, axes: {},
}

// ============================================
// Exports: Arrays, Maps & Block Factories
// ============================================

export const FAMILY_A_PRESETS: NavbarPresetConfig[] = [
    NAVBAR_1_CONFIG, NAVBAR_2_CONFIG, NAVBAR_3_CONFIG, NAVBAR_4_CONFIG,
    NAVBAR_5_CONFIG, NAVBAR_6_CONFIG, NAVBAR_7_CONFIG, NAVBAR_8_CONFIG,
    NAVBAR_9_CONFIG, NAVBAR_10_CONFIG, NAVBAR_11_CONFIG, NAVBAR_12_CONFIG,
    NAVBAR_13_CONFIG, NAVBAR_14_CONFIG, NAVBAR_15_CONFIG, NAVBAR_16_CONFIG,
    NAVBAR_17_CONFIG, NAVBAR_18_CONFIG, NAVBAR_19_CONFIG, NAVBAR_20_CONFIG,
    NAVBAR_21_CONFIG, NAVBAR_22_CONFIG, NAVBAR_23_CONFIG, NAVBAR_24_CONFIG,
    NAVBAR_25_CONFIG, NAVBAR_26_CONFIG, NAVBAR_27_CONFIG, NAVBAR_28_CONFIG,
    NAVBAR_29_CONFIG, NAVBAR_30_CONFIG, NAVBAR_31_CONFIG, NAVBAR_32_CONFIG,
]

export const FAMILY_A_PRESETS_MAP: Record<string, NavbarPresetConfig> = Object.fromEntries(
    FAMILY_A_PRESETS.map((p) => [p.id, p])
)

export const FAMILY_A_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'navbar-1': buildNavbar1Blocks,
    'navbar-2': buildNavbar2Blocks,
    'navbar-3': buildNavbar3Blocks,
    'navbar-4': buildNavbar4Blocks,
    'navbar-5': buildNavbar5Blocks,
    'navbar-6': buildNavbar6Blocks,
    'navbar-7': buildNavbar7Blocks,
    'navbar-8': buildNavbar8Blocks,
    'navbar-9': buildNavbar9Blocks,
    'navbar-10': buildNavbar10Blocks,
    'navbar-11': buildNavbar11Blocks,
    'navbar-12': buildNavbar12Blocks,
    'navbar-13': buildNavbar13Blocks,
    'navbar-14': buildNavbar14Blocks,
    'navbar-15': buildNavbar15Blocks,
    'navbar-16': buildNavbar16Blocks,
    'navbar-17': buildNavbar17Blocks,
    'navbar-18': buildNavbar18Blocks,
    'navbar-19': buildNavbar19Blocks,
    'navbar-20': buildNavbar20Blocks,
    'navbar-21': buildNavbar21Blocks,
    'navbar-22': buildNavbar22Blocks,
    'navbar-23': buildNavbar23Blocks,
    'navbar-24': buildNavbar24Blocks,
    'navbar-25': buildNavbar25Blocks,
    'navbar-26': buildNavbar26Blocks,
    'navbar-27': buildNavbar27Blocks,
    'navbar-28': buildNavbar28Blocks,
    'navbar-29': buildNavbar29Blocks,
    'navbar-30': buildNavbar30Blocks,
    'navbar-31': buildNavbar31Blocks,
    'navbar-32': buildNavbar32Blocks,
}
