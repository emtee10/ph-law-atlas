import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Fuse from 'fuse.js'
import CaseCard from '../components/CaseCard'
import FilterPanel, { filterKeys } from '../components/FilterPanel'
import { content, valuesFor } from '../lib/content'
import type { FilterKey } from '../types'

export default function CasesPage() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const query = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'newest'
  const parseYear = (value: string | null) => value && /^\d{4}$/.test(value) ? Number(value) : undefined
  const yearFrom = parseYear(params.get('year_from'))
  const yearTo = parseYear(params.get('year_to'))
  const selected = Object.fromEntries(filterKeys.map((key) => [key, params.get(key) ?? ''])) as Partial<Record<FilterKey, string>>
  const fuse = useMemo(() => new Fuse(content.cases, { keys: ['title', 'citation', 'searchText'], threshold: 0.3, ignoreLocation: true }), [])
  const yearItems = useMemo(() => {
    let items = query ? fuse.search(query).map((result) => result.item) : [...content.cases]
    return items.filter((item) => filterKeys.every((key) => !selected[key] || valuesFor(item, key).includes(selected[key]!)))
  }, [query, params.toString()])
  const results = useMemo(() => {
    const items = yearItems.filter((item) => {
      const year = Number(item.decision_date.slice(0, 4))
      return (yearFrom === undefined || year >= yearFrom) && (yearTo === undefined || year <= yearTo)
    })
    if (sort === 'oldest') items.sort((a, b) => a.decision_date.localeCompare(b.decision_date) || a.title.localeCompare(b.title))
    else if (sort === 'alpha') items.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'updated') items.sort((a, b) =>
      (b.editorial?.last_updated ?? '').localeCompare(a.editorial?.last_updated ?? '')
      || b.decision_date.localeCompare(a.decision_date)
      || a.title.localeCompare(b.title),
    )
    else if (sort === 'added') items.sort((a, b) =>
      (b.editorial?.created_date ?? '').localeCompare(a.editorial?.created_date ?? '')
      || b.decision_date.localeCompare(a.decision_date)
      || a.title.localeCompare(b.title),
    )
    else items.sort((a, b) => b.decision_date.localeCompare(a.decision_date) || a.title.localeCompare(b.title))
    return items
  }, [yearItems, yearFrom, yearTo, sort])

  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (key === 'legislation') next.delete('provisions')
    value ? next.set(key, value) : next.delete(key)
    setParams(next)
  }

  function updateYears(from: number, to: number, bounds: { min: number; max: number }) {
    const next = new URLSearchParams(params)
    from === bounds.min ? next.delete('year_from') : next.set('year_from', String(from))
    to === bounds.max ? next.delete('year_to') : next.set('year_to', String(to))
    setParams(next)
  }

  const activeFilterCount = Object.values(selected).filter(Boolean).length + (yearFrom !== undefined || yearTo !== undefined ? 1 : 0)

  return <div className="page-shell container">
    <header className="page-title"><p className="kicker">Case collection</p><h1>Browse cases</h1><p>Search the curated collection or narrow it using source metadata.</p></header>
    <div className="inline-search"><label htmlFor="results-search">Search cases</label><div><input id="results-search" type="search" value={query} onChange={(e) => update('q', e.target.value)} placeholder="Title, topic, statute, provision…" /><span aria-hidden="true">⌕</span></div></div>
    <button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</button>
    <div className="results-layout">
      <div className={filtersOpen ? 'filter-drawer is-open' : 'filter-drawer'}><FilterPanel selected={selected} onChange={update} yearItems={yearItems} yearFrom={yearFrom} yearTo={yearTo} onYearChange={updateYears} onClear={() => {
        const next = new URLSearchParams(params)
        filterKeys.forEach((key) => next.delete(key))
        next.delete('year_from')
        next.delete('year_to')
        setParams(next)
      }} /></div>
      <section aria-live="polite">
        <div className="results-toolbar"><p><strong>{results.length}</strong> {results.length === 1 ? 'case' : 'cases'}{query && <> matching “{query}”</>}</p><label>Sort <select value={sort} onChange={(e) => update('sort', e.target.value)}><option value="newest">Newest decision</option><option value="oldest">Oldest decision</option><option value="updated">Recently updated</option><option value="added">Recently added</option><option value="alpha">Alphabetical</option></select></label></div>
        <div className="case-list">{results.map((item) => <CaseCard item={item} key={item.id} />)}</div>
        {results.length === 0 && <div className="empty-state"><h2>No cases found</h2><p>Try a broader search or clear one or more filters.</p><button onClick={() => setParams({})}>Clear search and filters</button></div>}
      </section>
    </div>
  </div>
}
