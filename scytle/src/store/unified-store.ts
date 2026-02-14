/**
 * Unified Store - Single Source of Truth for Sitemap & Wireframe
 * 
 * This store holds all page/section data. Both sitemap view (ReactFlow)
 * and wireframe view read from this same store, ensuring they stay in sync.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react'
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import type {
    WireframeSection,
    WireframeSectionContent,
    WireframeSectionControls,
    ViewportMode,
    ViewportDevice,
    DeviceVisibility,
    PageContext,
    PageLayout,
} from '@/types'
import { getDesignById, getFamilyById, getPresetById } from '@/lib/designs'
import { createJWT } from '@/lib/appwrite'

// ============================================
// Type Definitions
// ============================================

export type CanvasTool = 'select' | 'hand' | 'add'

/**
 * Unified Page - Single source of truth for both views
 */
export interface UnifiedPage {
    // Identity
    id: string
    name: string
    slug: string
    description?: string

    // Hierarchy
    parentId: string | null
    order: number

    // Page context (SaaS expansion)
    /** marketing (stacked), application (app-shell), or auth (centered) */
    pageContext: PageContext
    /** Layout mode derived from context */
    pageLayout: PageLayout

    // Sitemap position (for ReactFlow)
    position: { x: number; y: number }

    // Content (for Wireframe)
    sections: WireframeSection[]
}

/**
 * AI-generated page structure from sitemap generation
 */
export interface AIGeneratedPage {
    id: string
    label: string
    slug: string
    sections: Array<string | { id?: string; name: string; description?: string }>
    children?: AIGeneratedPage[]
}

// Layout constants
export const LAYOUT = {
    NODE_WIDTH: 280,
    NODE_BASE_HEIGHT: 60,
    SECTION_HEIGHT: 50,
    SECTION_GAP_HEIGHT: 12,
    HORIZONTAL_GAP: 100,
    VERTICAL_GAP: 120,
    PROJECT_HEIGHT: 50,
    ADD_SECTION_BUTTON_HEIGHT: 40,
    DROP_GAP_SIZE: 60, // Gap size when showing drop indicator
    MAX_NESTING_DEPTH: 3, // Maximum hierarchy depth (Project -> Page -> Subpage -> Detail)
}

// ============================================
// Drag & Drop Types
// ============================================

/**
 * Drop zone types for page drag and drop
 */
export type DropZoneType = 'before' | 'after' | 'child'

/**
 * Active drop zone - where the page will be dropped
 */
export interface DropZone {
    type: DropZoneType
    targetPageId: string // The page this drop zone is relative to
    parentId: string | null // The parent the dropped page will have
    order: number // The order position among siblings
}

/**
 * Drag state for page reordering
 */
export interface PageDragState {
    isDragging: boolean
    draggedPageId: string | null
    activeDropZone: DropZone | null
    draggedPageDepth: number // Current depth of dragged page's subtree
}

// ============================================
// Helper Functions
// ============================================

// Default preset IDs per section type — must match actual preset IDs in the design registry.
// These are resolved by PlaceholderRenderer via getPresetById → getFamilyById pipeline.
const DEFAULT_COMPONENT_IDS: Record<string, string> = {
    // Marketing defaults
    hero: 'hero-split',
    features: 'features-grid-3col',
    testimonials: 'testimonials-cards-3',
    pricing: 'pricing-cards-3tier',
    faq: 'faq-accordion-centered',
    cta: 'cta-banner-centered',
    contact: 'contact-split-default',
    team: 'team-1',
    about: 'content-3',
    stats: 'stats-1',
    logos: 'logos-1',
    gallery: 'gallery-1',
    'blog-list': 'blog-1',
    blog: 'blog-1',
    footer: 'footer-columns-4',
    navbar: 'navbar-standard-default',
    content: 'content-1',
    // Application defaults (SaaS) — placeholder IDs until families are built
    dashboard: 'stat-cards',
    'data-table': 'table-standard',
    'app-list': 'list-stacked',
    chart: 'chart-bar',
    'app-form': 'form-profile',
    'empty-state': 'empty-state-default',
    // Auth defaults
    auth: 'auth-login',
}

// Infer section type from name
function inferSectionType(name: string): string {
    const lowerName = name.toLowerCase()

    // Marketing section types
    if (lowerName.includes('hero') || lowerName.includes('header')) return 'hero'
    if (lowerName.includes('feature')) return 'features'
    if (lowerName.includes('testimonial') || lowerName.includes('review')) return 'testimonials'
    if (lowerName.includes('pricing')) return 'pricing'
    if (lowerName.includes('faq') || lowerName.includes('question')) return 'faq'
    if (lowerName.includes('cta') || lowerName.includes('call')) return 'cta'
    if (lowerName.includes('contact')) return 'contact'
    if (lowerName.includes('team')) return 'team'
    if (lowerName.includes('about')) return 'about'
    if (lowerName.includes('stat') || lowerName.includes('number')) return 'stats'
    if (lowerName.includes('logo') || lowerName.includes('partner')) return 'logos'
    if (lowerName.includes('gallery')) return 'gallery'
    if (lowerName.includes('blog')) return 'blog-list'
    if (lowerName.includes('footer')) return 'footer'
    if (lowerName.includes('nav')) return 'navbar'

    // Application section types (SaaS)
    if (lowerName.includes('dashboard') || lowerName.includes('overview') || lowerName.includes('metrics') || lowerName.includes('kpi')) return 'dashboard'
    if (lowerName.includes('table') || lowerName.includes('records') || lowerName.includes('list view')) return 'data-table'
    if (lowerName.includes('list') || lowerName.includes('grid') || lowerName.includes('directory') || lowerName.includes('people') || lowerName.includes('team members')) return 'app-list'
    if (lowerName.includes('chart') || lowerName.includes('analytics') || lowerName.includes('graph') || lowerName.includes('report')) return 'chart'
    if (lowerName.includes('form') || lowerName.includes('settings') || lowerName.includes('preferences') || lowerName.includes('profile') || lowerName.includes('account') || lowerName.includes('payment')) return 'app-form'
    if (lowerName.includes('empty') || lowerName.includes('getting started') || lowerName.includes('zero')) return 'empty-state'

    // Auth section types
    if (lowerName.includes('login') || lowerName.includes('sign in') || lowerName.includes('sign up') || lowerName.includes('register') || lowerName.includes('forgot') || lowerName.includes('verify') || lowerName.includes('onboarding')) return 'auth'

    return 'content'
}

/**
 * Infer the page context from page name and slug.
 * Used when AI doesn't provide context explicitly.
 */
export function inferPageContext(name: string, slug: string): PageContext {
    const lower = `${name} ${slug}`.toLowerCase()

    // Auth pages
    if (/\b(login|log-in|signin|sign-in|signup|sign-up|register|forgot-password|reset-password|verify|verification)\b/.test(lower)) {
        return 'auth'
    }

    // Application pages
    if (/\b(dashboard|app|admin|settings|analytics|projects|orders|account|profile|billing|reports|users|members|inventory|inbox|notifications|tasks|calendar|workspace)\b/.test(lower)) {
        return 'application'
    }

    return 'marketing'
}

/**
 * Derive the page layout from the page context.
 */
export function inferPageLayout(context: PageContext): PageLayout {
    switch (context) {
        case 'application': return 'app-shell'
        case 'auth': return 'centered'
        case 'marketing':
        default: return 'stacked'
    }
}

// Create a WireframeSection from raw data.
// Resolves the preset from the design registry to initialize with real content and controls,
// so sections render with actual pre-designed layouts instead of empty placeholders.
function createSection(
    data: string | { id?: string; name: string; description?: string },
    index: number
): WireframeSection {
    const isString = typeof data === 'string'
    const name = isString ? data : data.name
    const description = isString ? undefined : data.description
    const id = isString ? `section-${Date.now()}-${index}` : (data.id || `section-${Date.now()}-${index}`)

    const sectionType = inferSectionType(name)
    const componentId = DEFAULT_COMPONENT_IDS[sectionType] || `${sectionType}-1`

    // Resolve preset → family to get real content and controls
    const preset = getPresetById(componentId)
    const family = preset ? getFamilyById(preset.familyId) : getFamilyById(componentId)

    const resolvedContent = family
        ? { ...family.defaultContent, ...(preset?.content ?? {}), heading: name, subheading: description }
        : { heading: name, subheading: description }

    const resolvedControls = family
        ? { ...family.defaultControls, ...(preset?.controls ?? {}) }
        : {}

    return {
        id,
        type: sectionType,
        name,
        description,
        componentId,
        isGlobal: sectionType === 'navbar' || sectionType === 'footer',
        order: index,
        content: resolvedContent as WireframeSectionContent,
        controls: resolvedControls as WireframeSectionControls,
    }
}

// Calculate node height based on sections
export function calculateNodeHeight(sections: WireframeSection[]): number {
    if (sections.length === 0) {
        return LAYOUT.NODE_BASE_HEIGHT + LAYOUT.ADD_SECTION_BUTTON_HEIGHT
    }
    const sectionsHeight = sections.length * LAYOUT.SECTION_HEIGHT
    const gapsHeight = Math.max(0, sections.length - 1) * LAYOUT.SECTION_GAP_HEIGHT
    return LAYOUT.NODE_BASE_HEIGHT + sectionsHeight + gapsHeight + LAYOUT.ADD_SECTION_BUTTON_HEIGHT
}

// Calculate tree layout positions
// Layout: Project -> Home -> [Other root pages + Home's children]
function calculateTreeLayout(
    pages: UnifiedPage[],
    projectName: string
): { pages: UnifiedPage[]; projectPosition: { x: number; y: number } } {
    if (pages.length === 0) {
        return { pages: [], projectPosition: { x: 600, y: 50 } }
    }

    // Build parent-children map
    const childrenMap: Record<string, string[]> = {}
    const pageMap: Record<string, UnifiedPage> = {}

    pages.forEach(page => {
        pageMap[page.id] = page
        childrenMap[page.id] = []
    })

    pages.forEach(page => {
        if (page.parentId && childrenMap[page.parentId]) {
            childrenMap[page.parentId].push(page.id)
        }
    })

    // Sort children by order
    Object.keys(childrenMap).forEach(parentId => {
        childrenMap[parentId].sort((a, b) => {
            const pageA = pageMap[a]
            const pageB = pageMap[b]
            return (pageA?.order ?? 0) - (pageB?.order ?? 0)
        })
    })

    // Find the home page (slug "/" or id "home")
    const homePage = pages.find(p => p.slug === '/' || p.id === 'home') || pages[0]
    const homeId = homePage?.id

    // Find root pages (no parent) - excluding home
    const rootPages = pages.filter(p => !p.parentId || p.parentId === 'project')
    const otherRootPages = rootPages.filter(p => p.id !== homeId)
    otherRootPages.sort((a, b) => a.order - b.order)

    // Home's direct children (pages with parentId === homeId)
    const homeChildren = childrenMap[homeId] || []

    // For layout purposes, treat other root pages as siblings of home's children
    // They all appear below home
    const allHomeChildren = [...otherRootPages.map(p => p.id), ...homeChildren]

    // Calculate subtree widths (recursive)
    const subtreeWidth: Record<string, number> = {}

    const calcWidth = (pageId: string, isOtherRoot: boolean = false): number => {
        // Get explicit children (pages with parentId === pageId)
        const explicitChildren = childrenMap[pageId] || []

        // For home, also include other root pages as visual children
        const visualChildren = pageId === homeId
            ? [...otherRootPages.map(p => p.id), ...explicitChildren]
            : explicitChildren

        if (visualChildren.length === 0) {
            subtreeWidth[pageId] = LAYOUT.NODE_WIDTH
            return LAYOUT.NODE_WIDTH
        }

        const childWidths = visualChildren.map(id => {
            // Other root pages are treated as children of home for layout
            const isChildOtherRoot = otherRootPages.some(p => p.id === id)
            return calcWidth(id, isChildOtherRoot)
        })
        const total = childWidths.reduce((sum, w) => sum + w, 0) +
            (visualChildren.length - 1) * LAYOUT.HORIZONTAL_GAP
        subtreeWidth[pageId] = Math.max(LAYOUT.NODE_WIDTH, total)
        return subtreeWidth[pageId]
    }

    // Calculate widths starting from home
    if (homePage) {
        calcWidth(homeId)
    }

    // Position pages
    const positions: Record<string, { x: number; y: number }> = {}
    const centerX = 600

    const positionPage = (pageId: string, centerX: number, y: number, isOtherRoot: boolean = false) => {
        const page = pageMap[pageId]
        if (!page) return

        positions[pageId] = {
            x: centerX - LAYOUT.NODE_WIDTH / 2,
            y
        }

        // Get explicit children
        const explicitChildren = childrenMap[pageId] || []

        // For home, also include other root pages as visual children
        const visualChildren = pageId === homeId
            ? [...otherRootPages.map(p => p.id), ...explicitChildren]
            : explicitChildren

        if (visualChildren.length === 0) return

        const pageHeight = calculateNodeHeight(page.sections)
        const childY = y + pageHeight + LAYOUT.VERTICAL_GAP

        const totalChildWidth = visualChildren.reduce((sum, id) => sum + (subtreeWidth[id] || LAYOUT.NODE_WIDTH), 0) +
            (visualChildren.length - 1) * LAYOUT.HORIZONTAL_GAP

        let childCenterX = centerX - totalChildWidth / 2

        visualChildren.forEach(childId => {
            const childWidth = subtreeWidth[childId] || LAYOUT.NODE_WIDTH
            const isChildOtherRoot = otherRootPages.some(p => p.id === childId)
            positionPage(childId, childCenterX + childWidth / 2, childY, isChildOtherRoot)
            childCenterX += childWidth + LAYOUT.HORIZONTAL_GAP
        })
    }

    // Position home page below project
    const homeStartY = 50 + LAYOUT.PROJECT_HEIGHT + LAYOUT.VERTICAL_GAP
    if (homePage) {
        positionPage(homeId, centerX, homeStartY)
    }

    // Apply positions
    const positionedPages = pages.map(page => ({
        ...page,
        position: positions[page.id] || page.position
    }))

    return {
        pages: positionedPages,
        projectPosition: { x: centerX - LAYOUT.NODE_WIDTH / 2, y: 50 }
    }
}

// Convert AI pages to UnifiedPages (flatten hierarchy)
function flattenAIPages(
    aiPages: AIGeneratedPage[],
    parentId: string | null = null,
    order: number = 0
): UnifiedPage[] {
    const result: UnifiedPage[] = []

    aiPages.forEach((aiPage, index) => {
        const sections = aiPage.sections.map((s, i) => createSection(s, i))

        const pageContext = inferPageContext(aiPage.label, aiPage.slug)
        const pageLayout = inferPageLayout(pageContext)

        const page: UnifiedPage = {
            id: aiPage.id,
            name: aiPage.label,
            slug: aiPage.slug,
            parentId,
            order: order + index,
            pageContext,
            pageLayout,
            position: { x: 0, y: 0 }, // Will be calculated by layout
            sections,
        }

        result.push(page)

        if (aiPage.children && aiPage.children.length > 0) {
            const childPages = flattenAIPages(aiPage.children, aiPage.id, 0)
            result.push(...childPages)
        }
    })

    return result
}

// Convert UnifiedPages to ReactFlow nodes
function pagesToNodes(pages: UnifiedPage[], projectName: string): Node[] {
    const nodes: Node[] = [
        {
            id: 'project',
            type: 'project',
            position: { x: 600 - LAYOUT.NODE_WIDTH / 2, y: 50 },
            data: { label: projectName },
            draggable: false, // Project node should not be draggable
        }
    ]

    pages.forEach(page => {
        nodes.push({
            id: page.id,
            type: 'page',
            position: page.position,
            data: {
                label: page.name,
                slug: page.slug,
                sections: page.sections.map(s => ({
                    id: s.id,
                    name: s.name,
                    description: s.description,
                })),
            },
            // Page nodes are draggable for reparenting
        })
    })

    return nodes
}

// Generate edges from page hierarchy
function pagesToEdges(pages: UnifiedPage[]): Edge[] {
    const edges: Edge[] = []

    // Find the home page (first page or page with slug "/")
    const homePage = pages.find(p => p.slug === '/' || p.id === 'home') || pages[0]
    const homeId = homePage?.id

    // Root pages (no parentId)
    const rootPages = pages.filter(p => !p.parentId)

    // Home page connects to project
    if (homePage) {
        edges.push({
            id: `e-project-${homeId}`,
            source: 'project',
            target: homeId,
            type: 'sitemap',
        })
    }

    // Other root pages connect to home (not project)
    rootPages.forEach(page => {
        if (page.id !== homeId) {
            edges.push({
                id: `e-${homeId}-${page.id}`,
                source: homeId,
                target: page.id,
                type: 'sitemap',
            })
        }
    })

    // Child pages connect to their parents
    pages.forEach(page => {
        if (page.parentId) {
            edges.push({
                id: `e-${page.parentId}-${page.id}`,
                source: page.parentId,
                target: page.id,
                type: 'sitemap',
            })
        }
    })

    return edges
}

// ============================================
// Store Interface
// ============================================

interface UnifiedState {
    // Core Data
    projectId: string | null
    projectName: string
    pages: UnifiedPage[]

    // Derived for ReactFlow (computed from pages)
    nodes: Node[]
    edges: Edge[]

    // Sitemap UI State
    activeTool: CanvasTool
    zoomLevel: number
    selectedNodeId: string | null
    isPanning: boolean

    // Section picker state (sitemap view)
    sectionPickerOpen: boolean
    sectionPickerTargetPageId: string | null
    sectionPickerInsertIndex: number | null

    // Page drag & drop state (sitemap view)
    pageDrag: PageDragState

    // Wireframe UI State
    wireframePanOffset: { x: number; y: number }
    wireframeHasInitialFit: boolean
    selectedPageId: string | null
    selectedSectionId: string | null
    viewportMode: ViewportMode
    deviceVisibility: DeviceVisibility
    /** Active viewports shown per page (Figma Sites style) */
    activeViewports: ViewportDevice[]
    activePanelView: 'page' | 'section' | 'library' | null

    // Add section sidebar state (wireframe view)
    isAddSidebarOpen: boolean
    addSidebarPageId: string
    addSidebarInsertIndex: number

    // Ghost preview state
    ghostPreviewLayout: {
        type: string
        variant?: string
        name: string
        /** Preset ID for direct design registry lookup */
        presetId?: string
    } | null

    // History for undo/redo
    history: UnifiedPage[][]
    historyIndex: number
    maxHistoryLength: number

    // Persistence
    isSaving: boolean
    isDirty: boolean
    lastSavedAt: Date | null

    // ReactFlow instance refs
    reactFlowZoom: ((zoom: number) => void) | null
    reactFlowFitView: (() => void) | null

    // ============================================
    // Actions - Project
    // ============================================
    setProjectId: (id: string | null) => void
    setProjectName: (name: string) => void

    // ============================================
    // Actions - Data Loading
    // ============================================
    loadFromAI: (aiPages: AIGeneratedPage[], projectName?: string, options?: { skipSave?: boolean }) => void
    loadFromJSON: (json: string) => void
    syncFromSitemap: (nodes: Node[], edges: Edge[]) => void
    reset: () => void

    // ============================================
    // Actions - Pages
    // ============================================
    addPage: (page: Partial<UnifiedPage>, parentId?: string | null) => string
    addChildPage: (parentId: string) => string
    updatePage: (pageId: string, updates: Partial<UnifiedPage>) => void
    deletePage: (pageId: string) => void
    renamePage: (pageId: string, name: string) => void
    reparentPage: (pageId: string, newParentId: string | null) => void
    movePage: (pageId: string, dropZone: DropZone) => void

    // ============================================
    // Actions - Page Drag & Drop
    // ============================================
    startPageDrag: (pageId: string) => void
    updateDropZone: (dropZone: DropZone | null) => void
    endPageDrag: () => void
    cancelPageDrag: () => void
    isValidDropZone: (pageId: string, dropZone: DropZone) => boolean
    getPageDepth: (pageId: string) => number
    getSubtreeDepth: (pageId: string) => number

    // ============================================
    // Actions - Sections
    // ============================================
    addSection: (pageId: string, section: WireframeSection | string | { id?: string; name: string; description?: string }, afterIndex?: number) => void
    updateSection: (pageId: string, sectionId: string, updates: Partial<WireframeSection>) => void
    updateSectionContent: (pageId: string, sectionId: string, content: Partial<WireframeSectionContent>) => void
    updateSectionControls: (pageId: string, sectionId: string, controls: Partial<WireframeSectionControls>) => void
    deleteSection: (pageId: string, sectionId: string) => void
    reorderSections: (pageId: string, fromIndex: number, toIndex: number) => void
    moveSection: (pageId: string, fromIndex: number, toIndex: number) => void
    setComponent: (pageId: string, sectionId: string, componentId: string) => void
    duplicateSection: (pageId: string, sectionId: string) => void
    toggleGlobalSection: (pageId: string, sectionId: string) => void
    syncGlobalSection: (sectionId: string) => void

    // ============================================
    // Actions - ReactFlow (Sitemap View)
    // ============================================
    onNodesChange: (changes: NodeChange[]) => void
    onEdgesChange: (changes: EdgeChange[]) => void
    setReactFlowFunctions: (zoomFn: (zoom: number) => void, fitViewFn: () => void) => void
    recalculateLayout: () => void

    // ============================================
    // Actions - Sitemap UI
    // ============================================
    setActiveTool: (tool: CanvasTool) => void
    setZoomLevel: (zoom: number) => void
    setWireframePanOffset: (offset: { x: number; y: number }) => void
    setWireframeHasInitialFit: (hasInitialFit: boolean) => void
    setSelectedNodeId: (id: string | null) => void
    setIsPanning: (isPanning: boolean) => void
    openSectionPicker: (pageId: string, insertIndex: number) => void
    closeSectionPicker: () => void

    // ============================================
    // Actions - Wireframe UI
    // ============================================
    selectPage: (pageId: string | null) => void
    selectSection: (sectionId: string | null) => void
    deselectAll: () => void
    setViewportMode: (mode: ViewportMode) => void
    toggleDeviceVisibility: (device: 'desktop' | 'mobile' | 'tablet') => void
    addViewport: (device: ViewportDevice) => void
    removeViewport: (device: ViewportDevice) => void
    setActivePanelView: (view: 'page' | 'section' | 'library' | null) => void
    openAddSidebar: (pageId: string, insertIndex: number) => void
    closeAddSidebar: () => void
    setGhostPreviewLayout: (layout: { type: string; variant?: string; name: string; presetId?: string } | null) => void

    // ============================================
    // Actions - Zoom/View
    // ============================================
    fitView: () => void
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void

    // ============================================
    // Actions - History
    // ============================================
    undo: () => void
    redo: () => void
    saveToHistory: () => void
    canUndo: () => boolean
    canRedo: () => boolean

    // ============================================
    // Actions - Persistence
    // ============================================
    save: () => Promise<void>
    toJSON: () => string
    markDirty: () => void
    markSaved: () => void

    // ============================================
    // Helpers
    // ============================================
    getPageById: (pageId: string) => UnifiedPage | undefined
    getSectionById: (sectionId: string) => { page: UnifiedPage; section: WireframeSection } | undefined
    getChildPages: (pageId: string) => UnifiedPage[]
}

// Save queue management
let isSaveInProgress = false
let pendingSave = false

async function triggerSave() {
    if (isSaveInProgress) {
        pendingSave = true
        return
    }
    isSaveInProgress = true
    try {
        await useUnifiedStore.getState().save()
    } finally {
        isSaveInProgress = false
        if (pendingSave) {
            pendingSave = false
            triggerSave()
        }
    }
}

export function flushPendingSave() {
    if (pendingSave || isSaveInProgress) {
        useUnifiedStore.getState().save()
    }
}

// ============================================
// Store Implementation
// ============================================

export const useUnifiedStore = create<UnifiedState>()(
    subscribeWithSelector(
        immer((set, get) => ({
            // Initial State
            projectId: null,
            projectName: 'My Project',
            pages: [],
            // Initialize with a project node so something shows immediately
            nodes: [
                {
                    id: 'project',
                    type: 'project',
                    position: { x: 600 - LAYOUT.NODE_WIDTH / 2, y: 50 },
                    data: { label: 'My Project' },
                    draggable: false,
                }
            ],
            edges: [],

            // Sitemap UI
            activeTool: 'select',
            zoomLevel: 100,
            selectedNodeId: null,
            isPanning: false,
            sectionPickerOpen: false,
            sectionPickerTargetPageId: null,
            sectionPickerInsertIndex: null,

            // Page drag & drop state
            pageDrag: {
                isDragging: false,
                draggedPageId: null,
                activeDropZone: null,
                draggedPageDepth: 0,
            },

            // Wireframe UI
            wireframePanOffset: { x: 0, y: 0 },
            wireframeHasInitialFit: false,
            selectedPageId: null,
            selectedSectionId: null,
            viewportMode: 'dual',
            deviceVisibility: { desktop: true, tablet: false, mobile: true },
            activeViewports: ['desktop', 'mobile'] as ViewportDevice[],
            activePanelView: null,
            isAddSidebarOpen: false,
            addSidebarPageId: '',
            addSidebarInsertIndex: 0,
            ghostPreviewLayout: null,

            // History
            history: [[]],
            historyIndex: 0,
            maxHistoryLength: 50,

            // Persistence
            isSaving: false,
            isDirty: false,
            lastSavedAt: null,

            // ReactFlow refs
            reactFlowZoom: null,
            reactFlowFitView: null,

            // ========================================
            // Project Actions
            // ========================================

            setProjectId: (id) => set({ projectId: id }),

            setProjectName: (name) => {
                set(state => {
                    state.projectName = name
                    state.isDirty = true
                    // Update project node
                    const projectNode = state.nodes.find(n => n.id === 'project')
                    if (projectNode) {
                        projectNode.data = { ...projectNode.data, label: name }
                    }
                })
                triggerSave()
            },

            // ========================================
            // Data Loading
            // ========================================

            loadFromAI: (aiPages, projectName, options) => {
                console.log('📦 Loading sitemap from AI:', aiPages.length, 'root pages')

                const pages = flattenAIPages(aiPages)
                const { pages: layoutPages, projectPosition } = calculateTreeLayout(
                    pages,
                    projectName || get().projectName
                )
                const nodes = pagesToNodes(layoutPages, projectName || get().projectName)
                const edges = pagesToEdges(layoutPages)

                // Update project node position
                const projectNode = nodes.find(n => n.id === 'project')
                if (projectNode) {
                    projectNode.position = projectPosition
                }

                const isInitialLoad = options?.skipSave === true

                set(state => {
                    state.pages = layoutPages
                    state.nodes = nodes
                    state.edges = edges
                    if (projectName) state.projectName = projectName
                    state.isDirty = !isInitialLoad
                    if (isInitialLoad) state.lastSavedAt = new Date()
                    state.history = [JSON.parse(JSON.stringify(layoutPages))]
                    state.historyIndex = 0
                })

                console.log('✅ Loaded', layoutPages.length, 'pages,', nodes.length, 'nodes,', edges.length, 'edges')

                // Persist the unified format immediately so it's the source of truth on next reload
                // Skip save during initial project load (data already exists in DB)
                if (!isInitialLoad) {
                    triggerSave()
                }
            },

            loadFromJSON: (json) => {
                try {
                    const data = JSON.parse(json)
                    const rawPages = data.pages as UnifiedPage[]
                    const projectName = data.projectName || get().projectName

                    // Backfill pageContext/pageLayout for pages loaded from older data
                    const pages = rawPages.map(p => ({
                        ...p,
                        pageContext: p.pageContext || inferPageContext(p.name, p.slug),
                        pageLayout: p.pageLayout || inferPageLayout(p.pageContext || inferPageContext(p.name, p.slug)),
                    }))

                    console.log('📦 loadFromJSON: Loading', pages.length, 'pages for project:', projectName)

                    const { pages: layoutPages, projectPosition } = calculateTreeLayout(pages, projectName)
                    const nodes = pagesToNodes(layoutPages, projectName)
                    const edges = pagesToEdges(layoutPages)

                    // Update project node position
                    const projectNode = nodes.find(n => n.id === 'project')
                    if (projectNode) {
                        projectNode.position = projectPosition
                    }

                    set(state => {
                        state.pages = layoutPages
                        state.nodes = nodes
                        state.edges = edges
                        state.projectName = projectName
                        state.isDirty = false
                        state.lastSavedAt = new Date()
                        state.history = [JSON.parse(JSON.stringify(layoutPages))]
                        state.historyIndex = 0
                    })

                    console.log('✅ loadFromJSON: Loaded', layoutPages.length, 'pages,', nodes.length, 'nodes,', edges.length, 'edges')
                } catch (error) {
                    console.error('❌ Failed to load JSON:', error)
                }
            },

            /**
             * Sync pages from sitemap store's nodes/edges back into the unified store.
             * Preserves rich wireframe section data (componentId, controls, content) for
             * sections that already exist; creates lightweight stubs for newly added ones.
             * This is the sitemap→unified reverse sync path.
             */
            syncFromSitemap: (sitemapNodes, sitemapEdges) => {
                const existingPages = get().pages
                const existingPagesMap = new Map(existingPages.map(p => [p.id, p]))

                // Build parent map from edges
                const parentMap = new Map<string, string>()
                const childOrderMap = new Map<string, string[]>()
                for (const edge of sitemapEdges) {
                    parentMap.set(edge.target, edge.source)
                    if (!childOrderMap.has(edge.source)) childOrderMap.set(edge.source, [])
                    childOrderMap.get(edge.source)!.push(edge.target)
                }

                // Convert sitemap nodes → unified pages (skip 'project' node)
                const newPages: UnifiedPage[] = []
                for (const node of sitemapNodes) {
                    if (node.type === 'project') continue

                    const data = node.data as {
                        label?: string
                        slug?: string
                        sections?: ({ id?: string; name: string; description?: string } | string)[]
                    }
                    const existing = existingPagesMap.get(node.id)

                    // Determine parent: map 'project' parent → null (root)
                    const rawParent = parentMap.get(node.id) ?? null
                    const parentId = rawParent === 'project' ? null : rawParent

                    // Determine sibling order
                    const effectiveParent = rawParent ?? 'project'
                    const siblings = childOrderMap.get(effectiveParent) || []
                    const order = siblings.indexOf(node.id)

                    // Merge sections: preserve existing rich WireframeSection data where possible
                    const sitemapSections = data.sections || []
                    const mergedSections: WireframeSection[] = sitemapSections.map((s, idx) => {
                        const sectionName = typeof s === 'string' ? s : s.name
                        const sectionId = typeof s === 'string' ? `${node.id}-section-${idx}` : (s.id || `${node.id}-section-${idx}`)
                        const sectionDesc = typeof s === 'string' ? undefined : s.description

                        // Try to find matching existing section by id, then by name
                        const existingSection = existing?.sections.find(es => es.id === sectionId)
                            || existing?.sections.find(es => es.name === sectionName)

                        if (existingSection) {
                            // Preserve rich wireframe data, but update name/description/order
                            return {
                                ...existingSection,
                                name: sectionName,
                                description: sectionDesc ?? existingSection.description,
                                order: idx,
                            }
                        }

                        // New section — create a lightweight stub
                        return {
                            id: sectionId,
                            type: sectionName.toLowerCase().replace(/\s+/g, '-'),
                            name: sectionName,
                            description: sectionDesc,
                            componentId: '',
                            isGlobal: false,
                            order: idx,
                            content: {
                                heading: sectionName,
                                body: sectionDesc || '',
                            } as WireframeSectionContent,
                            controls: {} as WireframeSectionControls,
                        }
                    })

                    const pageName = data.label || existing?.name || 'Untitled'
                    const pageSlug = data.slug || existing?.slug || `/${(data.label || 'untitled').toLowerCase().replace(/\s+/g, '-')}`
                    const ctx = existing?.pageContext || inferPageContext(pageName, pageSlug)

                    newPages.push({
                        id: node.id,
                        name: pageName,
                        slug: pageSlug,
                        description: existing?.description,
                        parentId,
                        order: order >= 0 ? order : 0,
                        pageContext: ctx,
                        pageLayout: existing?.pageLayout || inferPageLayout(ctx),
                        position: existing?.position || node.position || { x: 0, y: 0 },
                        sections: mergedSections,
                    })
                }

                // Only update if pages actually changed
                const currentIds = existingPages.map(p => p.id).sort().join(',')
                const newIds = newPages.map(p => p.id).sort().join(',')
                const currentNames = existingPages.map(p => `${p.id}:${p.name}:${p.parentId}:${p.sections.length}`).sort().join(',')
                const newNames = newPages.map(p => `${p.id}:${p.name}:${p.parentId}:${p.sections.length}`).sort().join(',')

                if (currentIds === newIds && currentNames === newNames) {
                    return // No meaningful change
                }

                console.log('🔄 syncFromSitemap: syncing', newPages.length, 'pages from sitemap')

                set(state => {
                    state.pages = newPages
                    state.isDirty = true
                })
                get().recalculateLayout()
                get().saveToHistory()
                triggerSave()
            },

            reset: () => {
                set(state => {
                    state.pages = []
                    state.nodes = []
                    state.edges = []
                    state.selectedPageId = null
                    state.selectedSectionId = null
                    state.selectedNodeId = null
                    state.activePanelView = null
                    state.isDirty = false
                    state.history = [[]]
                    state.historyIndex = 0
                })
            },

            // ========================================
            // Page Actions
            // ========================================

            addPage: (pageData, parentId = null) => {
                const newId = pageData.id || `page-${Date.now()}`
                const pageName = pageData.name || 'New Page'
                const pageSlug = pageData.slug || `/${pageName.toLowerCase().replace(/\s+/g, '-') || 'new-page'}`
                const pageContext = inferPageContext(pageName, pageSlug)
                const pageLayout = inferPageLayout(pageContext)

                const newPage: UnifiedPage = {
                    id: newId,
                    name: pageName,
                    slug: pageSlug,
                    description: pageData.description,
                    parentId,
                    order: get().pages.filter(p => p.parentId === parentId).length,
                    pageContext,
                    pageLayout,
                    position: { x: 0, y: 0 },
                    sections: pageData.sections || [],
                }

                set(state => {
                    state.pages.push(newPage)
                    state.isDirty = true
                })

                get().recalculateLayout()
                get().saveToHistory()
                triggerSave()

                return newId
            },

            addChildPage: (parentId) => {
                const parent = get().getPageById(parentId)
                const childCount = get().getChildPages(parentId).length
                const newName = `Child Page ${childCount + 1}`

                return get().addPage({
                    name: newName,
                    slug: `/${newName.toLowerCase().replace(/\s+/g, '-')}`,
                    sections: [],
                }, parentId)
            },

            updatePage: (pageId, updates) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    if (page) {
                        Object.assign(page, updates)
                        state.isDirty = true
                    }
                })
                get().recalculateLayout()
                triggerSave()
            },

            deletePage: (pageId) => {
                const pagesToDelete = new Set<string>([pageId])

                // Find all descendant pages
                const findDescendants = (id: string) => {
                    get().pages.forEach(p => {
                        if (p.parentId === id) {
                            pagesToDelete.add(p.id)
                            findDescendants(p.id)
                        }
                    })
                }
                findDescendants(pageId)

                set(state => {
                    state.pages = state.pages.filter(p => !pagesToDelete.has(p.id))
                    if (state.selectedPageId && pagesToDelete.has(state.selectedPageId)) {
                        state.selectedPageId = null
                        state.selectedSectionId = null
                        state.activePanelView = null
                    }
                    if (state.selectedNodeId && pagesToDelete.has(state.selectedNodeId)) {
                        state.selectedNodeId = null
                    }
                    state.isDirty = true
                })

                get().recalculateLayout()
                get().saveToHistory()
                triggerSave()
            },

            renamePage: (pageId, name) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    if (page) {
                        page.name = name
                        page.slug = `/${name.toLowerCase().replace(/\s+/g, '-')}`
                        state.isDirty = true
                    }
                })
                get().recalculateLayout()
                get().saveToHistory()
                triggerSave()
            },

            reparentPage: (pageId, newParentId) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    if (!page) return

                    // Prevent circular references - can't reparent to self or descendants
                    if (newParentId === pageId) return

                    // Check if newParentId is a descendant of pageId
                    const isDescendant = (ancestorId: string, descendantId: string | null): boolean => {
                        if (!descendantId) return false
                        if (descendantId === ancestorId) return true
                        const descendant = state.pages.find(p => p.id === descendantId)
                        return descendant ? isDescendant(ancestorId, descendant.parentId) : false
                    }

                    if (newParentId && isDescendant(pageId, newParentId)) {
                        console.warn('⚠️ Cannot reparent to a descendant node')
                        return
                    }

                    // Update the page's parent
                    page.parentId = newParentId

                    // Update order to be last among siblings
                    const siblings = state.pages.filter(p => p.parentId === newParentId && p.id !== pageId)
                    page.order = siblings.length

                    state.isDirty = true
                })
                get().recalculateLayout()
                get().saveToHistory()
                triggerSave()
            },

            movePage: (pageId, dropZone) => {
                const state = get()

                // Validate the drop
                if (!state.isValidDropZone(pageId, dropZone)) {
                    console.warn('⚠️ Invalid drop zone')
                    return
                }

                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    if (!page) return

                    const oldParentId = page.parentId
                    const oldOrder = page.order

                    // Update parent if changed
                    page.parentId = dropZone.parentId

                    // Get siblings in the new parent (excluding the moved page)
                    const siblings = state.pages
                        .filter(p => p.parentId === dropZone.parentId && p.id !== pageId)
                        .sort((a, b) => a.order - b.order)

                    // Calculate new order based on drop zone
                    let newOrder: number
                    if (dropZone.type === 'child') {
                        // Dropping as child - add at the end
                        newOrder = siblings.length
                    } else if (dropZone.type === 'before') {
                        // Dropping before target
                        const targetPage = state.pages.find(p => p.id === dropZone.targetPageId)
                        newOrder = targetPage?.order ?? 0
                    } else {
                        // Dropping after target
                        const targetPage = state.pages.find(p => p.id === dropZone.targetPageId)
                        newOrder = (targetPage?.order ?? 0) + 1
                    }

                    // Shift siblings to make room
                    siblings.forEach(sibling => {
                        if (sibling.order >= newOrder) {
                            sibling.order += 1
                        }
                    })

                    page.order = newOrder

                    // Re-normalize orders to be sequential (0, 1, 2, ...)
                    const allSiblings = state.pages
                        .filter(p => p.parentId === dropZone.parentId)
                        .sort((a, b) => a.order - b.order)
                    allSiblings.forEach((p, i) => { p.order = i })

                    // If we moved to a different parent, also normalize old parent's children
                    if (oldParentId !== dropZone.parentId) {
                        const oldSiblings = state.pages
                            .filter(p => p.parentId === oldParentId)
                            .sort((a, b) => a.order - b.order)
                        oldSiblings.forEach((p, i) => { p.order = i })
                    }

                    state.isDirty = true
                })

                get().recalculateLayout()
                get().saveToHistory()
                triggerSave()
            },

            // ========================================
            // Page Drag & Drop Actions
            // ========================================

            startPageDrag: (pageId) => {
                const subtreeDepth = get().getSubtreeDepth(pageId)
                set(state => {
                    state.pageDrag = {
                        isDragging: true,
                        draggedPageId: pageId,
                        activeDropZone: null,
                        draggedPageDepth: subtreeDepth,
                    }
                })
            },

            updateDropZone: (dropZone) => {
                set(state => {
                    state.pageDrag.activeDropZone = dropZone
                })
            },

            endPageDrag: () => {
                const { pageDrag } = get()
                if (pageDrag.isDragging && pageDrag.draggedPageId && pageDrag.activeDropZone) {
                    get().movePage(pageDrag.draggedPageId, pageDrag.activeDropZone)
                }
                set(state => {
                    state.pageDrag = {
                        isDragging: false,
                        draggedPageId: null,
                        activeDropZone: null,
                        draggedPageDepth: 0,
                    }
                })
            },

            cancelPageDrag: () => {
                set(state => {
                    state.pageDrag = {
                        isDragging: false,
                        draggedPageId: null,
                        activeDropZone: null,
                        draggedPageDepth: 0,
                    }
                })
            },

            isValidDropZone: (pageId, dropZone) => {
                const state = get()
                const page = state.pages.find(p => p.id === pageId)
                if (!page) return false

                // Can't drop on self
                if (dropZone.targetPageId === pageId) return false

                // Check for circular reference - can't drop onto a descendant
                const isDescendant = (ancestorId: string, checkId: string | null): boolean => {
                    if (!checkId) return false
                    if (checkId === ancestorId) return true
                    const checkPage = state.pages.find(p => p.id === checkId)
                    return checkPage ? isDescendant(ancestorId, checkPage.parentId) : false
                }

                // For 'child' type, target becomes parent
                if (dropZone.type === 'child') {
                    if (isDescendant(pageId, dropZone.targetPageId)) return false
                }

                // Check nesting depth limit
                const targetDepth = dropZone.parentId ? state.getPageDepth(dropZone.parentId) + 1 : 1
                const subtreeDepth = state.getSubtreeDepth(pageId)
                if (targetDepth + subtreeDepth > LAYOUT.MAX_NESTING_DEPTH) {
                    console.warn(`⚠️ Would exceed max nesting depth of ${LAYOUT.MAX_NESTING_DEPTH}`)
                    return false
                }

                // Home page can't be moved (it's always root)
                const homePage = state.pages.find(p => p.slug === '/' || p.id === 'home')
                if (homePage && pageId === homePage.id) {
                    return false
                }

                return true
            },

            getPageDepth: (pageId) => {
                const state = get()
                let depth = 1
                let currentPage = state.pages.find(p => p.id === pageId)
                while (currentPage?.parentId) {
                    depth++
                    currentPage = state.pages.find(p => p.id === currentPage!.parentId)
                }
                return depth
            },

            getSubtreeDepth: (pageId) => {
                const state = get()
                const getMaxChildDepth = (pId: string): number => {
                    const children = state.pages.filter(p => p.parentId === pId)
                    if (children.length === 0) return 0
                    return 1 + Math.max(...children.map(c => getMaxChildDepth(c.id)))
                }
                return 1 + getMaxChildDepth(pageId)
            },

            // ========================================
            // Section Actions
            // ========================================

            addSection: (pageId, section, afterIndex) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    if (!page) return

                    let newSection: WireframeSection
                    if (typeof section === 'string') {
                        newSection = createSection(section, afterIndex ?? page.sections.length)
                    } else if ('type' in section && 'componentId' in section) {
                        // Full WireframeSection
                        newSection = section as WireframeSection
                    } else {
                        // Simple { id?, name, description? } object from SectionPickerPanel
                        newSection = createSection(section, afterIndex ?? page.sections.length)
                    }

                    if (afterIndex !== undefined) {
                        page.sections.splice(afterIndex, 0, newSection)
                    } else {
                        page.sections.push(newSection)
                    }

                    // Recalculate order
                    page.sections.forEach((s, i) => { s.order = i })

                    state.isDirty = true
                })

                get().recalculateLayout()
                get().saveToHistory()
                triggerSave()
            },

            updateSection: (pageId, sectionId, updates) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    const section = page?.sections.find(s => s.id === sectionId)
                    if (section) {
                        Object.assign(section, updates)
                        state.isDirty = true
                    }
                })
                // Recalculate layout to update node data with new section info
                get().recalculateLayout()
                triggerSave()
            },

            updateSectionContent: (pageId, sectionId, content) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    const section = page?.sections.find(s => s.id === sectionId)
                    if (section) {
                        section.content = { ...section.content, ...content }
                        state.isDirty = true
                    }
                })
                triggerSave()
            },

            updateSectionControls: (pageId, sectionId, controls) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    const section = page?.sections.find(s => s.id === sectionId)
                    if (section) {
                        Object.assign(section.controls, controls)
                        state.isDirty = true
                    }
                })
                triggerSave()
            },

            deleteSection: (pageId, sectionId) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    if (page) {
                        page.sections = page.sections.filter(s => s.id !== sectionId)
                        page.sections.forEach((s, i) => { s.order = i })
                        if (state.selectedSectionId === sectionId) {
                            state.selectedSectionId = null
                            state.activePanelView = 'page'
                        }
                        state.isDirty = true
                    }
                })
                get().recalculateLayout()
                get().saveToHistory()
                triggerSave()
            },

            reorderSections: (pageId, fromIndex, toIndex) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    if (!page) return

                    const [moved] = page.sections.splice(fromIndex, 1)
                    page.sections.splice(toIndex, 0, moved)
                    page.sections.forEach((s, i) => { s.order = i })
                    state.isDirty = true
                })
                get().recalculateLayout()
                triggerSave()
            },

            moveSection: (pageId, fromIndex, toIndex) => {
                get().reorderSections(pageId, fromIndex, toIndex)
            },

            setComponent: (pageId, sectionId, componentId) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    const section = page?.sections.find(s => s.id === sectionId)
                    if (section) {
                        section.componentId = componentId

                        // Try preset → family resolution first
                        const preset = getPresetById(componentId)
                        if (preset) {
                            const family = getFamilyById(preset.familyId)
                            if (family) {
                                section.layoutVariant = preset.familyId
                                // Reset controls to preset's curated values
                                section.controls = { ...(preset.controls ?? {}) }
                                // Reset content to family defaults + preset overrides
                                section.content = {
                                    ...(family.defaultContent ?? {}),
                                    ...(preset.content ?? {}),
                                } as WireframeSectionContent
                            }
                        } else {
                            // Try as family directly
                            const family = getFamilyById(componentId)
                            if (family) {
                                section.layoutVariant = family.id
                                section.controls = { ...family.defaultControls }
                                section.content = { ...family.defaultContent } as WireframeSectionContent
                            } else {
                                // Fallback: try legacy getDesignById
                                const design = getDesignById(componentId)
                                if (design) {
                                    section.layoutVariant = design.layout
                                    if (design.defaultControls) {
                                        section.controls = { ...design.defaultControls }
                                    }
                                } else {
                                    // Last resort: infer variant from componentId
                                    const typePrefix = section.type ? `${section.type}-` : ''
                                    section.layoutVariant = typePrefix && componentId.startsWith(typePrefix)
                                        ? componentId.slice(typePrefix.length)
                                        : undefined
                                }
                            }
                        }
                        state.isDirty = true
                    }
                })

                // If this is a global section, sync the design change to all pages
                const page = get().pages.find(p => p.id === pageId)
                const section = page?.sections.find(s => s.id === sectionId)
                if (section?.isGlobal) {
                    get().syncGlobalSection(sectionId)
                }

                triggerSave()
            },

            duplicateSection: (pageId, sectionId) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    if (!page) return

                    const sectionIndex = page.sections.findIndex(s => s.id === sectionId)
                    if (sectionIndex === -1) return

                    const original = page.sections[sectionIndex]
                    const duplicate: WireframeSection = {
                        ...JSON.parse(JSON.stringify(original)),
                        id: `section-${Date.now()}`,
                        name: `${original.name} (copy)`,
                        isGlobal: false, // Duplicated sections are not global
                    }

                    page.sections.splice(sectionIndex + 1, 0, duplicate)
                    page.sections.forEach((s, i) => { s.order = i })
                    state.isDirty = true
                })

                get().recalculateLayout()
                get().saveToHistory()
                triggerSave()
            },

            toggleGlobalSection: (pageId, sectionId) => {
                set(state => {
                    const page = state.pages.find(p => p.id === pageId)
                    const section = page?.sections.find(s => s.id === sectionId)
                    if (section) {
                        section.isGlobal = !section.isGlobal
                        state.isDirty = true
                    }
                })
                triggerSave()
            },

            syncGlobalSection: (sectionId) => {
                // Find the source section
                const sourceResult = get().getSectionById(sectionId)
                if (!sourceResult || !sourceResult.section.isGlobal) return

                const { section: sourceSection } = sourceResult

                set(state => {
                    // Find all sections with the same type and name that are global
                    state.pages.forEach(page => {
                        page.sections.forEach(section => {
                            if (section.id !== sectionId &&
                                section.isGlobal &&
                                section.type === sourceSection.type) {
                                // Sync content and controls
                                section.content = JSON.parse(JSON.stringify(sourceSection.content))
                                section.controls = JSON.parse(JSON.stringify(sourceSection.controls))
                                section.componentId = sourceSection.componentId
                            }
                        })
                    })
                    state.isDirty = true
                })
                triggerSave()
            },

            // ========================================
            // ReactFlow Actions
            // ========================================

            onNodesChange: (changes) => {
                set(state => {
                    state.nodes = applyNodeChanges(changes, state.nodes) as Node[]

                    // Sync position changes back to pages
                    changes.forEach(change => {
                        if (change.type === 'position' && change.position) {
                            const page = state.pages.find(p => p.id === change.id)
                            if (page) {
                                page.position = change.position
                            }
                        }
                    })
                })
            },

            onEdgesChange: (changes) => {
                set(state => {
                    state.edges = applyEdgeChanges(changes, state.edges) as Edge[]
                })
            },

            setReactFlowFunctions: (zoomFn, fitViewFn) => {
                set({ reactFlowZoom: zoomFn, reactFlowFitView: fitViewFn })
            },

            recalculateLayout: () => {
                const { pages, projectName } = get()
                const { pages: layoutPages, projectPosition } = calculateTreeLayout(pages, projectName)
                const nodes = pagesToNodes(layoutPages, projectName)
                const edges = pagesToEdges(layoutPages)

                // Update project node position
                const projectNode = nodes.find(n => n.id === 'project')
                if (projectNode) {
                    projectNode.position = projectPosition
                }

                set(state => {
                    state.pages = layoutPages
                    state.nodes = nodes
                    state.edges = edges
                })
            },

            // ========================================
            // Sitemap UI Actions
            // ========================================

            setActiveTool: (tool) => set({ activeTool: tool }),
            setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
            setWireframePanOffset: (offset) => set({ wireframePanOffset: offset }),
            setWireframeHasInitialFit: (hasInitialFit) => set({ wireframeHasInitialFit: hasInitialFit }),
            setSelectedNodeId: (id) => set({ selectedNodeId: id }),
            setIsPanning: (isPanning) => set({ isPanning }),

            openSectionPicker: (pageId, insertIndex) => set({
                sectionPickerOpen: true,
                sectionPickerTargetPageId: pageId,
                sectionPickerInsertIndex: insertIndex,
            }),

            closeSectionPicker: () => set({
                sectionPickerOpen: false,
                sectionPickerTargetPageId: null,
                sectionPickerInsertIndex: null,
            }),

            // ========================================
            // Wireframe UI Actions
            // ========================================

            selectPage: (pageId) => {
                set(state => {
                    state.selectedPageId = pageId
                    state.selectedNodeId = pageId
                    state.selectedSectionId = null
                    state.activePanelView = pageId ? 'page' : null
                })
            },

            selectSection: (sectionId) => {
                if (!sectionId) {
                    set(state => {
                        state.selectedSectionId = null
                        state.activePanelView = state.selectedPageId ? 'page' : null
                    })
                    return
                }

                const result = get().getSectionById(sectionId)
                if (result) {
                    set(state => {
                        state.selectedPageId = result.page.id
                        state.selectedSectionId = sectionId
                        state.activePanelView = 'section'
                    })
                }
            },

            deselectAll: () => set({
                selectedPageId: null,
                selectedSectionId: null,
                selectedNodeId: null,
                activePanelView: null,
            }),

            setViewportMode: (mode) => set({ viewportMode: mode }),

            toggleDeviceVisibility: (device) => {
                set(state => {
                    state.deviceVisibility[device] = !state.deviceVisibility[device]
                })
            },

            addViewport: (device) => {
                set(state => {
                    if (!state.activeViewports.includes(device)) {
                        const order: ViewportDevice[] = ['desktop', 'tablet', 'mobile']
                        const newViewports = [...state.activeViewports, device]
                        // Sort by canonical order: desktop → tablet → mobile
                        newViewports.sort((a, b) => order.indexOf(a) - order.indexOf(b))
                        state.activeViewports = newViewports
                        state.deviceVisibility[device] = true
                    }
                })
            },

            removeViewport: (device) => {
                set(state => {
                    // Don't allow removing if only 1 viewport left
                    if (state.activeViewports.length <= 1) return
                    state.activeViewports = state.activeViewports.filter(v => v !== device)
                    state.deviceVisibility[device] = false
                })
            },

            setActivePanelView: (view) => set({ activePanelView: view }),

            openAddSidebar: (pageId, insertIndex) => set({
                isAddSidebarOpen: true,
                addSidebarPageId: pageId,
                addSidebarInsertIndex: insertIndex,
            }),

            closeAddSidebar: () => set({
                isAddSidebarOpen: false,
                ghostPreviewLayout: null,
            }),

            setGhostPreviewLayout: (layout) => set({ ghostPreviewLayout: layout }),

            // ========================================
            // Zoom/View Actions
            // ========================================

            fitView: () => {
                const { reactFlowFitView } = get()
                if (reactFlowFitView) reactFlowFitView()
            },

            zoomIn: () => {
                const { zoomLevel, reactFlowZoom } = get()
                const newZoom = Math.min(300, zoomLevel + 25)
                set({ zoomLevel: newZoom })
                if (reactFlowZoom) reactFlowZoom(newZoom / 100)
            },

            zoomOut: () => {
                const { zoomLevel, reactFlowZoom } = get()
                const newZoom = Math.max(5, zoomLevel - 25)
                set({ zoomLevel: newZoom })
                if (reactFlowZoom) reactFlowZoom(newZoom / 100)
            },

            resetZoom: () => {
                const { reactFlowZoom } = get()
                set({ zoomLevel: 100 })
                if (reactFlowZoom) reactFlowZoom(1)
            },

            // ========================================
            // History Actions
            // ========================================

            saveToHistory: () => {
                set(state => {
                    const currentPages = JSON.parse(JSON.stringify(state.pages))

                    // Remove any future history if we're in the middle
                    state.history = state.history.slice(0, state.historyIndex + 1)
                    state.history.push(currentPages)

                    // Limit history length
                    if (state.history.length > state.maxHistoryLength) {
                        state.history.shift()
                    } else {
                        state.historyIndex++
                    }
                })
            },

            undo: () => {
                const { historyIndex } = get()
                if (historyIndex <= 0) return

                set(state => {
                    state.historyIndex--
                    state.pages = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
                })
                get().recalculateLayout()
            },

            redo: () => {
                const { historyIndex, history } = get()
                if (historyIndex >= history.length - 1) return

                set(state => {
                    state.historyIndex++
                    state.pages = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
                })
                get().recalculateLayout()
            },

            canUndo: () => get().historyIndex > 0,
            canRedo: () => get().historyIndex < get().history.length - 1,

            // ========================================
            // Persistence Actions
            // ========================================

            save: async () => {
                const { projectId, pages, projectName, isSaving } = get()
                if (!projectId || isSaving) return

                set({ isSaving: true })

                try {
                    const jwt = await createJWT()
                    if (!jwt) throw new Error('Not authenticated')

                    const response = await fetch(`/api/projects/${projectId}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${jwt.jwt}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sitemapData: JSON.stringify({ pages, projectName }),
                        }),
                    })

                    if (!response.ok) {
                        throw new Error('Failed to save')
                    }

                    set(state => {
                        state.isDirty = false
                        state.lastSavedAt = new Date()
                    })

                    console.log('💾 Unified store saved')
                } catch (error) {
                    console.error('❌ Save failed:', error)
                } finally {
                    set({ isSaving: false })
                }
            },

            toJSON: () => {
                const { pages, projectName } = get()
                return JSON.stringify({ pages, projectName })
            },

            markDirty: () => set({ isDirty: true }),
            markSaved: () => set({ isDirty: false, lastSavedAt: new Date() }),

            // ========================================
            // Helpers
            // ========================================

            getPageById: (pageId) => get().pages.find(p => p.id === pageId),

            getSectionById: (sectionId) => {
                for (const page of get().pages) {
                    const section = page.sections.find(s => s.id === sectionId)
                    if (section) return { page, section }
                }
                return undefined
            },

            getChildPages: (pageId) => get().pages.filter(p => p.parentId === pageId),
        }))
    )
)

// Re-export types for convenience
export type { WireframeSection, WireframeSectionContent, WireframeSectionControls }
