import type { FilterKey } from '../types'
import { allValues, content, humanize } from '../lib/content'
import type { CaseRecord } from '../types'
import YearHistogram from './YearHistogram'

export const filterLabels: Record<FilterKey, string> = {
  jurisdiction: 'Jurisdiction',
  court: 'Court or tribunal',
  public_health_functions: 'Public health function',
  topics: 'Topic',
  diseases_or_hazards: 'Disease or hazard',
  settings: 'Setting',
  legislation: 'Legislation',
  provisions: 'Statutory provision',
  organizations: 'Public health organization',
  public_health_roles: 'Public health role',
}

export const filterKeys = Object.keys(filterLabels) as FilterKey[]

export default function FilterPanel({ selected, onChange, onClear, yearItems, yearFrom, yearTo, onYearChange }: { selected: Partial<Record<FilterKey, string>>; onChange: (key: FilterKey, value: string) => void; onClear: () => void; yearItems: CaseRecord[]; yearFrom?: number; yearTo?: number; onYearChange: (from: number, to: number, bounds: { min: number; max: number }) => void }) {
  const available = filterKeys
    .filter((key) => key !== 'legislation' && key !== 'provisions')
    .map((key) => ({ key, values: allValues(key) }))
    .filter((entry) => entry.values.length > 0)
  const statutes = allValues('legislation')
  const provisions = selected.legislation ? [...new Set(content.cases.flatMap((item) =>
    item.legislation
      .filter((law) => (law.short_name || law.statute) === selected.legislation)
      .flatMap((law) => law.provisions ?? []),
  ))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : []

  return <aside className="filters" aria-label="Case filters">
    <div className="filters-heading"><h2>Filter cases</h2>{(Object.values(selected).some(Boolean) || yearFrom !== undefined || yearTo !== undefined) && <button onClick={onClear}>Clear all</button>}</div>
    <YearHistogram items={yearItems} allItems={content.cases} from={yearFrom} to={yearTo} onChange={onYearChange} />
    {statutes.length > 0 && <fieldset className="linked-filter-group">
      <legend>Legislation and provision</legend>
      <div className="filter-group">
        <label htmlFor="filter-legislation">Statute</label>
        <select id="filter-legislation" value={selected.legislation ?? ''} onChange={(event) => onChange('legislation', event.target.value)}>
          <option value="">All legislation</option>
          {statutes.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="filter-provisions">Provision</label>
        <select id="filter-provisions" value={selected.legislation ? selected.provisions ?? '' : ''} disabled={!selected.legislation} onChange={(event) => onChange('provisions', event.target.value)}>
          <option value="">{selected.legislation ? 'All provisions' : 'Choose a statute first'}</option>
          {provisions.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <p className="filter-help">{selected.legislation ? `Showing provisions of ${selected.legislation}.` : 'Provisions are scoped to their statute.'}</p>
      </div>
    </fieldset>}
    {available.map(({ key, values }) => <div className="filter-group" key={key}>
      <label htmlFor={`filter-${key}`}>{filterLabels[key]}</label>
      <select id={`filter-${key}`} value={selected[key] ?? ''} onChange={(event) => onChange(key, event.target.value)}>
        <option value="">All</option>
        {values.map((value) => <option key={value} value={value}>{key === 'topics' || key === 'diseases_or_hazards' || key === 'settings' || key === 'public_health_functions' || key === 'public_health_roles' ? humanize(value) : value}</option>)}
      </select>
    </div>)}
  </aside>
}
