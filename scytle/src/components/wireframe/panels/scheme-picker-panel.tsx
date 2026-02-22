/**
 * SchemePickerPanel — Full scheme selector with color swatches
 *
 * Replaces the minimal 3-chip SectionSchemeOverlay with a proper
 * sub-panel matching Relume's design: list of named schemes with
 * color swatches, checkmark on active, and inherit option.
 *
 * Shown when activePanelView === 'scheme-picker' and a section is selected.
 */

'use client'

import { ArrowLeft, X, Check, Sun, Moon, Palette, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useStyleGuideStore } from '@/store/style-guide-store'
import { useUnifiedStore } from '@/store'
import type { ColorScheme } from '@/lib/designs/v2/tokens'
import { computeSchemeOverrideCSS } from '@/lib/designs/v2/tokens/defaults'

// ============================================
// Scheme definitions with metadata
// ============================================

interface SchemeOption {
    scheme: ColorScheme | null
    label: string
    description: string
    icon: typeof Sun
}

const SCHEME_OPTIONS: SchemeOption[] = [
    {
        scheme: null,
        label: 'Inherit',
        description: 'Use the global concept colors',
        icon: RotateCcw,
    },
    {
        scheme: 'light',
        label: 'Light',
        description: 'White background, dark text',
        icon: Sun,
    },
    {
        scheme: 'dark',
        label: 'Dark',
        description: 'Dark background, light text',
        icon: Moon,
    },
    {
        scheme: 'accent',
        label: 'Accent',
        description: 'Accent color background, white text',
        icon: Palette,
    },
]

// ============================================
// Color swatch strip — shows 5 semantic colors
// ============================================

function SchemeSwatchStrip({ scheme }: { scheme: ColorScheme | null }) {
    const concept = useStyleGuideStore(s => s.getActiveConcept())

    if (!scheme || !concept) {
        // Inherit: show the concept's base colors
        return (
            <div className="flex items-center gap-0.5">
                <div className="w-4 h-4 rounded-sm border border-gray-200" style={{ backgroundColor: '#ffffff' }} />
                <div className="w-4 h-4 rounded-sm border border-gray-200" style={{ backgroundColor: '#111827' }} />
                <div className="w-4 h-4 rounded-sm border border-gray-200" style={{ backgroundColor: '#f9fafb' }} />
                <div className="w-4 h-4 rounded-sm border border-gray-200" style={{ backgroundColor: '#e5e7eb' }} />
                <div className="w-4 h-4 rounded-sm border border-gray-200" style={{ backgroundColor: concept?.colors.accents.find(a => a.isMain)?.hex ?? '#6366f1' }} />
            </div>
        )
    }

    const css = computeSchemeOverrideCSS(scheme, concept)

    const colors = [
        css['--sg-bg-primary'],
        css['--sg-text-primary'],
        css['--sg-bg-secondary'],
        css['--sg-border'],
        css['--sg-button-primary-bg'],
    ]

    return (
        <div className="flex items-center gap-0.5">
            {colors.map((color, i) => (
                <div
                    key={i}
                    className="w-4 h-4 rounded-sm border border-gray-200"
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    )
}

// ============================================
// Main Component
// ============================================

interface SchemePickerPanelProps {
    sectionId: string
    onBackAction: () => void
    onCloseAction: () => void
    className?: string
}

export function SchemePickerPanel({
    sectionId,
    onBackAction,
    onCloseAction,
    className,
}: SchemePickerPanelProps) {
    const currentScheme = useStyleGuideStore(
        s => s.data.sectionSchemeOverrides[sectionId] ?? null
    ) as ColorScheme | null
    const setSectionScheme = useStyleGuideStore(s => s.setSectionScheme)

    const handleSelect = (scheme: ColorScheme | null) => {
        setSectionScheme(sectionId, scheme)
    }

    return (
        <div className={cn(
            'flex flex-col h-full min-h-0 w-full max-w-full bg-background overflow-hidden',
            className,
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 w-full">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onBackAction}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-sm font-semibold text-foreground">Scheme</h2>
                </div>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onCloseAction}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Scheme List */}
            <ScrollArea className="flex-1 min-h-0 w-full">
                <div className="p-3 space-y-1.5">
                    <p className="text-xs text-muted-foreground px-1 mb-2">
                        Override the color scheme for this section. &quot;Inherit&quot; uses the global concept.
                    </p>

                    {SCHEME_OPTIONS.map(({ scheme, label, description, icon: Icon }) => {
                        const isActive = currentScheme === scheme
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => handleSelect(scheme)}
                                className={cn(
                                    'w-full flex items-center gap-3 p-3 rounded-lg text-left',
                                    'transition-all cursor-pointer',
                                    isActive
                                        ? 'bg-violet-50 ring-1 ring-violet-200 dark:bg-violet-950/30 dark:ring-violet-800'
                                        : 'hover:bg-muted/60',
                                )}
                            >
                                {/* Icon */}
                                <div className={cn(
                                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                    isActive
                                        ? 'bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300'
                                        : 'bg-muted text-muted-foreground',
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>

                                {/* Label + Description */}
                                <div className="flex-1 min-w-0">
                                    <div className={cn(
                                        'text-sm font-medium',
                                        isActive ? 'text-violet-700 dark:text-violet-300' : 'text-foreground',
                                    )}>
                                        {label}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {description}
                                    </div>
                                </div>

                                {/* Swatch strip */}
                                <SchemeSwatchStrip scheme={scheme} />

                                {/* Active check */}
                                {isActive && (
                                    <Check className="h-4 w-4 text-violet-600 shrink-0" />
                                )}
                            </button>
                        )
                    })}

                    <Separator className="my-3" />

                    {/* Quick info */}
                    <div className="px-1 space-y-2">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Each scheme maps semantic colors (background, text, border, accent) to different
                            values. The accent color comes from your style guide.
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-8 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                // Navigate to style guide panel to edit colors
                                useUnifiedStore.getState().setActivePanelView('style-guide')
                            }}
                        >
                            <Palette className="h-3.5 w-3.5 mr-2" />
                            Edit colors in Style Guide
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
