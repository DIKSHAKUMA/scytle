'use client'

import React from 'react'
import { AvatarUploader } from '@/components/settings/avatar-uploader'
import { ProfileForm } from '@/components/settings/profile-form'
import { Separator } from '@/components/ui/separator'

export default function ProfilePage() {
    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground mt-2 text-[15px]">
                    Manage your account setup, profile photo, and personal details.
                </p>
            </div>
            
            <Separator className="bg-border/60" />

            <div className="space-y-8">
                <AvatarUploader />
                <ProfileForm />
            </div>
        </div>
    )
}
