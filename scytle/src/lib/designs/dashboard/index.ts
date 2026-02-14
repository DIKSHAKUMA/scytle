export { StatCardsFamily } from './families/stat-cards'
export { PageHeaderFamily } from './families/page-header'

import type { TemplateFamily } from '../types'
import { StatCardsFamily } from './families/stat-cards'
import { PageHeaderFamily } from './families/page-header'

export const dashboardFamilies: TemplateFamily[] = [
    StatCardsFamily,
    PageHeaderFamily,
]

export { dashboardPresets } from './presets'
