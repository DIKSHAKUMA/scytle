/**
 * V2 Block Primitives — Barrel export & RenderBlock dispatcher
 *
 * RenderBlock is the single entry point for rendering any Block node.
 * It resolves the block type and delegates to the correct component.
 * Container blocks (card, button-group, form) receive `renderChild`
 * as a prop so they can recursively render their children.
 */

'use client'

import type { Block, BlockType } from './types'
import { LayerWrapper } from '../selection/layer-wrapper'

// ── Individual block components ──────────────────────────────────
import { HeadingBlock } from './heading-block'
import { TextBlock } from './text-block'
import { ButtonBlock } from './button-block'
import { ButtonGroupBlock } from './button-group-block'
import { ImageBlock } from './image-block'
import { CardBlock } from './card-block'
import { BadgeBlock } from './badge-block'
import { ListBlock } from './list-block'
import { DividerBlock } from './divider-block'
import { SpacerBlock } from './spacer-block'
import { IconBlock } from './icon-block'
import { LogoBlock } from './logo-block'
import { VideoBlock } from './video-block'
import { FormBlock } from './form-block'
import { InputBlock } from './input-block'
import { AvatarBlock } from './avatar-block'
import { SocialBlock } from './social-block'
import { FrameBlock } from './frame-block'

// ── Re-exports ──────────────────────────────────────────────────
export { HeadingBlock } from './heading-block'
export { TextBlock } from './text-block'
export { ButtonBlock } from './button-block'
export { ButtonGroupBlock } from './button-group-block'
export { ImageBlock } from './image-block'
export { CardBlock } from './card-block'
export { BadgeBlock } from './badge-block'
export { ListBlock } from './list-block'
export { DividerBlock } from './divider-block'
export { SpacerBlock } from './spacer-block'
export { IconBlock } from './icon-block'
export { LogoBlock } from './logo-block'
export { VideoBlock } from './video-block'
export { FormBlock } from './form-block'
export { InputBlock } from './input-block'
export { AvatarBlock } from './avatar-block'
export { SocialBlock } from './social-block'
export { FrameBlock } from './frame-block'

// Re-export types
export type {
    Block,
    BlockType,
    HeadingBlockProps,
    HeadingBlockContent,
    TextBlockProps,
    TextBlockContent,
    ButtonBlockProps,
    ButtonBlockContent,
    ButtonGroupBlockProps,
    ImageBlockProps,
    ImageBlockContent,
    CardBlockProps,
    BadgeBlockProps,
    BadgeBlockContent,
    ListBlockProps,
    ListBlockContent,
    ListIcon,
    DividerBlockProps,
    DividerVariant,
    SpacerBlockProps,
    SpacerSize,
    IconBlockProps,
    LogoBlockProps,
    LogoBlockContent,
    VideoBlockProps,
    VideoBlockContent,
    FormBlockProps,
    InputBlockProps,
    InputBlockContent,
    FormFieldType,
    AvatarBlockProps,
    AvatarBlockContent,
    SocialBlockProps,
    SocialBlockContent,
    SocialPlatform,
    FrameBlockProps,
    FrameBlockContent,
    TextAlign,
    TextVariant,
    ButtonVariant,
    ImageRatio,
    ImageShape,
    ImageFillMode,
    CardVariant,
    BadgeVariant,
} from './types'

// Re-export constants (values, not types)
export { BLOCK_TYPE_LABELS, CONTAINER_BLOCK_TYPES } from './types'

// ── RenderBlock dispatcher ──────────────────────────────────────

interface RenderBlockProps {
    block: Block
    className?: string
}

/**
 * Universal block renderer. Resolves `block.type` → component.
 * Container blocks receive a recursive `renderChild` callback.
 * Every block is wrapped in `<LayerWrapper>` for selection/hover.
 *
 * Editable blocks (heading, text) call the unified store directly
 * for content changes — no callback threading needed.
 */
export function RenderBlock({ block, className }: RenderBlockProps) {
    const renderChild = (child: Block) => {
        // Pass layoutClassName from any child's props as className to LayerWrapper
        const childLayoutClass = (child.props as { layoutClassName?: string }).layoutClassName
        return <RenderBlock key={child.id} block={child} className={childLayoutClass} />
    }

    // Use layoutClassName from props if no explicit className was provided
    const propsLayoutClass = (block.props as { layoutClassName?: string }).layoutClassName
    let resolvedClass = className ?? propsLayoutClass

    // Prevent image/video blocks from collapsing in mobile column layouts.
    // When a parent frame switches to flex-col on mobile, flex-1 (flex-basis: 0%)
    // causes 0×0 collapse. Inject flex-auto + full width for the mobile breakpoint.
    if (
        (block.type === 'image' || block.type === 'video') &&
        resolvedClass?.includes('flex-1') &&
        !resolvedClass.includes('@max-sm:!flex-auto')
    ) {
        resolvedClass = resolvedClass + ' @max-sm:!flex-auto @max-sm:!w-full'
    }

    return (
        <LayerWrapper block={block} className={resolvedClass}>
            {resolveBlock(block.type, block, renderChild)}
        </LayerWrapper>
    )
}

function resolveBlock(
    type: BlockType,
    block: Block,
    renderChild: (child: Block) => React.ReactNode,
): React.ReactNode {
    switch (type) {
        case 'heading':
            return <HeadingBlock block={block} />
        case 'text':
            return <TextBlock block={block} />
        case 'button':
            return <ButtonBlock block={block} />
        case 'button-group':
            return <ButtonGroupBlock block={block} renderChild={renderChild} />
        case 'image':
            return <ImageBlock block={block} />
        case 'card':
            return <CardBlock block={block} renderChild={renderChild} />
        case 'badge':
            return <BadgeBlock block={block} />
        case 'list':
            return <ListBlock block={block} />
        case 'divider':
            return <DividerBlock block={block} />
        case 'spacer':
            return <SpacerBlock block={block} />
        case 'icon':
            return <IconBlock block={block} />
        case 'logo':
            return <LogoBlock block={block} />
        case 'video':
            return <VideoBlock block={block} />
        case 'form':
            return <FormBlock block={block} renderChild={renderChild} />
        case 'input':
            return <InputBlock block={block} />
        case 'avatar':
            return <AvatarBlock block={block} />
        case 'social':
            return <SocialBlock block={block} />
        case 'frame':
            return <FrameBlock block={block} renderChild={renderChild} />
        default: {
            // Exhaustive check — should never reach here
            const _exhaustive: never = type
            console.warn(`⚠️ Unknown block type: ${_exhaustive}`)
            return null
        }
    }
}
