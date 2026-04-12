/**
 * Figma-Clone Variable System — Barrel Export
 *
 * Usage:
 *   import { Variable, resolveVariable, colorValueToHex } from '@/lib/variables'
 */

// Types
export type {
    VariableResolvedDataType,
    ColorValue,
    VariableAlias,
    RawVariableValue,
    VariableValue,
    Variable,
    VariableCollection,
    CodeSyntaxPlatform,
    VariableScope,
    VariableBindableNodeField,
    VariableBindableTextField,
    VariableBindableField,
    BoundVariables,
    ExplicitVariableModes,
} from './types'

// Type guards & constants
export {
    isVariableAlias,
    isColorValue,
    MAX_ALIAS_DEPTH,
    MAX_VARIABLES_PER_COLLECTION,
    MAX_MODES_PER_COLLECTION,
    MAX_MODE_NAME_LENGTH,
    FORBIDDEN_NAME_CHARS,
} from './types'

// Resolution engine
export {
    resolveVariable,
    resolveMode,
    resolveBoundVariable,
    resolveBoundVariableAtIndex,
    colorValueToHex,
    hexToColorValue,
    colorValueToRgba,
    wouldCreateCycle,
    getAliasChain,
} from './resolve'

// Render-time resolution (pure, no React)
export {
    resolveNodeBindings,
    resolveBoundColor,
    resolveBoundSimpleColor,
    resolveBoundNumber,
    resolveBoundString,
    resolveBoundBoolean,
    rawValueToColor,
} from './resolve-for-render'

// React hooks (for canvas components)
export {
    useResolvedVariables,
    useResolvedFillColor,
    useResolvedNumber,
    useResolvedString,
    useVariableDisplayValue,
} from './use-variables'
export type { ResolvedBindings } from './use-variables'

// Parser integration
export {
    buildVariableLinkMaps,
    normalizeHex as normalizeHexVar,
} from './build-link-maps'
export type { VariableLinkMaps } from './build-link-maps'

export { relinkNodesWithVariables } from './relink-nodes'
