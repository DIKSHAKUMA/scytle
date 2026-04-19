'use client'

import React, { useState } from 'react'
import { Loader2, Save, Mail, User as UserIcon, Briefcase, Text, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { account } from '@/lib/appwrite'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

const ROLES = [
    'UI/UX Designer',
    'Product Designer',
    'Frontend Developer',
    'Full-stack Developer',
    'Product Manager',
    'Founder / CEO',
    'Marketing Designer',
    'Other',
]

export function ProfileForm() {
    const { user, setUser, resetPassword: requestPasswordReset } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [isResetSending, setIsResetSending] = useState(false)
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
    
    // Form state
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [pendingEmail, setPendingEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('')
    const [bio, setBio] = useState('')

    // Sync state when user is loaded
    React.useEffect(() => {
        if (user) {
            setName(user.name || '')
            setEmail(user.email || '')
            setRole((user.prefs?.role as string) || '')
            setBio((user.prefs?.bio as string) || '')
        }
    }, [user?.name, user?.email, user?.prefs?.role, user?.prefs?.bio])

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Update name if changed
            if (name !== user?.name) {
                await account.updateName(name)
            }

            // 2. Update preferences (role, bio)
            // Fetch latest to avoid overwriting recent changes from other components (like avatar)
            const currentPrefs = await account.getPrefs()
            const newPrefs = { ...currentPrefs, role, bio }
            await account.updatePrefs(newPrefs)

            // 3. Sync local store
            const updatedUser = { ...user!, name, prefs: newPrefs }
            setUser(updatedUser)
            
            // 4. Success feedback
            setIsSaved(true)
            toast.success('Profile updated successfully')
            setTimeout(() => setIsSaved(false), 3000)
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await account.updateEmail(pendingEmail, password)
            
            // If successful, update local user
            const updatedUser = { ...user!, email: pendingEmail }
            setUser(updatedUser)
            setEmail(pendingEmail)
            setIsEmailDialogOpen(false)
            setPassword('')
        } catch (error: any) {
            console.error('Email update failed:', error)
            alert(error.message || 'Failed to update email. Please check your password.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleForgotPassword = async () => {
        if (!user?.email) return
        
        setIsResetSending(true)
        try {
            const success = await requestPasswordReset(user.email)
            if (success) {
                alert(`Password reset instructions have been sent to ${user.email}`)
            }
        } catch (error) {
            console.error('Failed to send reset email:', error)
            alert('Failed to send reset email. Please try again later.')
        } finally {
            setIsResetSending(false)
        }
    }

    const openEmailDialog = () => {
        setPendingEmail(email)
        setIsEmailDialogOpen(true)
    }

    return (
        <div className="space-y-8">
            <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                            <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="bg-muted/40 backdrop-blur-sm border-border/40 focus:bg-background/80 transition-all rounded-xl focus:ring-accent/10"
                        />
                    </div>

                    {/* Email (Trigger Dialog) */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            Email Address
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                value={email}
                                readOnly
                                className="bg-muted/20 text-muted-foreground cursor-not-allowed border-dashed"
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={openEmailDialog}
                                className="shrink-0 rounded-xl hover:bg-foreground hover:text-background transition-all duration-300 border-border/60 hover:border-foreground active:scale-95"
                            >
                                Change
                            </Button>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                            What do you do?
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="bg-muted/40 backdrop-blur-sm border-border/40 focus:bg-background/80 rounded-xl">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-2">
                            <Text className="w-3.5 h-3.5 text-muted-foreground" />
                            Personal Bio
                        </Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className="bg-muted/40 backdrop-blur-sm border-border/40 focus:bg-background/80 transition-all resize-none rounded-xl focus:ring-accent/10"
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Keep it short and sweet. Max 200 characters.
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button 
                        type="submit" 
                        disabled={isLoading || isSaved}
                        className={cn(
                            "min-w-40 rounded-full shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
                            isSaved 
                                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                                : "bg-foreground text-background hover:opacity-90 shadow-foreground/10"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {isSaved ? 'Saved' : 'Save'}
                    </Button>
                </div>
            </form>

            {/* Email Change Dialog */}
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Change Email Address</DialogTitle>
                        <DialogDescription>
                            Enter your new email and confirm with your current password.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEmailUpdate} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-email">New Email</Label>
                            <Input
                                id="new-email"
                                type="email"
                                value={pendingEmail}
                                onChange={(e) => setPendingEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-sm text-muted-foreground italic">Forgot your current password?</span>
                            <Button 
                                type="button" 
                                variant="link" 
                                onClick={handleForgotPassword}
                                disabled={isResetSending}
                                className="h-auto p-0 text-accent font-medium hover:text-accent/80"
                            >
                                {isResetSending ? 'Sending...' : 'Reset it here'}
                            </Button>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEmailDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Update Email
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
