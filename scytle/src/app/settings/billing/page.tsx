'use client'

import { useEffect, useState } from 'react'
import { Zap, Check, ArrowRight } from 'lucide-react'
import { useCreditStore } from '@/store/credits-store'
import { UpgradeModal } from '@/components/billing/upgrade-modal'

export default function BillingPage() {
    const {
        plan, creditsUsed, creditsLimit, remaining, dailyUsed, dailyCap,
        fetchCredits, isLoading, openUpgradeModal,
    } = useCreditStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        fetchCredits()
        setMounted(true)
    }, [fetchCredits])

    const usagePercent = creditsLimit > 0 ? (creditsUsed / creditsLimit) * 100 : 0

    // Prevent hydration mismatch and avoid flashing the default "Free" state
    if (!mounted) {
        return (
            <div className="space-y-8 pb-16 animate-pulse">
                <div className="space-y-3">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-10 w-full max-w-sm bg-muted rounded-xl" />
                </div>
                <div className="h-px bg-border/40" />
                <div className="space-y-4">
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-24 w-full max-w-md bg-muted rounded-xl" />
                </div>
            </div>
        )
    }

    return (
        <>
            <UpgradeModal />

            <div className="space-y-8 pb-16">
                {/* Current Plan */}
                <div className="space-y-3">
                    <h3 className="text-[13px] font-medium text-foreground">Current plan</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[15px] font-semibold text-foreground">
                                {plan === 'pro' ? 'Pro' : 'Free'}
                            </p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                {plan === 'pro'
                                    ? `${creditsLimit} credits/month · Unlimited projects`
                                    : `${creditsLimit} credits/month · 3 projects · ${dailyCap} credits/day`
                                }
                            </p>
                        </div>
                        {plan === 'free' && (
                            <button
                                onClick={openUpgradeModal}
                                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity"
                            >
                                Upgrade
                            </button>
                        )}
                    </div>
                </div>

                <div className="h-px bg-border/40" />

                {/* Usage */}
                <div className="space-y-4">
                    <h3 className="text-[13px] font-medium text-foreground">Usage</h3>

                    {/* Monthly */}
                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                            <span className="text-[12px] text-muted-foreground">Monthly credits</span>
                            <span className="text-[13px] font-medium tabular-nums">
                                {remaining}
                                <span className="text-muted-foreground font-normal"> / {creditsLimit}</span>
                            </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    usagePercent >= 90 ? 'bg-red-500'
                                        : usagePercent >= 70 ? 'bg-amber-500'
                                            : 'bg-foreground/20'
                                }`}
                                style={{ width: `${Math.max(2, 100 - usagePercent)}%` }}
                            />
                        </div>
                    </div>

                    {/* Daily (free only) */}
                    {dailyCap !== null && (
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <span className="text-[12px] text-muted-foreground">Today</span>
                                <span className="text-[13px] font-medium tabular-nums">
                                    {Math.max(0, dailyCap - dailyUsed)}
                                    <span className="text-muted-foreground font-normal"> / {dailyCap}</span>
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-foreground/20 transition-all duration-500"
                                    style={{ width: `${Math.max(2, ((dailyCap - dailyUsed) / dailyCap) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground/50">Resets at midnight</p>
                        </div>
                    )}
                </div>

                {/* Plan includes */}
                <div className="h-px bg-border/40" />

                <div className="space-y-3">
                    <h3 className="text-[13px] font-medium text-foreground">Plan includes</h3>
                    <ul className="space-y-2">
                        {(plan === 'pro' ? [
                            `${creditsLimit} AI credits per month`,
                            'Unlimited projects',
                            'No daily limit',
                            'All AI models',
                        ] : [
                            `${creditsLimit} AI credits per month`,
                            '3 projects max',
                            `${dailyCap} credits per day`,
                            'All AI models',
                        ]).map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-[13px] text-foreground/70">
                                <Check className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Upgrade CTA (free only) */}
                {plan === 'free' && (
                    <>
                        <div className="h-px bg-border/40" />
                        <div className="space-y-3">
                            <h3 className="text-[13px] font-medium text-foreground">Upgrade to Pro</h3>
                            <p className="text-[12px] text-muted-foreground">
                                Get 10× more credits, unlimited projects, and no daily cap.
                            </p>
                            <button
                                onClick={openUpgradeModal}
                                className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity"
                            >
                                Upgrade — ₹1,340/mo
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
