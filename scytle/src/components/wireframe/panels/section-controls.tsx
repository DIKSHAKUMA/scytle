'use client'

import { useMemo } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Image, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { WireframeSectionControls } from '@/types'

interface SectionControlsProps {
    sectionType: string
    controls: WireframeSectionControls
    onControlChangeAction: (key: string, value: string | number | boolean) => void
    className?: string
}

/**
 * Control Configuration Types
 */
type ControlType = 'toggle-group' | 'switch' | 'select'

interface BaseControl {
    key: string
    label: string
    type: ControlType
}

interface ToggleGroupControl extends BaseControl {
    type: 'toggle-group'
    options: Array<{
        value: string
        label: string
        icon?: React.ComponentType<{ className?: string }>
    }>
}

interface SwitchControl extends BaseControl {
    type: 'switch'
}

type ControlConfig = ToggleGroupControl | SwitchControl

/**
 * Section Control Configurations
 * 
 * Each section type has its own set of controls.
 * This maps to the WIREFRAME-SPEC.md specification.
 */
const SECTION_CONTROLS: Record<string, ControlConfig[]> = {
    hero: [
        {
            key: 'textAlign',
            label: 'Text Alignment',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: AlignLeft },
                { value: 'center', label: 'Center', icon: AlignCenter },
                { value: 'right', label: 'Right', icon: AlignRight },
            ],
        },
        {
            key: 'assetType',
            label: 'Asset Type',
            type: 'toggle-group',
            options: [
                { value: 'image', label: 'Image', icon: Image },
                { value: 'video', label: 'Video', icon: Video },
            ],
        },
    ],
    features: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
        },
        {
            key: 'showIcons',
            label: 'Show Icons',
            type: 'switch',
        },
    ],
    testimonials: [
        {
            key: 'slider',
            label: 'Slider',
            type: 'toggle-group',
            options: [
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
            ],
        },
        {
            key: 'contentType',
            label: 'Content Type',
            type: 'toggle-group',
            options: [
                { value: 'type1', label: 'Type 1' },
                { value: 'type2', label: 'Type 2' },
            ],
        },
    ],
    faq: [
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'accordion', label: 'Accordion' },
                { value: 'list', label: 'List' },
            ],
        },
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
        },
    ],
    gallery: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'grid', label: 'Grid' },
                { value: 'masonry', label: 'Masonry' },
                { value: 'carousel', label: 'Carousel' },
            ],
        },
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
        },
    ],
    pricing: [
        {
            key: 'tiers',
            label: 'Tiers',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
        },
        {
            key: 'highlight',
            label: 'Highlight Popular',
            type: 'switch',
        },
    ],
    cta: [
        {
            key: 'textAlign',
            label: 'Text Alignment',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: AlignLeft },
                { value: 'center', label: 'Center', icon: AlignCenter },
            ],
        },
        {
            key: 'showSecondaryButton',
            label: 'Secondary Button',
            type: 'switch',
        },
    ],
    contact: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'side-by-side', label: 'Side by Side' },
                { value: 'stacked', label: 'Stacked' },
            ],
        },
        {
            key: 'showMap',
            label: 'Show Map',
            type: 'switch',
        },
    ],
    team: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
        },
        {
            key: 'showSocial',
            label: 'Show Social Links',
            type: 'switch',
        },
    ],
    stats: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
        },
        {
            key: 'showIcons',
            label: 'Show Icons',
            type: 'switch',
        },
    ],
    logos: [
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'grid', label: 'Grid' },
                { value: 'marquee', label: 'Marquee' },
            ],
        },
        {
            key: 'grayscale',
            label: 'Grayscale',
            type: 'switch',
        },
    ],
    blog: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
        },
        {
            key: 'showExcerpt',
            label: 'Show Excerpt',
            type: 'switch',
        },
    ],
    footer: [
        {
            key: 'columns',
            label: 'Link Columns',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
            ],
        },
        {
            key: 'showNewsletter',
            label: 'Newsletter Signup',
            type: 'switch',
        },
    ],
    navbar: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Logo Left' },
                { value: 'center', label: 'Logo Center' },
            ],
        },
        {
            key: 'sticky',
            label: 'Sticky Header',
            type: 'switch',
        },
    ],
}

/**
 * SectionControls Component
 * 
 * Renders dynamic controls based on section type.
 * Uses Shadcn ToggleGroup and Switch components.
 */
export function SectionControls({
    sectionType,
    controls,
    onControlChangeAction,
    className,
}: SectionControlsProps) {
    // Normalize section type and get controls
    const normalizedType = sectionType.toLowerCase().replace(/[-_\s]+/g, '')

    const controlConfigs = useMemo(() => {
        // Try exact match first
        if (SECTION_CONTROLS[sectionType]) {
            return SECTION_CONTROLS[sectionType]
        }

        // Try normalized match
        for (const [key, value] of Object.entries(SECTION_CONTROLS)) {
            if (key.toLowerCase().replace(/[-_\s]+/g, '') === normalizedType) {
                return value
            }
        }

        // Try partial match
        for (const [key, value] of Object.entries(SECTION_CONTROLS)) {
            if (normalizedType.includes(key) || key.includes(normalizedType)) {
                return value
            }
        }

        return []
    }, [sectionType, normalizedType])

    if (controlConfigs.length === 0) {
        return (
            <div className={cn('space-y-3', className)}>
                <p className="text-xs text-muted-foreground">
                    No controls available for this section type.
                </p>
            </div>
        )
    }

    return (
        <div className={cn('space-y-4', className)}>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Controls
            </Label>

            {controlConfigs.map((config) => (
                <div key={config.key} className="space-y-2">
                    {config.type === 'toggle-group' && (
                        <ToggleGroupControl
                            config={config}
                            value={String(controls[config.key] ?? config.options[0]?.value)}
                            onChange={(value) => onControlChangeAction(config.key, value)}
                        />
                    )}

                    {config.type === 'switch' && (
                        <SwitchControlComponent
                            config={config}
                            value={Boolean(controls[config.key])}
                            onChange={(value) => onControlChangeAction(config.key, value)}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

/**
 * ToggleGroupControl Component
 */
interface ToggleGroupControlProps {
    config: ToggleGroupControl
    value: string
    onChange: (value: string) => void
}

function ToggleGroupControl({ config, value, onChange }: ToggleGroupControlProps) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium">{config.label}</Label>
            <ToggleGroup
                type="single"
                value={value}
                onValueChange={(v) => v && onChange(v)}
                className="justify-start"
            >
                {config.options.map((option) => (
                    <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        aria-label={option.label}
                        className="h-8 px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                        {option.icon ? (
                            <option.icon className="h-3.5 w-3.5" />
                        ) : (
                            option.label
                        )}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    )
}

/**
 * SwitchControl Component
 */
interface SwitchControlProps {
    config: SwitchControl
    value: boolean
    onChange: (value: boolean) => void
}

function SwitchControlComponent({ config, value, onChange }: SwitchControlProps) {
    return (
        <div className="flex items-center justify-between">
            <Label htmlFor={config.key} className="text-xs font-medium">
                {config.label}
            </Label>
            <Switch
                id={config.key}
                checked={value}
                onCheckedChange={onChange}
            />
        </div>
    )
}
