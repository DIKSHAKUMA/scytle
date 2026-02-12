'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
    Home, ShoppingCart, UtensilsCrossed, Briefcase, Building2, ChartBar,
    Mail, Phone, MessageCircle, MapPin, Globe, Users, User,
    Heart, Star, Zap, Shield, Target, Award, Crown,
    Camera, Image, Video, Music, Mic, Play,
    Lock, Key, Eye, EyeOff, Fingerprint,
    Bell, Clock, Calendar, Timer,
    ArrowRight, ArrowUp, ChevronRight, ExternalLink,
    Check, X, Plus, Minus, Search,
    Settings, Sliders, Wrench, Cog,
    BookOpen, FileText, Notebook, Bookmark,
    Cloud, Download, Upload, Share2,
    Cpu, Monitor, Smartphone, Tablet,
    Layers, Box, Grid3x3, Layout,
    Palette, Paintbrush, Pen, Scissors,
    Truck, Package, ShoppingBag, CreditCard,
    Lightbulb, Rocket, Flame, Sparkles,
    Code, Terminal, Database, Server,
    Headphones, Wifi, Bluetooth, Radio,
    ThumbsUp, ThumbsDown, MessageSquare, Send,
    type LucideIcon,
} from 'lucide-react'

// Curated icon list — ~80 popular icons for wireframes
const ICON_MAP: Record<string, LucideIcon> = {
    Home, ShoppingCart, UtensilsCrossed, Briefcase, Building2, ChartBar,
    Mail, Phone, MessageCircle, MapPin, Globe, Users, User,
    Heart, Star, Zap, Shield, Target, Award, Crown,
    Camera, Image, Video, Music, Mic, Play,
    Lock, Key, Eye, EyeOff, Fingerprint,
    Bell, Clock, Calendar, Timer,
    ArrowRight, ArrowUp, ChevronRight, ExternalLink,
    Check, X, Plus, Minus, Search,
    Settings, Sliders, Wrench, Cog,
    BookOpen, FileText, Notebook, Bookmark,
    Cloud, Download, Upload, Share2,
    Cpu, Monitor, Smartphone, Tablet,
    Layers, Box, Grid3x3, Layout,
    Palette, Paintbrush, Pen, Scissors,
    Truck, Package, ShoppingBag, CreditCard,
    Lightbulb, Rocket, Flame, Sparkles,
    Code, Terminal, Database, Server,
    Headphones, Wifi, Bluetooth, Radio,
    ThumbsUp, ThumbsDown, MessageSquare, Send,
}

const ALL_ICON_NAMES = Object.keys(ICON_MAP)

/** Resolve a string icon name to a Lucide component. Falls back to Layers. */
export function resolveIcon(name: string | undefined): LucideIcon {
    if (!name) return Layers
    return ICON_MAP[name] ?? Layers
}

export interface EditableIconProps {
    /** Lucide icon name string, e.g. 'Home', 'Zap', 'Shield' */
    iconName: string
    /** Called when user picks a different icon */
    onChange?: (iconName: string) => void
    /** Whether the icon picker is enabled */
    editable?: boolean
    /** Size class for the icon wrapper */
    size?: 'sm' | 'md' | 'lg'
    /** Additional wrapper className */
    className?: string
    /** Additional icon className */
    iconClassName?: string
}

/**
 * EditableIcon — Renders a Lucide icon that can be swapped via a picker popover.
 *
 * Usage in Canvas families:
 * ```tsx
 * <EditableIcon
 *     iconName={(content?.icons as string[])?.[i] || 'Layers'}
 *     onChange={(name) => {
 *         const icons = ((content?.icons as string[]) ?? []).slice()
 *         icons[i] = name
 *         onContentChange?.('icons', icons)
 *     }}
 *     editable={editable}
 * />
 * ```
 */
export function EditableIcon({
    iconName,
    onChange,
    editable = true,
    size = 'md',
    className,
    iconClassName,
}: EditableIconProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const Icon = resolveIcon(iconName)

    const sizeMap = {
        sm: { wrapper: 'w-6 h-6', icon: 'w-3 h-3' },
        md: { wrapper: 'w-8 h-8', icon: 'w-4 h-4' },
        lg: { wrapper: 'w-10 h-10', icon: 'w-5 h-5' },
    }

    const filtered = useMemo(() => {
        if (!query) return ALL_ICON_NAMES
        const q = query.toLowerCase()
        return ALL_ICON_NAMES.filter((name) => name.toLowerCase().includes(q))
    }, [query])

    // Focus search on open
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => searchRef.current?.focus())
        } else {
            setQuery('')
        }
    }, [isOpen])

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen])

    const handleSelect = useCallback((name: string) => {
        onChange?.(name)
        setIsOpen(false)
    }, [onChange])

    if (!editable) {
        return (
            <div className={cn(sizeMap[size].wrapper, 'bg-gray-100 rounded flex items-center justify-center', className)}>
                <Icon className={cn(sizeMap[size].icon, 'text-gray-600', iconClassName)} />
            </div>
        )
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Icon button */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }}
                className={cn(
                    sizeMap[size].wrapper,
                    'bg-gray-100 rounded flex items-center justify-center transition-all',
                    'hover:ring-2 hover:ring-violet-400/50 hover:bg-violet-50',
                    isOpen && 'ring-2 ring-violet-500 bg-violet-50',
                    className,
                )}
                title="Click to change icon"
            >
                <Icon className={cn(sizeMap[size].icon, 'text-gray-600', iconClassName)} />
            </button>

            {/* Picker popover */}
            {isOpen && (
                <div
                    className="absolute z-50 top-full left-0 mt-1 w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded border border-gray-200">
                            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                placeholder="Search icons..."
                                className="text-xs bg-transparent outline-none flex-1 text-gray-700 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Icon grid */}
                    <div className="p-2 max-h-[280px] overflow-y-auto overscroll-contain">
                        {filtered.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">No icons found</p>
                        ) : (
                            <div className="grid grid-cols-8 gap-0.5">
                                {filtered.map((name) => {
                                    const Ic = ICON_MAP[name]
                                    const isActive = name === iconName
                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => handleSelect(name)}
                                            className={cn(
                                                'w-6 h-6 flex items-center justify-center rounded transition-colors',
                                                isActive
                                                    ? 'bg-violet-100 text-violet-700'
                                                    : 'hover:bg-gray-100 text-gray-600',
                                            )}
                                            title={name}
                                        >
                                            <Ic className="w-3.5 h-3.5" />
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
