'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, Mail, Lock, ArrowRight, Github, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store'
import { getUser } from '@/lib/appwrite'

function LoginForm() {
    const searchParams = useSearchParams()
    const redirectUrl = searchParams.get('redirect') || '/dashboard'
    const { login, loginWithGoogle, loginWithGithub, isLoading, error, clearError } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [isRedirecting, setIsRedirecting] = useState(false)

    // Check if already authenticated on mount only
    useEffect(() => {
        // Prevent running if already redirecting
        if (isRedirecting) return

        const checkAuth = async () => {
            try {
                const user = await getUser()
                if (user) {
                    setIsRedirecting(true)
                    window.location.replace(redirectUrl)
                    return
                }
            } catch (error) {
                // Auth check failed — show login form
            }
            setIsCheckingAuth(false)
        }
        checkAuth()
    }, [redirectUrl, isRedirecting])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        const success = await login(email, password)
        if (success) {
            setIsRedirecting(true)
            window.location.replace(redirectUrl)
        }
    }

    // Show loading while checking auth or redirecting
    if (isCheckingAuth || isRedirecting) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-radial" />
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[500px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/8 via-accent/3 to-transparent rounded-full blur-3xl" />
                </div>
            </div>

            <Card className="w-full max-w-md border-border/50 shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="text-center space-y-2 pb-2">
                    <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shadow-accent/20">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-2xl tracking-tight">Scytle</span>
                    </Link>
                    <CardTitle className="text-2xl font-display font-bold">Welcome back</CardTitle>
                    <CardDescription className="text-muted-foreground">Sign in to your account to continue</CardDescription>
                </CardHeader>

                <CardContent>
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-muted-foreground hover:text-accent transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                            or continue with
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={loginWithGoogle}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google
                        </Button>
                        <Button
                            variant="outline"
                            onClick={loginWithGithub}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <Github className="w-4 h-4" />
                            GitHub
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-accent font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
