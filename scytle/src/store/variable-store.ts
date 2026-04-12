/**
 * Variable Store — Zustand store for the Figma-clone variable system.
 *
 * Holds all VariableCollections and Variables in memory.
 * Provides CRUD operations + loadVariables() for receiving AI-generated variables.
 *
 * Pattern: Zustand + immer + subscribeWithSelector (same as style-guide-store)
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import { enableMapSet } from 'immer'
import { generateId } from '@/lib/utils'

// Enable Immer's MapSet plugin so we can use Map/Set in state
enableMapSet()

import type {
    Variable,
    VariableCollection,
    VariableResolvedDataType,
    VariableValue,
    VariableScope,
    CodeSyntaxPlatform,
    ColorValue,
} from '@/lib/variables/types'
import {
    isVariableAlias,
    MAX_VARIABLES_PER_COLLECTION,
    MAX_MODES_PER_COLLECTION,
    MAX_MODE_NAME_LENGTH,
    FORBIDDEN_NAME_CHARS,
} from '@/lib/variables/types'
import { wouldCreateCycle } from '@/lib/variables/resolve'

// ============================================
// ID Generation Helpers
// ============================================

function varId(): string {
    return `var:${generateId()}`
}

function colId(): string {
    return `col:${generateId()}`
}

function modeId(): string {
    return `mode:${generateId()}`
}

// ============================================
// Default Values per Type
// ============================================

function defaultValueForType(type: VariableResolvedDataType): boolean | ColorValue | number | string {
    switch (type) {
        case 'BOOLEAN': return false
        case 'COLOR': return { r: 0, g: 0, b: 0, a: 1 } satisfies ColorValue
        case 'FLOAT': return 0
        case 'STRING': return ''
    }
}

// ============================================
// Store State Interface
// ============================================

export interface VariableStoreState {
    // ---- Data ----
    collections: Map<string, VariableCollection>
    variables: Map<string, Variable>

    // ---- Active UI State ----
    activeCollectionId: string | null
    activeModeId: string | null

    // ---- Actions: Collection CRUD ----
    createCollection: (name: string) => VariableCollection
    deleteCollection: (id: string) => void
    renameCollection: (id: string, name: string) => void

    // ---- Actions: Mode CRUD ----
    addMode: (collectionId: string, name: string) => string
    deleteMode: (collectionId: string, modeId: string) => void
    renameMode: (collectionId: string, modeId: string, name: string) => void

    // ---- Actions: Variable CRUD ----
    createVariable: (name: string, collectionId: string, type: VariableResolvedDataType) => Variable
    deleteVariable: (id: string) => void
    renameVariable: (id: string, name: string) => void
    setValueForMode: (variableId: string, modeId: string, value: VariableValue) => void
    setScopes: (variableId: string, scopes: VariableScope[]) => void
    setDescription: (variableId: string, description: string) => void
    setCodeSyntax: (variableId: string, platform: CodeSyntaxPlatform, syntax: string) => void

    // ---- Actions: Alias Management ----
    createAlias: (variableId: string, modeId: string, targetVariableId: string) => void
    detachAlias: (variableId: string, modeId: string) => void

    // ---- Actions: Bulk Operations ----
    /** Load variables from AI output — replaces all existing variables */
    loadVariables: (data: { collections: VariableCollection[]; variables: Variable[] }) => void
    /** Clear all collections and variables */
    clearAll: () => void

    // ---- Actions: UI State ----
    setActiveCollectionId: (id: string | null) => void
    setActiveModeId: (id: string | null) => void

    // ---- Getters (non-reactive, call on snapshot) ----
    getVariable: (id: string) => Variable | undefined
    getCollection: (id: string) => VariableCollection | undefined
    getVariablesByCollection: (collectionId: string) => Variable[]
    getVariablesForScope: (scope: VariableScope, type: VariableResolvedDataType) => Variable[]
    findVariableByName: (name: string, collectionId?: string) => Variable | undefined
}

// ============================================
// Store Implementation
// ============================================

export const useVariableStore = create<VariableStoreState>()(
    subscribeWithSelector(
        immer((set, get) => ({
            // ---- Initial State ----
            collections: new Map(),
            variables: new Map(),
            activeCollectionId: null,
            activeModeId: null,

            // ============================================
            // Collection CRUD
            // ============================================

            createCollection: (name: string) => {
                const id = colId()
                const defaultMode = modeId()
                const collection: VariableCollection = {
                    id,
                    name,
                    modes: [{ modeId: defaultMode, name: 'Mode 1' }],
                    defaultModeId: defaultMode,
                    variableIds: [],
                    hiddenFromPublishing: false,
                }
                set((state) => {
                    state.collections.set(id, collection)
                    // Auto-select if first collection
                    if (!state.activeCollectionId) {
                        state.activeCollectionId = id
                        state.activeModeId = defaultMode
                    }
                })
                return collection
            },

            deleteCollection: (id: string) => {
                set((state) => {
                    const collection = state.collections.get(id)
                    if (!collection) return

                    // Delete all variables in this collection
                    for (const varId of collection.variableIds) {
                        state.variables.delete(varId)
                    }

                    state.collections.delete(id)

                    // Update active selection
                    if (state.activeCollectionId === id) {
                        const remaining = Array.from(state.collections.keys())
                        state.activeCollectionId = remaining[0] ?? null
                        if (state.activeCollectionId) {
                            const col = state.collections.get(state.activeCollectionId)
                            state.activeModeId = col?.defaultModeId ?? null
                        } else {
                            state.activeModeId = null
                        }
                    }
                })
            },

            renameCollection: (id: string, name: string) => {
                set((state) => {
                    const collection = state.collections.get(id)
                    if (collection) collection.name = name
                })
            },

            // ============================================
            // Mode CRUD
            // ============================================

            addMode: (collectionId: string, name: string) => {
                const id = modeId()
                const truncatedName = name.slice(0, MAX_MODE_NAME_LENGTH)

                set((state) => {
                    const collection = state.collections.get(collectionId)
                    if (!collection) return
                    if (collection.modes.length >= MAX_MODES_PER_COLLECTION) return

                    collection.modes.push({ modeId: id, name: truncatedName })

                    // Add default values for all variables in this collection
                    for (const varId of collection.variableIds) {
                        const variable = state.variables.get(varId)
                        if (variable) {
                            variable.valuesByMode[id] = defaultValueForType(variable.resolvedType)
                        }
                    }
                })

                return id
            },

            deleteMode: (collectionId: string, targetModeId: string) => {
                set((state) => {
                    const collection = state.collections.get(collectionId)
                    if (!collection) return
                    // Must keep at least one mode
                    if (collection.modes.length <= 1) return

                    collection.modes = collection.modes.filter(m => m.modeId !== targetModeId)

                    // Update default if we deleted it
                    if (collection.defaultModeId === targetModeId) {
                        collection.defaultModeId = collection.modes[0].modeId
                    }

                    // Remove mode values from all variables
                    for (const varId of collection.variableIds) {
                        const variable = state.variables.get(varId)
                        if (variable) {
                            delete variable.valuesByMode[targetModeId]
                        }
                    }

                    // Update active mode if needed
                    if (state.activeModeId === targetModeId) {
                        state.activeModeId = collection.defaultModeId
                    }
                })
            },

            renameMode: (collectionId: string, targetModeId: string, name: string) => {
                set((state) => {
                    const collection = state.collections.get(collectionId)
                    if (!collection) return
                    const mode = collection.modes.find(m => m.modeId === targetModeId)
                    if (mode) mode.name = name.slice(0, MAX_MODE_NAME_LENGTH)
                })
            },

            // ============================================
            // Variable CRUD
            // ============================================

            createVariable: (name: string, collectionId: string, type: VariableResolvedDataType) => {
                const id = varId()

                // Validate name
                const cleanName = name.replace(FORBIDDEN_NAME_CHARS, '')

                const state = get()
                const collection = state.collections.get(collectionId)

                // Build valuesByMode with defaults
                const valuesByMode: Record<string, VariableValue> = {}
                if (collection) {
                    for (const mode of collection.modes) {
                        valuesByMode[mode.modeId] = defaultValueForType(type)
                    }
                }

                const variable: Variable = {
                    id,
                    name: cleanName,
                    resolvedType: type,
                    variableCollectionId: collectionId,
                    valuesByMode,
                    scopes: ['ALL_SCOPES'],
                    description: '',
                    codeSyntax: {},
                    hiddenFromPublishing: false,
                }

                set((state) => {
                    const col = state.collections.get(collectionId)
                    if (!col) return
                    if (col.variableIds.length >= MAX_VARIABLES_PER_COLLECTION) return

                    state.variables.set(id, variable)
                    col.variableIds.push(id)
                })

                return variable
            },

            deleteVariable: (id: string) => {
                set((state) => {
                    const variable = state.variables.get(id)
                    if (!variable) return

                    // Remove from collection
                    const collection = state.collections.get(variable.variableCollectionId)
                    if (collection) {
                        collection.variableIds = collection.variableIds.filter(v => v !== id)
                    }

                    // Clean up any aliases pointing to this variable
                    for (const [, v] of state.variables) {
                        for (const [modeId, value] of Object.entries(v.valuesByMode)) {
                            if (isVariableAlias(value) && value.id === id) {
                                // Detach — replace alias with default value
                                v.valuesByMode[modeId] = defaultValueForType(v.resolvedType)
                            }
                        }
                    }

                    state.variables.delete(id)
                })
            },

            renameVariable: (id: string, name: string) => {
                set((state) => {
                    const variable = state.variables.get(id)
                    if (variable) {
                        variable.name = name.replace(FORBIDDEN_NAME_CHARS, '')
                    }
                })
            },

            setValueForMode: (variableId: string, targetModeId: string, value: VariableValue) => {
                set((state) => {
                    const variable = state.variables.get(variableId)
                    if (variable) {
                        variable.valuesByMode[targetModeId] = value
                    }
                })
            },

            setScopes: (variableId: string, scopes: VariableScope[]) => {
                set((state) => {
                    const variable = state.variables.get(variableId)
                    if (variable) variable.scopes = scopes
                })
            },

            setDescription: (variableId: string, description: string) => {
                set((state) => {
                    const variable = state.variables.get(variableId)
                    if (variable) variable.description = description
                })
            },

            setCodeSyntax: (variableId: string, platform: CodeSyntaxPlatform, syntax: string) => {
                set((state) => {
                    const variable = state.variables.get(variableId)
                    if (variable) variable.codeSyntax[platform] = syntax
                })
            },

            // ============================================
            // Alias Management
            // ============================================

            createAlias: (variableId: string, targetModeId: string, targetVariableId: string) => {
                set((state) => {
                    const source = state.variables.get(variableId)
                    const target = state.variables.get(targetVariableId)
                    if (!source || !target) return

                    // Type must match
                    if (source.resolvedType !== target.resolvedType) return

                    // No cycles
                    if (wouldCreateCycle(variableId, targetVariableId, targetModeId, state.variables)) return

                    source.valuesByMode[targetModeId] = {
                        type: 'VARIABLE_ALIAS',
                        id: targetVariableId,
                    }
                })
            },

            detachAlias: (variableId: string, targetModeId: string) => {
                // TODO: In the future, resolve the alias chain and store the raw value.
                // For now, replace with default value.
                set((state) => {
                    const variable = state.variables.get(variableId)
                    if (!variable) return

                    const value = variable.valuesByMode[targetModeId]
                    if (value && isVariableAlias(value)) {
                        variable.valuesByMode[targetModeId] = defaultValueForType(variable.resolvedType)
                    }
                })
            },

            // ============================================
            // Bulk Operations
            // ============================================

            loadVariables: (data) => {
                set((state) => {
                    // Clear existing
                    state.collections.clear()
                    state.variables.clear()

                    // Load collections
                    for (const col of data.collections) {
                        state.collections.set(col.id, col)
                    }

                    // Load variables
                    for (const v of data.variables) {
                        state.variables.set(v.id, v)
                    }

                    // Set active to first collection
                    if (data.collections.length > 0) {
                        state.activeCollectionId = data.collections[0].id
                        state.activeModeId = data.collections[0].defaultModeId
                    } else {
                        state.activeCollectionId = null
                        state.activeModeId = null
                    }
                })
            },

            clearAll: () => {
                set((state) => {
                    state.collections.clear()
                    state.variables.clear()
                    state.activeCollectionId = null
                    state.activeModeId = null
                })
            },

            // ============================================
            // UI State
            // ============================================

            setActiveCollectionId: (id) => {
                set((state) => {
                    state.activeCollectionId = id
                    if (id) {
                        const col = state.collections.get(id)
                        state.activeModeId = col?.defaultModeId ?? null
                    }
                })
            },

            setActiveModeId: (id) => {
                set((state) => {
                    state.activeModeId = id
                })
            },

            // ============================================
            // Getters (read from current snapshot)
            // ============================================

            getVariable: (id: string) => {
                return get().variables.get(id)
            },

            getCollection: (id: string) => {
                return get().collections.get(id)
            },

            getVariablesByCollection: (collectionId: string) => {
                const state = get()
                const collection = state.collections.get(collectionId)
                if (!collection) return []
                return collection.variableIds
                    .map(id => state.variables.get(id))
                    .filter((v): v is Variable => v !== undefined)
            },

            getVariablesForScope: (scope: VariableScope, type: VariableResolvedDataType) => {
                const state = get()
                const results: Variable[] = []
                for (const [, variable] of state.variables) {
                    if (variable.resolvedType !== type) continue
                    if (
                        variable.scopes.includes('ALL_SCOPES') ||
                        variable.scopes.includes(scope)
                    ) {
                        results.push(variable)
                    }
                }
                return results
            },

            findVariableByName: (name: string, collectionId?: string) => {
                const state = get()
                for (const [, variable] of state.variables) {
                    if (variable.name !== name) continue
                    if (collectionId && variable.variableCollectionId !== collectionId) continue
                    return variable
                }
                return undefined
            },
        }))
    )
)
