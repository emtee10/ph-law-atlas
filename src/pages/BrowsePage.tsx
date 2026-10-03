import { Link, useParams, useSearchParams } from 'react-router-dom'
import { allValues, content, humanize, valuesFor } from '../lib/content'
import type { FilterKey } from '../types'

const browseConfig: Record<string, { key: FilterKey; title: string; shortTitle: string; description: string }> = {
  topics: { key: 'topics', title: 'Topics', shortTitle: 'Topics', description: 'Explore recurring legal and public health themes in the collection.' },
  functions: { key: 'public_health_functions', title: 'Public health functions', shortTitle: 'Functions', description: 'Browse cases by the public health functions identified in source metadata.' },
  legislation: { key: 'legislation', title: 'Legislation', shortTitle: 'Legislation', description: 'Find cases that interpret or apply public health statutes.' },
  courts: { key: 'court', title: 'Courts', shortTitle: 'Courts', description: 'Browse decisions by court or adjudicative body.' },
  'diseases-hazards': { key: 'diseases_or_hazards', title: 'Diseases and hazards', shortTitle: 'Diseases / Hazards', description: 'Browse the diseases and hazards identified in source metadata.' },
  settings: { key: 'settings', title: 'Settings', shortTitle: 'Settings', description: 'Browse cases by the settings identified in source metadata.' },
}

export default function BrowsePage() {
  const { category: legacyCategory } = useParams()
  const [searchParams] = useSearchParams()
  const requestedCategory = legacyCategory === 'hazards' ? 'diseases-hazards' : (legacyCategory || searchParams.get('category') || 'topics')
  const category = browseConfig[requestedCategory] ? requestedCategory : 'topics'
  const config = browseConfig[category]
  const values = allValues(config.key)
  return <div className="browse-page container">
    <header className="page-title explore-title"><p className="kicker">Explore the atlas</p><h1>Browse by category</h1><p>Choose one lens for exploring the collection. Each value opens a ready-filtered case list.</p></header>
    <nav className="category-switcher" aria-label="Browse categories">
      {Object.entries(browseConfig).map(([slug, option]) => <Link
        to={`/browse?category=${slug}`}
        key={slug}
        className={slug === category ? 'active' : ''}
        aria-current={slug === category ? 'page' : undefined}
      >
        <span>{option.shortTitle}</span>
      </Link>)}
    </nav>
    <section className="browse-results" aria-labelledby="browse-category-title">
      <header><h2 id="browse-category-title">{config.title}</h2><p>{config.description}</p></header>
    {values.length > 0 ? <div className="browse-list">{values.map((value) => {
      const count = content.cases.filter((item) => valuesFor(item, config.key).includes(value)).length
      const label = ['topics', 'functions', 'diseases-hazards', 'settings'].includes(category) ? humanize(value) : value
      return <Link key={value} to={`/cases?${config.key}=${encodeURIComponent(value)}`}><span>{label}</span><small>{count} {count === 1 ? 'case' : 'cases'} →</small></Link>
    })}</div> : <div className="empty-state"><h2>No values available</h2><p>No cases currently include metadata for this browse category.</p></div>}
    </section>
  </div>
}
