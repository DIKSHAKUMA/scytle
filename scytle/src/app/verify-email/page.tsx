'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, ArrowLeft, Zap, CheckCircle, ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'

import { Suspense } from 'react'

function VerifyEmailForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { verifyEmail, isLoading, error, clearError } = useAuthStore()

    const [verified, setVerified] = useState(false)
    
    const userId = searchParams.get('userId')
    const secret = searchParams.get('secret')

    useEffect(() => {
        const performVerification = async () => {
            if (userId && secret) {
                const success = await verifyEmail(userId, secret)
                if (success) {
                    setVerified(true)
                    toast.success('Email verified successfully!')
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 3000)
                }
            } else {
                toast.error('Invalid or missing verification tokens.')
            }
        }

        performVerification()
    }, [userId, secret, verifyEmail, router])

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
                    
                    {isLoading ? (
                        <>
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                                <Loader2 className="w-6 h-6 text-accent animate-spin" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Verifying...</CardTitle>
                            <CardDescription>
                                Please wait while we verify your email address.
                            </CardDescription>
                        </>
                    ) : verified ? (
                        <>
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
                            <CardDescription>
                                Your email has been verified. Redirecting you to the dashboard...
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
                                <ShieldAlert className="w-6 h-6 text-destructive" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
                            <CardDescription>
                                {error || 'Invalid or expired verification link.'}
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent>
                    {!isLoading && (
                        <div className="space-y-4">
                            <Link href="/dashboard">
                                <Button className="w-full h-11 rounded-xl font-semibold">
                                    Go to Dashboard
                                </Button>
                            </Link>
                            {!verified && (
                                <Link href="/login">
                                    <Button variant="ghost" className="w-full gap-2 h-11 rounded-xl">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to login
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyEmailForm />
        </Suspense>
    )
}
