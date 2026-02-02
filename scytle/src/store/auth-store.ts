import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { Models } from 'appwrite'
import {
    account,
    login as appwriteLogin,
    signup as appwriteSignup,
    logout as appwriteLogout,
    getUser,
    loginWithOAuth,
    resetPassword as appwriteResetPassword,
} from '@/lib/appwrite'

interface AuthState {
    // State
    user: Models.User<Models.Preferences> | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    // Actions
    login: (email: string, password: string) => Promise<boolean>
    signup: (email: string, password: string, name: string) => Promise<boolean>
    logout: () => Promise<void>
    loginWithGoogle: () => void
    loginWithGithub: () => void
    resetPassword: (email: string) => Promise<boolean>
    checkSession: () => Promise<void>
    clearError: () => void
    setUser: (user: Models.User<Models.Preferences> | null) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        immer((set, get) => ({
            // Initial state
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Set user directly
            setUser: (user) => {
                set(state => {
                    state.user = user
                    state.isAuthenticated = !!user
                })
            },

            // Login with email/password
            login: async (email: string, password: string) => {
                set(state => {
                    state.isLoading = true
                    state.error = null
                })

                console.log('🔐 Attempting login for:', email)
                const result = await appwriteLogin(email, password)
                console.log('🔐 Login result:', result.success ? 'Success' : 'Failed', result.error || '')

                if (result.success) {
                    // Don't fetch user here - just set authenticated and let redirect happen
                    // The destination page will fetch user data
                    set(state => {
                        state.isAuthenticated = true
                        state.isLoading = false
                    })
                    console.log('🔐 Set isAuthenticated = true, isLoading = false')
                    return true
                }

                set(state => {
                    state.error = result.error || 'Login failed'
                    state.isLoading = false
                })
                return false
            },

            // Sign up new user
            signup: async (email: string, password: string, name: string) => {
                set(state => {
                    state.isLoading = true
                    state.error = null
                })

                const result = await appwriteSignup(email, password, name)

                if (result.success) {
                    const user = await getUser()
                    set(state => {
                        state.user = user
                        state.isAuthenticated = true
                        state.isLoading = false
                    })
                    return true
                }

                set(state => {
                    state.error = result.error || 'Signup failed'
                    state.isLoading = false
                })
                return false
            },

            // Logout
            logout: async () => {
                set(state => {
                    state.isLoading = true
                })

                await appwriteLogout()

                set(state => {
                    state.user = null
                    state.isAuthenticated = false
                    state.isLoading = false
                    state.error = null
                })
            },

            // OAuth login
            loginWithGoogle: () => {
                loginWithOAuth('google')
            },

            loginWithGithub: () => {
                loginWithOAuth('github')
            },

            // Reset password
            resetPassword: async (email: string) => {
                set(state => {
                    state.isLoading = true
                    state.error = null
                })

                const result = await appwriteResetPassword(email)

                set(state => {
                    state.isLoading = false
                    if (!result.success) {
                        state.error = result.error || 'Password reset failed'
                    }
                })

                return result.success
            },

            // Check existing session
            checkSession: async () => {
                set(state => {
                    state.isLoading = true
                })

                try {
                    const user = await getUser()
                    console.log('🔍 checkSession result:', user ? `User: ${user.email}` : 'No user')
                    set(state => {
                        state.user = user
                        state.isAuthenticated = !!user
                        state.isLoading = false
                    })
                } catch (error) {
                    console.error('🔍 checkSession error:', error)
                    set(state => {
                        state.user = null
                        state.isAuthenticated = false
                        state.isLoading = false
                    })
                }
            },

            // Clear error
            clearError: () => {
                set(state => {
                    state.error = null
                })
            },
        })),
        {
            name: 'scytle-auth',
            partialize: () => ({
                // Don't persist auth state - always verify with server
            }),
        }
    )
)
