'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Loader2, Camera, KeyRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { storage, BUCKETS, account } from '@/lib/appwrite'
import { useAuthStore } from '@/store'

export default function ProfilePage() {
    const { user, setUser } = useAuthStore()

    // Form state
    const [name, setName] = useState(user?.name || '')
    const [isLoading, setIsLoading] = useState(false)
    const [isSaved, setIsSaved] = useState(true)
    const [isResetSending, setIsResetSending] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const avatarId = (user?.prefs as any)?.avatarId as string | undefined
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

    let avatarUrl: string | undefined
    if (avatarId) {
        try { avatarUrl = storage.getFilePreview(BUCKETS.AVATARS, avatarId).toString() } catch {}
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || name === user?.name) return
        setIsLoading(true)
        try {
            await account.updateName(name.trim())
            setUser({ ...user!, name: name.trim() })
            setIsSaved(true)
        } catch (error) {
            console.error('Failed to update profile:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        try {
            if (avatarId) {
                try { await storage.deleteFile(BUCKETS.AVATARS, avatarId) } catch {}
            }
            const uploaded = await storage.createFile(BUCKETS.AVATARS, 'unique()', file)
            const currentPrefs = await account.getPrefs()
            const newPrefs = { ...currentPrefs, avatarId: uploaded.$id }
            await account.updatePrefs(newPrefs)
            setUser({ ...user!, prefs: newPrefs })
        } catch (error) {
            console.error('Avatar upload failed:', error)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleRemoveAvatar = async () => {
        if (!avatarId) return
        setIsUploading(true)
        try {
            await storage.deleteFile(BUCKETS.AVATARS, avatarId)
            const currentPrefs = await account.getPrefs()
            const newPrefs = { ...currentPrefs }
            delete newPrefs.avatarId
            await account.updatePrefs(newPrefs)
            setUser({ ...user!, prefs: newPrefs })
        } catch (error) {
            console.error('Failed to remove avatar:', error)
        } finally {
            setIsUploading(false)
        }
    }

    const handleResetPassword = async () => {
        if (!user?.email) return
        setIsResetSending(true)
        try {
            await account.createRecovery(user.email, `${window.location.origin}/reset-password`)
        } catch (error) {
            console.error('Failed to send reset email:', error)
        } finally {
            setIsResetSending(false)
        }
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Avatar */}
            <div className="flex items-center gap-5">
                <div
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Avatar className="w-16 h-16">
                        {avatarId ? <AvatarImage src={avatarUrl} className="object-cover" /> : null}
                        <AvatarFallback className="text-lg font-medium bg-muted text-muted-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 bg-background/70 rounded-full flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-[13px] font-medium text-foreground">{user?.name}</p>
                    <p className="text-[12px] text-muted-foreground">{user?.email}</p>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[12px] font-medium text-foreground hover:underline"
                        >
                            Upload
                        </button>
                        {avatarId && (
                            <>
                                <span className="text-muted-foreground/30">·</span>
                                <button
                                    onClick={handleRemoveAvatar}
                                    className="text-[12px] font-medium text-muted-foreground hover:text-foreground hover:underline"
                                >
                                    Remove
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>

            {/* Name */}
            <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-[13px]">Display name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setIsSaved(false) }}
                        className="h-9 text-[13px] max-w-xs"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[13px]">Email</Label>
                    <p className="text-[13px] text-muted-foreground">{user?.email}</p>
                </div>
                {!isSaved && (
                    <Button type="submit" size="sm" disabled={isLoading || !name.trim()}>
                        {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                        Save
                    </Button>
                )}
            </form>

            {/* Separator */}
            <div className="h-px bg-border/40" />

            {/* Password */}
            <div className="space-y-3">
                <div>
                    <h3 className="text-[13px] font-medium text-foreground">Password</h3>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                        Reset your password via email.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetPassword} disabled={isResetSending}>
                    {isResetSending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5 mr-1.5" />}
                    Reset password
                </Button>
            </div>
        </div>
    )
}
