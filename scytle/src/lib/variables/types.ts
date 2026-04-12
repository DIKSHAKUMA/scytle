/**
 * Figma-Clone Variable System — Type Definitions
 *
 * Mirrors Figma's variable architecture:
 *   VariableCollection -> Variable -> valuesByMode
 *   Nodes bind via boundVariables -> VariableAlias refs
 *
 * References:
 *   - https://developers.figma.com/docs/plugins/api/Variable/
 *   - https://developers.figma.com/docs/plugins/api/VariableCollection/
 *   - https://developers.figma.com/docs/plugins/api/VariableScope/
 */

// ============================================================
// Value Types
// ============================================================

/** The four fundamental variable types (after alias resolution) */
export type VariableResolvedDataType = 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING'

/**
 * Figma RGBA color value — all channels in 0-1 range.
 * NOT the same as CSS rgb (0-255) — conversion helpers in resolve.ts.
 */
export interface ColorValue {
    r: number  // 0-1
    g: number  // 0-1
    b: number  // 0-1
    a: number  // 0-1
}

/**
 * A value that references another variable instead of holding a raw value.
 * Discriminated by `type: 'VARIABLE_ALIAS'`.
 */
export interface VariableAlias {
    type: 'VARIABLE_ALIAS'
    id: string  // The referenced variable's ID
}

/** Concrete value (not an alias) */
export type RawVariableValue = boolean | ColorValue | number | string

/** A variable's value in a given mode — either raw or an alias */
export type VariableValue = RawVariableValue | VariableAlias

// ============================================================
// Variable & Collection
// ============================================================

/**
 * A named, typed container for reusable values.
 * Each variable belongs to exactly one VariableCollection and stores
 * one value per mode.
 *
 * Groups are encoded in the name using `/` as separator:
 *   "color/primary/500" -> group "color" > subgroup "primary" > variable "500"
 */
export interface Variable {
    id: string
    name: string  // "/" = group separator, no "." or "{" or "}"
    resolvedType: VariableResolvedDataType
    variableCollectionId: string
    valuesByMode: Record<string, VariableValue>  // modeId -> value
    scopes: VariableScope[]
    description: string
    codeSyntax: Partial<Record<CodeSyntaxPlatform, string>>
    hiddenFromPublishing: boolean
}

/**
 * Groups related variables that share the same set of modes.
 * Max 5,000 variables per collection, max 40 modes.
 */
export interface VariableCollection {
    id: string
    name: string
    modes: Array<{ modeId: string; name: string }>
    defaultModeId: string
    variableIds: string[]
    hiddenFromPublishing: boolean
}

// ============================================================
// Scoping
// ============================================================

/** Code syntax platform for developer handoff */
export type CodeSyntaxPlatform = 'WEB' | 'ANDROID' | 'iOS'

/**
 * Controls which UI pickers show a variable.
 * Does NOT enforce restrictions programmatically — purely UI filtering.
 *
 * New variables default to 'ALL_SCOPES'.
 */
export type VariableScope =
    // Universal
    | 'ALL_SCOPES'
    // Color scopes
    | 'ALL_FILLS'
    | 'FRAME_FILL'
    | 'SHAPE_FILL'
    | 'TEXT_FILL'
    | 'STROKE_COLOR'
    | 'EFFECT_COLOR'
    // Float scopes
    | 'CORNER_RADIUS'
    | 'WIDTH_HEIGHT'
    | 'GAP'
    | 'OPACITY'
    | 'STROKE_FLOAT'
    | 'EFFECT_FLOAT'
    | 'FONT_SIZE'
    | 'FONT_WEIGHT'
    | 'LINE_HEIGHT'
    | 'LETTER_SPACING'
    | 'PARAGRAPH_SPACING'
    | 'PARAGRAPH_INDENT'
    // String scopes
    | 'FONT_FAMILY'
    | 'FONT_STYLE'
    // Cross-type scope
    | 'TEXT_CONTENT'

// ============================================================
// Node Binding
// ============================================================

/**
 * All fields on nodes that can be bound to a variable.
 * Used for type safety when creating/reading bindings.
 */
export type VariableBindableNodeField =
    // Paint arrays (bound per-index)
    | 'fills'
    | 'strokes'
    | 'effects'
    // Dimensions
    | 'width'
    | 'height'
    | 'minWidth'
    | 'maxWidth'
    | 'minHeight'
    | 'maxHeight'
    // Opacity & visibility
    | 'opacity'
    | 'visible'
    // Corner radii
    | 'topLeftRadius'
    | 'topRightRadius'
    | 'bottomLeftRadius'
    | 'bottomRightRadius'
    // Auto-layout padding
    | 'paddingLeft'
    | 'paddingRight'
    | 'paddingTop'
    | 'paddingBottom'
    // Auto-layout spacing
    | 'itemSpacing'
    | 'counterAxisSpacing'
    // Stroke
    | 'strokeWeight'
    // Text content
    | 'characters'

/**
 * Text-specific bindable fields (per text range in Figma,
 * but we treat as whole-node for now).
 */
export type VariableBindableTextField =
    | 'fontFamily'
    | 'fontSize'
    | 'fontWeight'
    | 'fontStyle'
    | 'letterSpacing'
    | 'lineHeight'
    | 'paragraphSpacing'
    | 'paragraphIndent'

/** Union of all bindable fields */
export type VariableBindableField = VariableBindableNodeField | VariableBindableTextField

/**
 * The boundVariables object that lives on every node.
 *
 * Simple properties (width, opacity, etc.) map to a single VariableAlias.
 * Array properties (fills, strokes, effects) map to VariableAlias[] where
 * the index matches the paint/effect array index.
 *
 * Example:
 * ```
 * {
 *   width: { type: 'VARIABLE_ALIAS', id: 'var:1' },
 *   fills: [{ type: 'VARIABLE_ALIAS', id: 'var:2' }],
 *   fontFamily: { type: 'VARIABLE_ALIAS', id: 'var:3' },
 * }
 * ```
 */
export interface BoundVariables {
    [field: string]: VariableAlias | VariableAlias[] | undefined
}

/**
 * Per-collection mode overrides on frames.
 * When a frame sets an explicit mode for a collection, all descendants
 * inherit that mode (unless they set their own override).
 *
 * Maps collectionId -> modeId.
 */
export type ExplicitVariableModes = Record<string, string>

// ============================================================
// Type Guards
// ============================================================

/** Check if a VariableValue is an alias (not a raw value) */
export function isVariableAlias(value: VariableValue): value is VariableAlias {
    return (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        (value as VariableAlias).type === 'VARIABLE_ALIAS'
    )
}

/** Check if a value is a ColorValue */
export function isColorValue(value: unknown): value is ColorValue {
    return (
        typeof value === 'object' &&
        value !== null &&
        'r' in value &&
        'g' in value &&
        'b' in value &&
        'a' in value &&
        !('type' in value)  // Exclude VariableAlias
    )
}

// ============================================================
// Constants
// ============================================================

/** Maximum alias chain depth before we bail (prevents infinite loops) */
export const MAX_ALIAS_DEPTH = 100

/** Maximum variables per collection */
export const MAX_VARIABLES_PER_COLLECTION = 5000

/** Maximum modes per collection */
export const MAX_MODES_PER_COLLECTION = 40

/** Maximum mode name length */
export const MAX_MODE_NAME_LENGTH = 40

/** Characters forbidden in variable names */
export const FORBIDDEN_NAME_CHARS = /[.{}]/
