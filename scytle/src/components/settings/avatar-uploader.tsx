'use client'

import React, { useState, useRef } from 'react'
import { Camera, Trash2, Loader2, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { storage, BUCKETS, account } from '@/lib/appwrite'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'

export function AvatarUploader() {
    const { user, setUser } = useAuthStore()
    const [isUploading, setIsUploading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Get avatar preview URL from Appwrite
    const getAvatarUrl = (fileId: string) => {
        try {
            return storage.getFilePreview(BUCKETS.AVATARS, fileId).toString()
        } catch (error) {
            console.error('Failed to get avatar preview:', error)
            return undefined
        }
    }

    const avatarId = user?.prefs?.avatarId as string | undefined
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            // 1. Delete old avatar if it exists
            if (avatarId) {
                try {
                    await storage.deleteFile(BUCKETS.AVATARS, avatarId)
                } catch (error) {
                    console.error('Failed to delete old avatar:', error)
                }
            }

            // 2. Upload new file
            const uploadedFile = await storage.createFile(
                BUCKETS.AVATARS,
                'unique()',
                file
            )

            // 3. Update user preferences
            // Fetch live prefs first to avoid overwriting bio/role updates
            const currentPrefs = await account.getPrefs()
            const newPrefs = { ...currentPrefs, avatarId: uploadedFile.$id }
            await account.updatePrefs(newPrefs)

            // 4. Update local state
            const updatedUser = { ...user!, prefs: newPrefs }
            setUser(updatedUser)
        } catch (error) {
            console.error('Avatar upload failed:', error)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDeleteAvatar = async () => {
        if (!avatarId) return

        setIsDeleting(true)
        try {
            await storage.deleteFile(BUCKETS.AVATARS, avatarId)
            
            // Fetch live prefs first to avoid overwriting bio/role updates
            const currentPrefs = await account.getPrefs()
            const newPrefs = { ...currentPrefs }
            delete newPrefs.avatarId
            await account.updatePrefs(newPrefs)

            const updatedUser = { ...user!, prefs: newPrefs }
            setUser(updatedUser)
        } catch (error) {
            console.error('Failed to delete avatar:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/40">
            <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-background shadow-xl">
                    {avatarId ? (
                        <AvatarImage src={getAvatarUrl(avatarId)} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-accent to-accent/70 text-white">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                
                {/* Upload Overlay */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isDeleting}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-all duration-200 backdrop-blur-[2px]"
                >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Update</span>
                </button>

                {/* Remove Action (Corner Button) */}
                {avatarId && !isUploading && (
                    <button
                        onClick={handleDeleteAvatar}
                        disabled={isDeleting}
                        className="absolute -top-1 -right-1 p-1.5 bg-background border border-border shadow-sm rounded-full text-muted-foreground hover:text-destructive hover:border-destructive/30 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                        title="Remove photo"
                    >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                )}

                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center sm:items-start gap-1">
                <h3 className="font-display font-semibold text-lg leading-tight">Profile Photo</h3>
                <p className="text-xs text-muted-foreground">
                    {avatarId ? 'Click to change or use current' : 'No photo set. Click to upload.'}
                </p>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    )
}
