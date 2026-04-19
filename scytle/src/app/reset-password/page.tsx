'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock, ArrowLeft, Zap, CheckCircle, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { completePasswordReset, isLoading, error, clearError } = useAuthStore()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [submitted, setSubmitted] = useState(false)
    
    const userId = searchParams.get('userId')
    const secret = searchParams.get('secret')

    useEffect(() => {
        if (!userId || !secret) {
            toast.error('Invalid or missing reset tokens. Please request a new lead.')
        }
    }, [userId, secret])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long')
            return
        }

        if (!userId || !secret) {
            toast.error('Missing reset tokens')
            return
        }

        const success = await completePasswordReset(userId, secret, password)
        if (success) {
            setSubmitted(true)
            toast.success('Password reset successfully')
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/3 top-1/4 blur-3xl opacity-20">
                    <div className="aspect-square w-[400px] bg-accent rounded-full" />
                </div>
            </div>

            <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl border-border/40 backdrop-blur-xl bg-background/80">
                <CardHeader className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-semibold text-xl">Scytle</span>
                    </Link>
                    {submitted ? (
                        <>
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Password Reset!</CardTitle>
                            <CardDescription>
                                Your password has been updated. Redirecting you to login...
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                                <ShieldCheck className="w-6 h-6 text-accent" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Create new password</CardTitle>
                            <CardDescription>
                                Please enter and confirm your new password below.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent>
                    {submitted ? (
                        <div className="space-y-4">
                            <Link href="/login">
                                <Button className="w-full h-11 rounded-xl font-semibold">
                                    Go to login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="pass" className="text-sm font-medium">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="pass"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-11 rounded-xl bg-muted/40"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirm" className="text-sm font-medium">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirm"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-11 rounded-xl bg-muted/40"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 rounded-xl font-semibold mt-2"
                                disabled={isLoading || !userId || !secret}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>

                            <Link href="/login">
                                <Button variant="ghost" className="w-full gap-2 h-11 rounded-xl text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to login
                                </Button>
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
