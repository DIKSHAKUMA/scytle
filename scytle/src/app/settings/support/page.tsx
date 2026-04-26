'use client'

import React, { useState } from 'react'
import { MessageSquare, BookOpen, Users, ExternalLink } from 'lucide-react'
import { ContactDialog } from '@/components/settings/contact-dialog'

const supportOptions = [
    {
        icon: MessageSquare,
        title: 'Get Support',
        description: 'Have a question or found a bug? We\'ve got your back. We typically reply within 24 hours.',
        actionText: 'Submit a Request',
        color: 'hsl(200, 80%, 96%)',
        iconColor: 'hsl(200, 60%, 55%)',
    },
    {
        icon: BookOpen,
        title: 'Resources & Docs',
        description: 'Step-by-step tutorials, FAQs, and detailed documentation to help you get the most out of Scytle.',
        actionText: 'Browse Resources',
        color: 'hsl(40, 80%, 95%)',
        iconColor: 'hsl(40, 70%, 50%)',
        href: '#',
    },
    {
        icon: Users,
        title: 'Community',
        description: 'Learn from fellow creators, showcase your work, give feedback, and see what others are building.',
        actionText: 'Join Discord',
        color: 'hsl(260, 80%, 96%)',
        iconColor: 'hsl(260, 60%, 60%)',
        href: 'https://discord.gg/scytle',
    },
]

export default function SupportPage() {
    const [isContactOpen, setIsContactOpen] = useState(false)

    return (
        <div className="space-y-6 pb-16">
            {/* Section Header */}
            <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                    Help & Support
                </h2>
                <p className="text-muted-foreground mt-0.5 text-[13px]">
                    Get help, browse resources, or connect with the community.
                </p>
            </div>

            {/* Support Cards */}
            <div className="grid grid-cols-1 gap-3">
                {supportOptions.map((option) => {
                    const isContact = option.title === 'Get Support'
                    const handleClick = () => {
                        if (isContact) {
                            setIsContactOpen(true)
                        } else if (option.href) {
                            window.open(option.href, '_blank')
                        }
                    }

                    return (
                        <button
                            key={option.title}
                            onClick={handleClick}
                            className="group w-full text-left rounded-xl border border-border/50 bg-card p-5 hover:border-border hover:shadow-sm transition-all duration-150"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: option.color, color: option.iconColor }}
                                >
                                    <option.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-[14px] font-semibold text-foreground">
                                            {option.title}
                                        </h3>
                                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                                    </div>
                                    <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                                        {option.description}
                                    </p>
                                    <span className="inline-flex items-center text-[13px] font-medium text-accent mt-3 group-hover:underline">
                                        {option.actionText}
                                    </span>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Contact Form Dialog */}
            <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
        </div>
    )
}
