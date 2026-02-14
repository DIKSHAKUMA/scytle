export { ListStackedFamily } from './families/list-stacked'
export { ListGridFamily } from './families/list-grid'

import type { TemplateFamily } from '../types'
import { ListStackedFamily } from './families/list-stacked'
import { ListGridFamily } from './families/list-grid'

export const appListFamilies: TemplateFamily[] = [
    ListStackedFamily,
    ListGridFamily,
]

export { appListPresets } from './presets'
