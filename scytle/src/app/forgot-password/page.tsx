'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, ArrowLeft, Zap, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store'

export default function ForgotPasswordPage() {
    const { resetPassword, isLoading, error, clearError } = useAuthStore()

    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        const success = await resetPassword(email)
        if (success) {
            setSubmitted(true)
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

            <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-semibold text-xl">Scytle</span>
                    </Link>
                    {submitted ? (
                        <>
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                            <CardDescription>
                                We&apos;ve sent a password reset link to{' '}
                                <span className="font-medium text-foreground">{email}</span>
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
                            <CardDescription>
                                No worries, we&apos;ll send you reset instructions.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent>
                    {submitted ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Didn&apos;t receive the email? Check your spam folder or try another email address.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setSubmitted(false)}
                            >
                                Try another email
                            </Button>
                            <Link href="/login">
                                <Button variant="ghost" className="w-full gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send reset link'
                                )}
                            </Button>

                            <Link href="/login">
                                <Button variant="ghost" className="w-full gap-2">
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
