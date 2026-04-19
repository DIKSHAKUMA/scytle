'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SupportCard } from '@/components/settings/support-card'
import { ContactDialog } from '@/components/settings/contact-dialog'
import { cn } from '@/lib/utils'

export default function SupportPage() {
    const [isContactOpen, setIsContactOpen] = useState(false)

    return (
        <div className="pb-32">
            {/* Relume Style Hero Header */}
            <div className="max-w-4xl mx-auto text-center py-24 mb-12">
                <h1 className="text-[60px] md:text-[80px] font-display font-bold tracking-tight text-black leading-[1.1] mb-8">
                    Help & Support
                </h1>
                <p className="text-[#4B5563] text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                    We are here to help. Get community support, report bugs, get help with account 
                    and billing issues or leave feedback.
                </p>
            </div>

            {/* Relume Style 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4">
                {/* Left Column: Stacked Cards */}
                <div className="flex flex-col gap-8">
                    <SupportCard 
                        title="Get Support"
                        description="Have a question or found a bug? We've got your back. We typically reply in 24 hours or less."
                        actionText="Submit Request"
                        onAction={() => setIsContactOpen(true)}
                        variant="gray"
                        className="flex-1"
                    />
                    
                    <SupportCard 
                        title="Resources"
                        description="Get step-by-step tutorials on how to use Scytle AI, answers to FAQs, and detailed product documentation."
                        actionText="Visit Resources"
                        onAction={() => window.open('#', '_blank')}
                        variant="gray"
                        className="flex-1"
                    />
                </div>

                {/* Right Column: Tall Community Card */}
                <SupportCard 
                    title="Community"
                    description="Learn from fellow creators or showcase your work with our community. Showcase your project, give feedback and see what others are building."
                    actionText="Join Our Community"
                    onAction={() => window.open('https://discord.gg/scytle', '_blank')}
                    variant="white"
                    imageSrc="/images/community_mosaic.png"
                    imageAlt="Scytle Community Members"
                    className="h-full border border-border/60 shadow-sm"
                />
            </div>

            {/* Final CTA Banner (Ultra-minimalist Relume Style) */}
            <div className="mt-40 mb-10 max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-[56px] md:text-[80px] font-display font-bold text-black tracking-tight leading-[1] mb-8">
                    Build faster.
                </h2>
                <p className="text-[#4B5563] text-xl font-medium max-w-lg mx-auto mb-10">
                    Join thousands of designers generating production-ready UIs with Scytle.
                </p>
                
                <Link href="/dashboard">
                    <Button 
                        className="h-14 px-8 rounded-xl bg-black text-white hover:bg-black/80 text-[17px] font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        Try Scytle for free
                    </Button>
                </Link>
            </div>

            {/* Contact Form Dialog */}
            <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
        </div>
    )
}
