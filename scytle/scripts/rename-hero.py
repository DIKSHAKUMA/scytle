"""Rewrite hero files with sequential numbering 1-27."""
import pathlib

BASE = pathlib.Path("src/lib/designs/v2/layouts/hero")

# Mapping: (new_num, relume_header, alignment, background, actions, hasTagline)
PRESETS = [
    (1, 44, "left", "dark", "buttons", True),
    (2, 45, "left", "dark", "form", True),
    (3, 46, "left", "dark", "none", False),
    (4, 51, "left", "neutral", "buttons", True),
    (5, 53, "left", "neutral", "form", True),
    (6, 55, "left", "neutral", "none", False),
    (7, 50, "left", "image", "buttons", True),
    (8, 52, "left", "image", "form", True),
    (9, 54, "left", "image", "none", False),
    (10, 47, "split", "dark", "buttons", True),
    (11, 48, "split", "dark", "form", True),
    (12, 49, "split", "dark", "none", False),
    (13, 57, "split", "neutral", "buttons", True),
    (14, 59, "split", "neutral", "form", True),
    (15, 61, "split", "neutral", "none", False),
    (16, 56, "split", "image", "buttons", True),
    (17, 58, "split", "image", "form", True),
    (18, 60, "split", "image", "none", False),
    (19, 62, "center", "dark", "buttons", True),
    (20, 63, "center", "dark", "form", True),
    (21, 64, "center", "dark", "none", False),
    (22, 66, "center", "neutral", "buttons", True),
    (23, 68, "center", "neutral", "form", True),
    (24, 70, "center", "neutral", "none", False),
    (25, 65, "center", "image", "buttons", True),
    (26, 67, "center", "image", "form", True),
    (27, 69, "center", "image", "none", False),
]

TERMS = "By clicking Sign Up you" + chr(39) + "re confirming that you agree with our Terms and Conditions."

TYPES_CONTENT = """/**
 * Hero Layout \u2014 Type Definitions
 *
 * The 27 hero layouts form a 3\u00d73\u00d73 matrix:
 *   Alignment: left | split | center
 *   Background: dark | neutral | image
 *   Actions: buttons | form | none
 *
 * Sequential numbering 1\u201327 (Relume headers 44\u201370 preserved as relumeHeader).
 */

// ============================================
// Hero Configuration Axes
// ============================================

/** Content alignment within the section */
export type HeroAlignment = 'left' | 'split' | 'center'

/** Background treatment */
export type HeroBackground = 'dark' | 'neutral' | 'image'

/** Call-to-action type */
export type HeroActions = 'buttons' | 'form' | 'none'

// ============================================
// Hero Preset Configuration
// ============================================

export interface HeroPresetConfig {
    /** Unique layout ID, e.g. 'hero-1' */
    id: string
    /** Display name, e.g. 'Hero 1' */
    name: string
    /** Relume reference number (for documentation) */
    relumeHeader: number
    /** Content alignment */
    alignment: HeroAlignment
    /** Background style */
    background: HeroBackground
    /** Action type */
    actions: HeroActions
    /** Whether tagline is shown (true when actions !== 'none') */
    hasTagline: boolean
}

// ============================================
// Hero Content (for default block generation)
// ============================================

export interface HeroContent {
    tagline?: string
    heading: string
    description: string
    primaryButtonText?: string
    secondaryButtonText?: string
    inputPlaceholder?: string
    submitButtonText?: string
    termsText?: string
}

export const DEFAULT_HERO_CONTENT: HeroContent = {
    tagline: 'Tagline',
    heading: 'Short heading here',
    description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    primaryButtonText: 'Button',
    secondaryButtonText: 'Button',
    inputPlaceholder: 'Enter your email',
    submitButtonText: 'Sign up',
    termsText:
        "TERMS_PLACEHOLDER",
}
"""


def gen_presets():
    lines = []
    lines.append("/**")
    lines.append(" * Hero Presets \u2014 All 27 hero layout configurations")
    lines.append(" *")
    lines.append(" * 3\u00d73\u00d73 matrix:")
    lines.append(" *   Alignment: left | split | center")
    lines.append(" *   Background: dark | neutral | image")
    lines.append(" *   Actions: buttons | form | none")
    lines.append(" *")
    lines.append(" * Sequential numbering 1\u201327. Relume reference numbers preserved in relumeHeader.")
    lines.append(" */")
    lines.append("")
    lines.append("import type { HeroPresetConfig } from './types'")
    lines.append("")

    sections = [
        (1, 9, "Left-aligned, single column"),
        (10, 18, "Split two-column"),
        (19, 27, "Center-aligned, single column"),
    ]

    for start, end, label in sections:
        lines.append("// ============================================")
        lines.append(f"// {label} ({start}\u2013{end})")
        lines.append("// ============================================")
        lines.append("")
        for n, relume, align, bg, act, tagline in PRESETS:
            if start <= n <= end:
                lines.append(f"export const HERO_{n}: HeroPresetConfig = " + "{")
                lines.append(f"    id: 'hero-{n}',")
                lines.append(f"    name: 'Hero {n}',")
                lines.append(f"    relumeHeader: {relume},")
                lines.append(f"    alignment: '{align}',")
                lines.append(f"    background: '{bg}',")
                lines.append(f"    actions: '{act}',")
                lines.append(f"    hasTagline: {'true' if tagline else 'false'},")
                lines.append("}")
                lines.append("")

    lines.append("// ============================================")
    lines.append("// All presets in array (ordered 1\u201327)")
    lines.append("// ============================================")
    lines.append("")
    lines.append("export const ALL_HERO_PRESETS: HeroPresetConfig[] = [")
    for start, end, label in sections:
        comment = label.split("(")[0].strip()
        lines.append(f"    // {comment} ({start}\u2013{end})")
        for row_start in range(start, end + 1, 3):
            row = [f"HERO_{i}" for i in range(row_start, min(row_start + 3, end + 1))]
            lines.append(f"    {', '.join(row)},")
    lines.append("]")
    lines.append("")
    lines.append("/** Quick lookup by ID */")
    lines.append("export const HERO_PRESETS_MAP: Record<string, HeroPresetConfig> = Object.fromEntries(")
    lines.append("    ALL_HERO_PRESETS.map((p) => [p.id, p])")
    lines.append(")")
    lines.append("")
    return "\n".join(lines)


def gen_hero_layouts():
    lines = []
    lines.append("/**")
    lines.append(" * Hero Layout Components \u2014 27 wrapper components")
    lines.append(" *")
    lines.append(" * Each function generates a bound HeroSection component for a specific preset.")
    lines.append(" * These are the actual components registered in the layout registry.")
    lines.append(" */")
    lines.append("")
    lines.append("'use client'")
    lines.append("")
    lines.append("import { HeroSection } from './hero-section'")
    lines.append("import type { HeroSectionProps } from './hero-section'")
    lines.append("import type { HeroPresetConfig } from './types'")
    lines.append("import {")
    for i in range(1, 28):
        lines.append(f"    HERO_{i},")
    lines.append("} from './presets'")
    lines.append("")
    lines.append("// ============================================")
    lines.append("// Factory to create a preset-bound component")
    lines.append("// ============================================")
    lines.append("")
    lines.append("type HeroComponentProps = Omit<HeroSectionProps, 'alignment' | 'background' | 'actions'>")
    lines.append("")
    lines.append("function createHeroComponent(preset: HeroPresetConfig) {")
    lines.append("    function HeroComponent(props: HeroComponentProps) {")
    lines.append("        return (")
    lines.append("            <HeroSection")
    lines.append("                {...props}")
    lines.append("                alignment={preset.alignment}")
    lines.append("                background={preset.background}")
    lines.append("                actions={preset.actions}")
    lines.append("            />")
    lines.append("        )")
    lines.append("    }")
    lines.append("    HeroComponent.displayName = preset.name.replace(' ', '')")
    lines.append("    return HeroComponent")
    lines.append("}")
    lines.append("")

    sections = [
        (1, 9, "Left-aligned, single column"),
        (10, 18, "Split two-column"),
        (19, 27, "Center-aligned, single column"),
    ]

    for start, end, label in sections:
        lines.append("// ============================================")
        lines.append(f"// {label}")
        lines.append("// ============================================")
        lines.append("")
        for n, relume, align, bg, act, _ in PRESETS:
            if start <= n <= end:
                desc = f"{align.capitalize()} + {bg.capitalize()} + {act.capitalize()}"
                lines.append(f"/** {desc} */")
                lines.append(f"export const Hero{n} = createHeroComponent(HERO_{n})")
                lines.append("")
    return "\n".join(lines)


def gen_index():
    lines = []
    lines.append("/**")
    lines.append(" * Hero Layouts \u2014 Barrel export")
    lines.append(" *")
    lines.append(" * Exports all 27 hero layout components, preset configs, types,")
    lines.append(" * and the hero layout template registry.")
    lines.append(" */")
    lines.append("")
    lines.append("// Types")
    lines.append("export type {")
    lines.append("    HeroAlignment,")
    lines.append("    HeroBackground,")
    lines.append("    HeroActions,")
    lines.append("    HeroPresetConfig,")
    lines.append("    HeroContent,")
    lines.append("} from './types'")
    lines.append("export { DEFAULT_HERO_CONTENT } from './types'")
    lines.append("")
    lines.append("// Core composable component")
    lines.append("export { HeroSection } from './hero-section'")
    lines.append("export type { HeroSectionProps } from './hero-section'")
    lines.append("")
    lines.append("// Preset configs")
    lines.append("export {")
    for i in range(1, 28):
        lines.append(f"    HERO_{i},")
    lines.append("    ALL_HERO_PRESETS,")
    lines.append("    HERO_PRESETS_MAP,")
    lines.append("} from './presets'")
    lines.append("")
    lines.append("// 27 named layout components")
    lines.append("export {")
    for i in range(1, 28):
        lines.append(f"    Hero{i},")
    lines.append("} from './hero-layouts'")
    lines.append("")
    lines.append("// ============================================")
    lines.append("// Hero Layout Templates (for registry)")
    lines.append("// ============================================")
    lines.append("")
    lines.append("import type { LayoutTemplate } from '../types'")
    lines.append("import {")
    for i in range(1, 28):
        lines.append(f"    Hero{i},")
    lines.append("} from './hero-layouts'")
    lines.append("import { ALL_HERO_PRESETS } from './presets'")
    lines.append("")
    lines.append("/** Map preset config \u2192 component */")
    lines.append("const HERO_COMPONENTS: Record<string, React.ComponentType<{ sectionId: string; className?: string }>> = {")
    for i in range(1, 28):
        lines.append(f"    'hero-{i}': Hero{i},")
    lines.append("}")
    lines.append("")
    lines.append("function getDescription(alignment: string, background: string, actions: string): string {")
    lines.append("    const a = alignment === 'left' ? 'Left-aligned' : alignment === 'split' ? 'Split two-column' : 'Center-aligned'")
    lines.append("    const b = background === 'dark' ? 'dark background' : background === 'neutral' ? 'neutral background' : 'background image'")
    lines.append("    const c = actions === 'buttons' ? 'two buttons' : actions === 'form' ? 'email form' : 'text only'")
    lines.append("    return `${a}, ${b}, ${c}`")
    lines.append("}")
    lines.append("")
    lines.append("function getTags(alignment: string, background: string, actions: string): string[] {")
    lines.append("    return ['hero', alignment, background, actions]")
    lines.append("}")
    lines.append("")
    lines.append("/** All 27 hero LayoutTemplates, ready for the registry */")
    lines.append("export const HERO_LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_HERO_PRESETS.map((preset) => ({")
    lines.append("    id: preset.id,")
    lines.append("    name: preset.name,")
    lines.append("    category: 'hero' as const,")
    lines.append("    description: getDescription(preset.alignment, preset.background, preset.actions),")
    lines.append("    relumeId: `header-${preset.relumeHeader}`,")
    lines.append("    component: HERO_COMPONENTS[preset.id],")
    lines.append("    defaultBlocks: () => [],")
    lines.append("    tags: getTags(preset.alignment, preset.background, preset.actions),")
    lines.append("}))")
    lines.append("")
    lines.append("/** Quick lookup by layout ID */")
    lines.append("export const HERO_TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(")
    lines.append("    HERO_LAYOUT_TEMPLATES.map((t) => [t.id, t])")
    lines.append(")")
    lines.append("")
    return "\n".join(lines)


# Write all files
types_content = TYPES_CONTENT.replace("TERMS_PLACEHOLDER", TERMS)
(BASE / "types.ts").write_text(types_content)
print("types.ts done")

(BASE / "presets.ts").write_text(gen_presets())
print("presets.ts done")

(BASE / "hero-layouts.tsx").write_text(gen_hero_layouts())
print("hero-layouts.tsx done")

(BASE / "index.ts").write_text(gen_index())
print("index.ts done")

print("All 4 hero files rewritten with 1-27 numbering.")
