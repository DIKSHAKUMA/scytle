'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStyleGuideStore } from '@/store'
import { FONT_PAIRS, loadGoogleFonts, type FontPair, type FontPairCategory } from '@/lib/designs/v2/tokens/font-pairs'

interface FontBrowserSubpanelProps {
    target: 'heading' | 'body'
    onBackAction: () => void
}

const CATEGORIES: { value: FontPairCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'creative', label: 'Creative' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'editorial', label: 'Editorial' },
]

// Build a unique list of all font families from FONT_PAIRS for individual selection
const ALL_FONTS: { family: string; googleName: string }[] = (() => {
    const seen = new Set<string>()
    const fonts: { family: string; googleName: string }[] = []
    for (const pair of FONT_PAIRS) {
        if (!seen.has(pair.heading.family)) {
            seen.add(pair.heading.family)
            fonts.push({ family: pair.heading.family, googleName: pair.heading.googleName })
        }
        if (!seen.has(pair.body.family)) {
            seen.add(pair.body.family)
            fonts.push({ family: pair.body.family, googleName: pair.body.googleName })
        }
    }
    return fonts.sort((a, b) => a.googleName.localeCompare(b.googleName))
})()

type BrowseMode = 'pairs' | 'individual'

/**
 * FontBrowserSubpanel — Browse and select fonts.
 *
 * Two modes:
 *   - "Pairs" (default): browse 80 curated font pairs, applies both heading+body
 *   - "Individual": browse all unique font families independently, applies only heading or body
 *
 * Toggle between modes via the Pairs / Individual switch.
 */
export function FontBrowserSubpanel({ target, onBackAction }: FontBrowserSubpanelProps) {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<FontPairCategory | 'all'>('all')
    const [mode, setMode] = useState<BrowseMode>('pairs')

    const { applyFontPair, setHeadingFont, setBodyFont, getActiveConcept, activeFontPairId } = useStyleGuideStore()
    const concept = getActiveConcept()
    const currentFont = target === 'heading' ? concept.typography.headingFont : concept.typography.bodyFont

    // --- Pairs mode filtering ---
    const filteredPairs = useMemo(() => {
        if (mode !== 'pairs') return []
        let pairs = FONT_PAIRS

        if (category !== 'all') {
            pairs = pairs.filter(p => p.category === category)
        }

        if (search.trim()) {
            const q = search.toLowerCase()
            pairs = pairs.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.heading.family.toLowerCase().includes(q) ||
                p.body.family.toLowerCase().includes(q)
            )
        }

        return pairs
    }, [category, search, mode])

    // --- Individual mode filtering ---
    const filteredFonts = useMemo(() => {
        if (mode !== 'individual') return []
        if (!search.trim()) return ALL_FONTS

        const q = search.toLowerCase()
        return ALL_FONTS.filter(f =>
            f.family.toLowerCase().includes(q) ||
            f.googleName.toLowerCase().includes(q)
        )
    }, [search, mode])

    // Preload Google Fonts for visible pairs
    useEffect(() => {
        if (mode === 'pairs') {
            const toLoad = filteredPairs.slice(0, 20)
            for (const pair of toLoad) {
                loadGoogleFonts(pair)
            }
        }
    }, [filteredPairs, mode])

    // Preload individual fonts
    useEffect(() => {
        if (mode === 'individual') {
            const toLoad = filteredFonts.slice(0, 30)
            for (const font of toLoad) {
                // Inject a <link> for the Google Font
                const linkId = `gf-${font.family.replace(/\s/g, '-')}`
                if (!document.getElementById(linkId)) {
                    const link = document.createElement('link')
                    link.id = linkId
                    link.rel = 'stylesheet'
                    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.googleName)}:wght@400;500;600;700&display=swap`
                    document.head.appendChild(link)
                }
            }
        }
    }, [filteredFonts, mode])

    const handleSelectPair = useCallback((pair: FontPair) => {
        applyFontPair(pair)
        onBackAction()
    }, [applyFontPair, onBackAction])

    const handleSelectIndividualFont = useCallback((family: string) => {
        if (target === 'heading') {
            setHeadingFont(family)
        } else {
            setBodyFont(family)
        }
        onBackAction()
    }, [target, setHeadingFont, setBodyFont, onBackAction])

    // Find current active pair
    const activePair = FONT_PAIRS.find(p => p.id === activeFontPairId)

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={onBackAction}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
                <h3 className="text-xs font-semibold text-foreground">
                    {target === 'heading' ? 'Heading' : 'Body'} Font
                </h3>
            </div>

            {/* Pairs / Individual toggle */}
            <div className="flex items-center bg-muted rounded-md p-0.5">
                <button
                    type="button"
                    onClick={() => { setMode('pairs'); setCategory('all') }}
                    className={cn(
                        'flex-1 text-[10px] font-medium py-1 rounded-[4px] transition-colors',
                        mode === 'pairs'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    Pairs
                </button>
                <button
                    type="button"
                    onClick={() => setMode('individual')}
                    className={cn(
                        'flex-1 text-[10px] font-medium py-1 rounded-[4px] transition-colors',
                        mode === 'individual'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    Individual
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={mode === 'pairs' ? 'Search font pairs...' : 'Search fonts...'}
                    className="h-7 pl-7 text-xs"
                />
            </div>

            {/* Category filters (pairs mode only) */}
            {mode === 'pairs' && (
                <div className="flex flex-wrap gap-1">
                    {CATEGORIES.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setCategory(value)}
                            className={cn(
                                'px-2 py-1 text-[10px] font-medium rounded-md transition-colors',
                                category === value
                                    ? 'bg-foreground text-background'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Results count */}
            <div className="text-[10px] text-muted-foreground">
                {mode === 'pairs'
                    ? `${filteredPairs.length} pair${filteredPairs.length !== 1 ? 's' : ''}`
                    : `${filteredFonts.length} font${filteredFonts.length !== 1 ? 's' : ''}`
                }
            </div>

            {/* ==== Pairs list ==== */}
            {mode === 'pairs' && (
                <div className="space-y-1.5">
                    {filteredPairs.map((pair) => {
                        const isActive = pair.id === activeFontPairId
                        return (
                            <button
                                key={pair.id}
                                type="button"
                                onClick={() => handleSelectPair(pair)}
                                className={cn(
                                    'w-full rounded-lg border p-2.5 text-left transition-all cursor-pointer',
                                    isActive
                                        ? 'border-foreground/30 bg-muted/50 ring-1 ring-foreground/10'
                                        : 'border-border hover:border-foreground/20 hover:bg-muted/30'
                                )}
                            >
                                <div
                                    className="text-sm leading-snug text-foreground truncate"
                                    style={{ fontFamily: pair.heading.family }}
                                >
                                    {pair.heading.googleName}
                                </div>
                                <div
                                    className="text-[11px] leading-snug text-muted-foreground mt-0.5 truncate"
                                    style={{ fontFamily: pair.body.family }}
                                >
                                    {pair.body.googleName}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="text-[9px] font-medium text-muted-foreground/60 bg-muted px-1 py-0.5 rounded capitalize">
                                        {pair.category}
                                    </span>
                                    {isActive && (
                                        <span className="text-[9px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                            Active
                                        </span>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* ==== Individual font list ==== */}
            {mode === 'individual' && (
                <div className="space-y-1">
                    {filteredFonts.map((font) => {
                        const isActive = currentFont === font.family
                        return (
                            <button
                                key={font.family}
                                type="button"
                                onClick={() => handleSelectIndividualFont(font.family)}
                                className={cn(
                                    'w-full rounded-lg border px-3 py-2 text-left transition-all cursor-pointer flex items-center justify-between',
                                    isActive
                                        ? 'border-foreground/30 bg-muted/50 ring-1 ring-foreground/10'
                                        : 'border-border hover:border-foreground/20 hover:bg-muted/30'
                                )}
                            >
                                <span
                                    className="text-sm text-foreground truncate"
                                    style={{ fontFamily: font.family }}
                                >
                                    {font.googleName}
                                </span>
                                {isActive && (
                                    <span className="text-[9px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded shrink-0 ml-2">
                                        Active
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Active font indicator */}
            {mode === 'pairs' && activePair && (
                <div className="text-[10px] text-muted-foreground text-center py-1 border-t">
                    Active pair: <span className="font-medium text-foreground">{activePair.name}</span>
                </div>
            )}
            {mode === 'individual' && (
                <div className="text-[10px] text-muted-foreground text-center py-1 border-t">
                    Current {target}: <span className="font-medium text-foreground">{currentFont}</span>
                </div>
            )}
        </div>
    )
}
