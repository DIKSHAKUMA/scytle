'use client'

import React from 'react'
import { AvatarUploader } from '@/components/settings/avatar-uploader'
import { ProfileForm } from '@/components/settings/profile-form'
import { Separator } from '@/components/ui/separator'

export default function ProfilePage() {
    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold tracking-tight mb-1">Public Profile</h1>
                <p className="text-muted-foreground text-[15px]">
                    This is how others will see you on the platform.
                </p>
            </div>

            <Separator className="bg-border/60" />

            {/* Avatar Section */}
            <section className="space-y-6">
                <AvatarUploader />
            </section>

            <Separator className="bg-border/60" />

            {/* Form Section */}
            <section className="space-y-6 pb-10">
                <ProfileForm />
            </section>
        </div>
    )
}
