import rawContent from '../../generated/content.json'
import type { CaseRecord, ContentData, FilterKey } from '../types'

export const content = rawContent as ContentData
export const casesById = new Map(content.cases.map((item) => [item.id, item]))

export const humanize = (value: string) => value
  .replace(/-/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const formatDate = (value: string) => new Intl.DateTimeFormat('en-CA', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
}).format(new Date(`${value}T00:00:00Z`))

export const valuesFor = (item: CaseRecord, key: FilterKey): string[] => {
  switch (key) {
    case 'jurisdiction': return [item.jurisdiction]
    case 'court': return [item.court]
    case 'legislation': return item.legislation.map((entry) => entry.short_name || entry.statute)
    case 'provisions': return item.legislation.flatMap((entry) => entry.provisions ?? [])
    case 'organizations': return item.public_health_organizations.map((entry) => entry.name)
    default: return item[key]
  }
}

export const allValues = (key: FilterKey) => [...new Set(content.cases.flatMap((item) => valuesFor(item, key)))].filter(Boolean).sort((a, b) => a.localeCompare(b))
