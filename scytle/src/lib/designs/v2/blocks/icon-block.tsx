/**
 * IconBlock — Token-driven icon placeholder
 *
 * Reads from CSS custom properties:
 *   --sg-text-primary
 *   --sg-text-muted
 *   --sg-bg-accent
 *   --sg-text-on-accent
 *
 * Renders a lucide icon based on the `name` prop, or falls back to Star.
 * Supports common icons used in section layouts (chevrons, close, layout, etc.).
 */

'use client'

import { cn } from '@/lib/utils'
import {
    Star,
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
    X, Plus, Minus,
    ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
    Check, CheckCircle,
    Mail, Phone, MapPin,
    ExternalLink, Link,
    Play, Pause,
    Search, Menu, Settings, User,
    Heart, Share2, Bookmark,
    LayoutGrid, Grid3x3, Columns2, Rows2,
    type LucideIcon,
} from 'lucide-react'
import type { Block, IconBlockProps } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Size map
// ============================================

const ICON_SIZE: Record<string, number> = {
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
}

// ============================================
// Icon name → component map
// ============================================

const ICON_MAP: Record<string, LucideIcon> = {
    'star': Star,
    // Chevrons / arrows
    'chevron-up': ChevronUp,
    'chevron-down': ChevronDown,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'arrow-right': ArrowRight,
    'arrow-left': ArrowLeft,
    'arrow-up': ArrowUp,
    'arrow-down': ArrowDown,
    // Actions
    'x': X,
    'close': X,
    'plus': Plus,
    'minus': Minus,
    'check': Check,
    'check-circle': CheckCircle,
    // Contact
    'mail': Mail,
    'phone': Phone,
    'map-pin': MapPin,
    // Links
    'external-link': ExternalLink,
    'link': Link,
    // Media
    'play': Play,
    'pause': Pause,
    // UI
    'search': Search,
    'menu': Menu,
    'settings': Settings,
    'user': User,
    // Social
    'heart': Heart,
    'share': Share2,
    'bookmark': Bookmark,
    // Layout
    'layout': LayoutGrid,
    'layout-grid': LayoutGrid,
    'grid': Grid3x3,
    'columns': Columns2,
    'rows': Rows2,
}

// ============================================
// Component
// ============================================

export function IconBlock({ block, className }: Props) {
    const props = block.props as unknown as IconBlockProps

    const rawSize = typeof props.size === 'number' ? props.size : (ICON_SIZE[props.size ?? 'md'] ?? ICON_SIZE.md)
    const filled = props.filled ?? false

    const IconComponent = ICON_MAP[props.name ?? 'star'] ?? Star

    return (
        <span
            className={cn('inline-flex items-center justify-center flex-shrink-0', className)}
            style={{
                width: `${rawSize}px`,
                height: `${rawSize}px`,
                color: props.color ?? (filled ? 'var(--sg-text-on-accent)' : 'var(--sg-text-muted)'),
                backgroundColor: filled ? 'var(--sg-bg-accent)' : 'transparent',
                borderRadius: filled ? '8px' : '0',
            }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Icon"
        >
            <IconComponent size={rawSize * 0.75} />
        </span>
    )
}
