import { Link } from 'react-router-dom'
import type { CaseRecord } from '../types'
import { formatDate, humanize } from '../lib/content'

export default function CaseCard({ item }: { item: CaseRecord }) {
  const tags = [...item.public_health_functions, ...item.topics].slice(0, 3)
  return <article className="case-card">
    <div className="eyebrow">{item.court} <span>·</span> {formatDate(item.decision_date)}</div>
    <h2><Link to={`/cases/${item.id}`}>{item.title}</Link></h2>
    <p className="citation">{item.citation}</p>
    {item.summary && <p className="case-summary">{item.summary}</p>}
    {tags.length > 0 && <ul className="tag-list" aria-label="Case topics">
      {tags.map((tag) => <li key={tag}>{humanize(tag)}</li>)}
    </ul>}
  </article>
}
