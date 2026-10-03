import type { CSSProperties } from 'react'
import type { CaseRecord } from '../types'

interface YearHistogramProps {
  items: CaseRecord[]
  allItems: CaseRecord[]
  from?: number
  to?: number
  onChange: (from: number, to: number, bounds: { min: number; max: number }) => void
}

export default function YearHistogram({ items, allItems, from, to, onChange }: YearHistogramProps) {
  const corpusYears = allItems.map((item) => Number(item.decision_date.slice(0, 4))).filter(Number.isFinite)
  if (corpusYears.length === 0) return null

  const min = Math.min(...corpusYears)
  const max = Math.max(...corpusYears)
  const lower = Math.max(min, Math.min(from ?? min, max))
  const upper = Math.min(max, Math.max(to ?? max, min))
  const counts = new Map<number, number>()
  items.forEach((item) => {
    const year = Number(item.decision_date.slice(0, 4))
    counts.set(year, (counts.get(year) ?? 0) + 1)
  })
  const years = Array.from({ length: max - min + 1 }, (_, index) => min + index)
  const highestCount = Math.max(1, ...counts.values())
  const span = Math.max(1, max - min)
  const left = ((lower - min) / span) * 100
  const right = 100 - ((upper - min) / span) * 100

  return <fieldset className="year-filter">
    <legend>Results by year</legend>
    <div className="year-filter-heading">
      <span>Decision year</span>
      <output aria-live="polite">{lower === upper ? lower : `${lower}–${upper}`}</output>
    </div>
    <div className="year-chart" aria-hidden="true">
      {years.map((year) => {
        const count = counts.get(year) ?? 0
        return <span className={year >= lower && year <= upper ? 'year-bar selected' : 'year-bar'} key={year} title={`${year}: ${count} result${count === 1 ? '' : 's'}`}>
          <i style={{ height: count ? `${Math.max(9, (count / highestCount) * 100)}%` : '2px' }} />
        </span>
      })}
    </div>
    <div className="year-range" style={{ '--range-left': `${left}%`, '--range-right': `${right}%` } as CSSProperties}>
      <div className="year-track"><span /></div>
      <label className="visually-hidden" htmlFor="year-from">First decision year</label>
      <input id="year-from" type="range" min={min} max={max} step="1" value={lower} onChange={(event) => onChange(Math.min(Number(event.target.value), upper), upper, { min, max })} />
      <label className="visually-hidden" htmlFor="year-to">Last decision year</label>
      <input id="year-to" type="range" min={min} max={max} step="1" value={upper} onChange={(event) => onChange(lower, Math.max(Number(event.target.value), lower), { min, max })} />
    </div>
    <div className="year-axis" aria-hidden="true"><span>{min}</span><span>{max}</span></div>
  </fieldset>
}
