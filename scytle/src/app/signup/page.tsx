'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, User, ArrowRight, Github, Zap, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store'

export default function SignupPage() {
    const router = useRouter()
    const { signup, loginWithGoogle, loginWithGithub, isLoading, error, clearError } = useAuthStore()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        setPasswordError('')

        // Validate password match
        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }

        // Validate password strength
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters')
            return
        }

        const success = await signup(email, password, name)
        if (success) {
            router.push('/dashboard')
        }
    }

    const passwordRequirements = [
        { met: password.length >= 8, text: 'At least 8 characters' },
        { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
        { met: /[0-9]/.test(password), text: 'One number' },
    ]

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-radial" />
                <div className="absolute right-1/3 bottom-0 w-[800px] h-[500px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/8 via-accent/3 to-transparent rounded-full blur-3xl" />
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
                    <CardTitle className="text-2xl font-display font-bold">Create an account</CardTitle>
                    <CardDescription className="text-muted-foreground">Start building products with AI assistance</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {(error || passwordError) && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                {error || passwordError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Full name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="pl-10"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </div>

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
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
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
                                    autoComplete="new-password"
                                />
                            </div>
                            {password && (
                                <div className="space-y-1 pt-1">
                                    {passwordRequirements.map((req, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <Check
                                                className={`w-3 h-3 ${req.met ? 'text-green-500' : 'text-muted-foreground'}`}
                                            />
                                            <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>
                                                {req.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
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
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
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

                    <p className="text-xs text-center text-muted-foreground mt-4">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="underline hover:text-accent">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline hover:text-accent">
                            Privacy Policy
                        </Link>
                    </p>
                </CardContent>

                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-accent font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
