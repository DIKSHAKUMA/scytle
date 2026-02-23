/**
 * V2 Block System — Type Definitions
 *
 * Blocks are the atomic building units of V2 layouts.
 * Each block:
 * - Has a unique `id` (UUID)
 * - Has a `type` discriminator
 * - Reads ALL visual styling from CSS custom properties (--sg-*)
 * - Renders `data-layer-*` attributes for selection (Phase 2 — Step 3)
 * - Is independently selectable, deletable, copy/paste-able
 *
 * The Block interface is intentionally loose (`props: Record<string, unknown>`)
 * to allow each block type to define its own strongly-typed props interface.
 * The type-specific interfaces below (HeadingBlockProps, etc.) provide
 * compile-time safety within each block component.
 */

// ============================================
// Block Type Union
// ============================================

export type BlockType =
    | 'heading'
    | 'text'
    | 'button'
    | 'button-group'
    | 'image'
    | 'card'
    | 'badge'
    | 'list'
    | 'divider'
    | 'spacer'
    | 'icon'
    | 'logo'
    | 'video'
    | 'form'
    | 'input'
    | 'avatar'
    | 'social'
    | 'frame'

// ============================================
// Base Block Interface
// ============================================

export interface Block {
    /** Unique instance ID (UUID) */
    id: string
    /** Block type discriminator */
    type: BlockType
    /** Type-specific configuration props */
    props: Record<string, unknown>
    /** Editable content (text, items, etc.) */
    content: Record<string, unknown>
    /** Child blocks (for container types: card, button-group) */
    children?: Block[]
    /** Prevent deletion/modification */
    locked?: boolean
}

// ============================================
// Block-Specific Props Interfaces
// ============================================

/** Text alignment */
export type TextAlign = 'left' | 'center' | 'right'

// ---- HeadingBlock ----

export interface HeadingBlockProps {
    /** Heading level (1–6) */
    level: 1 | 2 | 3 | 4 | 5 | 6
    /** Text alignment */
    align: TextAlign
}

export interface HeadingBlockContent {
    text: string
}

// ---- TextBlock ----

export type TextVariant = 'body' | 'body-large' | 'small' | 'caption'

export interface TextBlockProps {
    /** Text variant */
    variant: TextVariant
    /** Text alignment */
    align: TextAlign
    /** Whether the text should render bold (overrides style-guide body weight) */
    bold?: boolean
}

export interface TextBlockContent {
    text: string
}

// ---- ButtonBlock ----

export type ButtonVariant = 'primary' | 'secondary' | 'link'

export interface ButtonBlockProps {
    /** Button variant */
    variant: ButtonVariant
    /** Optional size override */
    size?: 'sm' | 'md' | 'lg'
}

export interface ButtonBlockContent {
    text: string
    href?: string
}

// ---- ButtonGroupBlock ----

export interface ButtonGroupBlockProps {
    /** Alignment of the button group */
    align: TextAlign
    /** Gap between buttons in px */
    gap?: number
}

// ---- ImageBlock ----

export type ImageRatio = '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '3:4' | 'auto'
export type ImageShape = 'rectangle' | 'circle'
export type ImageFillMode = 'cover' | 'contain' | 'fill' | 'none'

export interface ImageBlockProps {
    /** Aspect ratio */
    ratio: ImageRatio
    /** Shape */
    shape: ImageShape
    /** CSS object-position */
    position: string
    /** CSS object-fit */
    fillMode: ImageFillMode
    /** Width preset */
    width?: 'full' | '3/4' | '2/3' | '1/2' | '1/3' | string
    /** Overlay config */
    overlay?: {
        enabled: boolean
        color?: string
        opacity?: number
    }
}

export interface ImageBlockContent {
    src?: string
    alt?: string
}

// ---- CardBlock ----

export type CardVariant = 'default' | 'outlined' | 'flat'

export interface CardBlockProps {
    /** Card visual variant (overrides token if set) */
    variant?: CardVariant
    /** Padding size */
    padding?: 'sm' | 'md' | 'lg'
}

// ---- BadgeBlock ----

export type BadgeVariant = 'default' | 'outline' | 'accent'

export interface BadgeBlockProps {
    variant: BadgeVariant
}

export interface BadgeBlockContent {
    text: string
}

// ---- ListBlock ----

export type ListIcon = 'check' | 'bullet' | 'number' | 'arrow' | 'dash' | 'none'

export interface ListBlockProps {
    /** Icon type for list items */
    icon: ListIcon
    /** Gap between items */
    gap?: 'sm' | 'md' | 'lg'
}

export interface ListBlockContent {
    items: string[]
}

// ---- DividerBlock ----

export type DividerVariant = 'line' | 'space' | 'dots'

export interface DividerBlockProps {
    variant: DividerVariant
}

// ---- SpacerBlock ----

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface SpacerBlockProps {
    size: SpacerSize
}

// ---- IconBlock ----

export interface IconBlockProps {
    /** Lucide icon name (e.g. 'arrow-right', 'check') */
    name?: string
    /** Size preset */
    size?: 'sm' | 'md' | 'lg' | 'xl'
    /** Whether to show filled (accent bg) style */
    filled?: boolean
    /** Optional color override (CSS value) */
    color?: string
}

// ---- LogoBlock ----

export interface LogoBlockProps {
    /** Display mode */
    mode?: 'text' | 'image' | 'both'
    /** Size preset */
    size?: 'sm' | 'md' | 'lg'
}

export interface LogoBlockContent {
    text?: string
    alt?: string
    src?: string
}

// ---- VideoBlock ----

export interface VideoBlockProps {
    /** Aspect ratio */
    ratio: ImageRatio
    /** Show play button overlay */
    showPlayButton: boolean
}

export interface VideoBlockContent {
    src?: string
    alt?: string
    caption?: string
}

// ---- FormBlock ----

export type FormFieldType = 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'

export interface FormField {
    id: string
    type: FormFieldType
    label: string
    placeholder?: string
    required?: boolean
}

export interface FormBlockProps {
    /** Form layout */
    layout?: 'stacked' | 'inline' | 'grid'
    /** Columns for grid layout */
    columns?: number
    /** Gap between children */
    gap?: number
}

export interface FormBlockContent {
    fields: FormField[]
    submitText: string
}

// ---- InputBlock ----

export interface InputBlockProps {
    /** Field type */
    fieldType: FormFieldType
    /** Whether field is required */
    required?: boolean
    /** Show label above */
    showLabel?: boolean
}

export interface InputBlockContent {
    label?: string
    placeholder?: string
}

// ---- AvatarBlock ----

export interface AvatarBlockProps {
    /** Size preset */
    size?: 'sm' | 'md' | 'lg' | 'xl'
    /** Shape */
    shape?: 'circle' | 'square'
}

export interface AvatarBlockContent {
    src?: string
    alt?: string
    name?: string
    initials?: string
}

// ---- SocialBlock ----

export type SocialPlatform =
    | 'twitter' | 'facebook' | 'instagram' | 'linkedin'
    | 'youtube' | 'github' | 'dribbble' | 'tiktok'

export interface SocialBlockProps {
    /** Icon size in px */
    iconSize: number
    /** Gap between icons */
    gap?: number
}

export interface SocialBlockContent {
    platforms: SocialPlatform[]
}

// ---- FrameBlock ----

/**
 * FrameBlock is the structural backbone of every layout.
 * Every wrapper <div> that creates spatial structure (rows, columns, content groups)
 * MUST be a frame block so users can hover, select, resize, drag, and rearrange it
 * directly on canvas — matching Figma Frames.
 *
 * If `direction` is provided, renders as flex container with inline styles.
 * If `direction` is omitted, only `className` drives the layout (for CSS grid, etc.).
 */
export interface FrameBlockProps {
    /** Flex direction. Omit to let className control display (e.g., CSS grid). */
    direction?: 'horizontal' | 'vertical'
    /** Gap between children in px */
    gap?: number
    /** Padding in px */
    padding?: { top?: number; right?: number; bottom?: number; left?: number }
    /** Flex alignment */
    alignment?: {
        main?: 'start' | 'center' | 'end' | 'space-between'
        cross?: 'start' | 'center' | 'end' | 'stretch'
    }
    /** Width/height sizing */
    sizing?: {
        width?: 'fill' | 'hug' | number
        height?: 'fill' | 'hug' | number
    }
    /** Optional max-width constraint in px */
    maxWidth?: number
    /** Enable flex-wrap */
    wrap?: boolean
    /** Additional Tailwind classes for the frame's own div (responsive overrides, grid, etc.) */
    className?: string
    /** Classes applied to the LayerWrapper (positioning within parent: flex-1, shrink-0, etc.) */
    layoutClassName?: string
}

export interface FrameBlockContent {
    /** Human-readable label shown in selection badge */
    label?: string
    /**
     * Decorative chrome rendered after children (not editable blocks).
     * Space-separated list: 'arrows-inset' | 'arrows-edge' | 'arrows-offset' | 'dots' | 'controls-below'
     */
    _chrome?: string
}

// ============================================
// Block Factory Helpers
// ============================================

/**
 * Human-readable label for a block type (used in layer panel, tooltips)
 */
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
    heading: 'Heading',
    text: 'Text',
    button: 'Button',
    'button-group': 'Button Group',
    image: 'Image',
    card: 'Card',
    badge: 'Badge',
    list: 'List',
    divider: 'Divider',
    spacer: 'Spacer',
    icon: 'Icon',
    logo: 'Logo',
    video: 'Video',
    form: 'Form',
    input: 'Input',
    avatar: 'Avatar',
    social: 'Social Links',
    frame: 'Frame',
}

/**
 * Whether a block type can contain children
 */
export const CONTAINER_BLOCK_TYPES: Set<BlockType> = new Set([
    'card',
    'button-group',
    'form',
    'frame',
])
