'use client'

/**
 * Settings > Billing — Usage dashboard, plan info, and upgrade flow
 */

import { useEffect, useState } from 'react'
import { Zap, CreditCard, Check, ArrowRight, Calendar, TrendingUp } from 'lucide-react'
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

    return (
        <>
            <UpgradeModal />

            <div
                className="space-y-8 transition-all duration-500 ease-out"
                style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                }}
            >
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-display font-bold tracking-tight">Billing & Usage</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your plan, track AI credit usage, and upgrade.
                    </p>
                </div>

                {/* Current Plan Card */}
                <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                    <div className={`h-1.5 ${
                        plan === 'pro'
                            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                            : 'bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10'
                    }`} />
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    plan === 'pro'
                                        ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                                        : 'bg-muted'
                                }`}>
                                    <CreditCard className={`w-6 h-6 ${
                                        plan === 'pro' ? 'text-indigo-500' : 'text-muted-foreground'
                                    }`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold">
                                            {plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                                        </h2>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                                            plan === 'pro'
                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400'
                                                : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {plan}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {plan === 'pro'
                                            ? '300 credits/month · Unlimited projects · All AI models'
                                            : '50 credits/month · 3 projects · 5 credits/day limit'
                                        }
                                    </p>
                                </div>
                            </div>

                            {plan === 'free' && (
                                <button
                                    onClick={openUpgradeModal}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-foreground/10"
                                >
                                    <Zap className="w-4 h-4" />
                                    Upgrade to Pro
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Usage Card */}
                <div className="rounded-2xl border border-border/60 bg-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Usage This Month</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Monthly Credits */}
                        <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm text-muted-foreground">Monthly Credits</span>
                                <span className="text-2xl font-display font-bold tabular-nums">
                                    {remaining}
                                    <span className="text-sm font-normal text-muted-foreground">/{creditsLimit}</span>
                                </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        usagePercent >= 90
                                            ? 'bg-red-500'
                                            : usagePercent >= 70
                                                ? 'bg-amber-500'
                                                : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.max(2, 100 - usagePercent)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {creditsUsed} of {creditsLimit} credits used
                            </p>
                        </div>

                        {/* Daily Usage (free only) */}
                        {dailyCap !== null && (
                            <div className="space-y-3">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-sm text-muted-foreground">Today</span>
                                    <span className="text-2xl font-display font-bold tabular-nums">
                                        {Math.max(0, dailyCap - dailyUsed)}
                                        <span className="text-sm font-normal text-muted-foreground">/{dailyCap}</span>
                                    </span>
                                </div>
                                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                        style={{ width: `${Math.max(2, ((dailyCap - dailyUsed) / dailyCap) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Daily limit resets at midnight
                                </p>
                            </div>
                        )}

                        {/* Plan Info */}
                        <div className="space-y-3">
                            <span className="text-sm text-muted-foreground block">Plan Details</span>
                            <ul className="space-y-2">
                                {(plan === 'pro' ? [
                                    '300 AI credits/month',
                                    'Unlimited projects',
                                    'No daily limit',
                                    'All AI models',
                                ] : [
                                    '50 AI credits/month',
                                    '3 projects max',
                                    '5 credits/day limit',
                                    'All AI models',
                                ]).map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-xs">
                                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                        <span className="text-foreground/70">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Pro Benefits (free users only) */}
                {plan === 'free' && (
                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-indigo-500" />
                            Why upgrade to Pro?
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { title: '6× more credits', desc: '300 vs 50 credits per month' },
                                { title: 'No daily cap', desc: 'Use as many credits as you want per day' },
                                { title: 'Unlimited projects', desc: 'Create as many projects as you need' },
                                { title: 'Priority support', desc: 'Get help when you need it' },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={openUpgradeModal}
                            className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                            Upgrade to Pro — ₹1,340/mo
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
