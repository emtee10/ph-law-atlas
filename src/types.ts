export interface LegislationRef {
  jurisdiction: string
  statute: string
  short_name: string
  citation: string
  provisions: string[]
}

export interface CaseRecord {
  id: string
  title: string
  citation: string
  decision_date: string
  jurisdiction: string
  court: string
  canlii?: { url?: string | null }
  public_health_functions: string[]
  topics: string[]
  diseases_or_hazards: string[]
  settings: string[]
  legislation: LegislationRef[]
  case_family?: string | null
  relationships: { type: string; target_id: string }[]
  public_health_organizations: { id: string; name: string; role?: string | null }[]
  public_health_roles: string[]
  editorial?: { status?: string; created_date?: string; last_updated?: string }
  bodyHtml: string
  summary: string
  whyItMatters: string
  searchText: string
  sourcePath: string
}

export interface RegistryEntry {
  title: string
  jurisdiction: string
  citation: string
  official_url?: string
  provisions?: Record<string, {
    label?: string
    official_url?: string
  }>
}

export interface ContentData {
  cases: CaseRecord[]
  legislation: Record<string, RegistryEntry>
  featuredQuestions: { question: string; target_id: string }[]
  about: { title: string; subtitle: string; bodyHtml: string }
  build: { showDrafts: boolean }
}

export type FilterKey = 'jurisdiction' | 'court' | 'public_health_functions' | 'topics' | 'diseases_or_hazards' | 'settings' | 'legislation' | 'provisions' | 'organizations' | 'public_health_roles'
