export { TableStandardFamily } from './families/table-standard'
export { TableFilteredFamily } from './families/table-filtered'
export { TableExpandableFamily } from './families/table-expandable'

import type { TemplateFamily } from '../types'
import { TableStandardFamily } from './families/table-standard'
import { TableFilteredFamily } from './families/table-filtered'
import { TableExpandableFamily } from './families/table-expandable'

export const dataTableFamilies: TemplateFamily[] = [
    TableStandardFamily,
    TableFilteredFamily,
    TableExpandableFamily,
]

export { dataTablePresets } from './presets'
