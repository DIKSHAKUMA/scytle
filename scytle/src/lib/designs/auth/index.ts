export { AuthSignupFamily } from './families/auth-signup'
export { AuthLoginFamily } from './families/auth-login'
export { AuthModalFamily } from './families/auth-modal'
export { AuthOnboardingFamily } from './families/auth-onboarding'
export { authPresets } from './presets'

import { AuthSignupFamily } from './families/auth-signup'
import { AuthLoginFamily } from './families/auth-login'
import { AuthModalFamily } from './families/auth-modal'
import { AuthOnboardingFamily } from './families/auth-onboarding'

export const authFamilies = [
    AuthSignupFamily,
    AuthLoginFamily,
    AuthModalFamily,
    AuthOnboardingFamily,
]
