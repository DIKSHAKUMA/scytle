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
    const [isVerifying, setIsVerifying] = useState(false)
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
    
    // Form state initialized directly from store to prevent navigation flickers
    const [name, setName] = useState(() => user?.name || '')
    const [email, setEmail] = useState(() => user?.email || '')
    const [pendingEmail, setPendingEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState(() => (user?.prefs?.role as string) || '')
    const [bio, setBio] = useState(() => (user?.prefs?.bio as string) || '')

    // Sync state when user is loaded
    React.useEffect(() => {
        console.log('🔄 ProfileFormSync - Current User:', user);
        console.log('📦 Prefs:', user?.prefs);
        if (user) {
            setName(prev => (prev !== user.name ? (user.name || '') : prev))
            setEmail(prev => (prev !== user.email ? (user.email || '') : prev))
            
            const userRole = ((user.prefs?.role as string) || '').trim()
            console.log('📍 Syncing role to state:', userRole);
            console.log('✅ Is role valid?', ROLES.includes(userRole));
            setRole(prev => (prev !== userRole ? userRole : prev))
            
            const userBio = (user.prefs?.bio as string) || ''
            setBio(prev => (prev !== userBio ? userBio : prev))
        }
    }, [user?.$id, user?.name, user?.email, JSON.stringify(user?.prefs || {})])

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        console.log('💾 Saving profile...', { name, role, bio });

        try {
            // 1. Update name if changed
            if (name !== user?.name) {
                console.log('📝 Updating name to:', name);
                await account.updateName(name)
            }

            // 2. Update preferences (role, bio)
            console.log('⚙️ Fetching current prefs before update...');
            let currentPrefs = {}
            try {
                currentPrefs = await account.getPrefs()
                console.log('📄 Current prefs from server:', currentPrefs);
            } catch (e) {
                console.warn('Could not fetch prefs, starting with empty', e)
            }
            
            const newPrefs = { ...currentPrefs, role, bio }
            console.log('🚀 Sending new prefs to Appwrite:', newPrefs);
            await account.updatePrefs(newPrefs)

            // 3. Sync local store with FRESH data from server
            console.log('🔄 Fetching fresh user data after save...');
            const { getUser } = await import('@/lib/appwrite')
            const fresUser = await getUser()
            console.log('✅ Fresh user data received:', fresUser);
            
            if (fresUser) {
                setUser(fresUser)
                console.log('✨ Auth store updated with fresh user');
            }
            
            // 4. Success feedback
            setIsSaved(true)
            toast.success('Profile updated successfully')
            setTimeout(() => setIsSaved(false), 3000)
        } catch (error: any) {
            console.error('❌ Failed to update profile:', error)
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await account.updateEmail(pendingEmail, password)
            
            // Send verification email to the new address
            const { sendVerificationEmail } = useAuthStore.getState()
            await sendVerificationEmail()
            
            // If successful, update local user
            const updatedUser = { ...user!, email: pendingEmail, emailVerification: false }
            setUser(updatedUser)
            setEmail(pendingEmail)
            setIsEmailDialogOpen(false)
            setPassword('')
            toast.success('Email updated! Please check your new inbox for verification.')
        } catch (error: any) {
            console.error('Email update failed:', error)
            toast.error(error.message || 'Failed to update email. Please check your password.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendVerification = async () => {
        setIsVerifying(true)
        try {
            const { sendVerificationEmail } = useAuthStore.getState()
            const success = await sendVerificationEmail()
            if (success) {
                toast.success('Verification email sent!')
            }
        } catch (error) {
            console.error('Failed to resend verification:', error)
            toast.error('Failed to resend verification')
        } finally {
            setIsVerifying(false)
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
                        <Label htmlFor="email" className="text-sm font-medium flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                Email Address
                            </div>
                            {user?.emailVerification ? (
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Verified
                                </span>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={isVerifying}
                                    className="text-[10px] text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors"
                                >
                                    {isVerifying ? 'Sending...' : 'Unverified - Verify Now'}
                                </button>
                            )}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                value={email}
                                readOnly
                                className="bg-muted/20 text-muted-foreground cursor-not-allowed border-dashed rounded-xl"
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
                        <Select 
                            value={role || undefined} 
                            onValueChange={setRole}
                        >
                            <SelectTrigger className="w-full bg-muted/40 backdrop-blur-sm border-border/40 focus:bg-background/80 rounded-xl h-11">
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
