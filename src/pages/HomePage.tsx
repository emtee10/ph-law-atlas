import { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBox from '../components/SearchBox'
import { casesById, content, formatDate } from '../lib/content'

const browse = [
  ['Subjects and settings', 'Explore topics, diseases, hazards, and settings', '/browse?category=topics'],
  ['Public health functions', 'Find cases by public health activity', '/browse?category=functions'],
  ['Legal framework', 'Browse legislation, provisions, and courts', '/browse?category=legislation'],
]

export default function HomePage() {
  const [featured] = useState(() => {
    if (content.featuredQuestions.length === 0) return undefined
    return content.featuredQuestions[Math.floor(Math.random() * content.featuredQuestions.length)]
  })
  const featuredCase = featured ? casesById.get(featured.target_id) : undefined
  const recent = [...content.cases].sort((a, b) => (b.editorial?.last_updated ?? b.decision_date).localeCompare(a.editorial?.last_updated ?? a.decision_date)).slice(0, 3)
  return <>
    <section className="hero">
      <div className="container hero-inner">
        <p className="kicker">A practical jurisprudence reference</p>
        <h1>Ontario public health law,<br /><em>made easier to navigate.</em></h1>
        <p className="hero-copy">Search and explore a curated collection of cases relevant to Medical Officers of Health, public health teams, and legal and policy professionals.</p>
        <SearchBox large />
        <p className="search-hint">Try “section 22”, “precautionary principle”, or a health unit name.</p>
      </div>
    </section>

    <section className="browse-section container" aria-labelledby="browse-heading">
      <div className="section-heading"><div><p className="kicker">Browse the atlas</p><h2 id="browse-heading">Find the right starting point</h2></div><Link className="text-link" to="/cases">View all {content.cases.length} cases →</Link></div>
      <div className="browse-grid">{browse.map(([title, copy, href], index) => <Link className="browse-card" to={href} key={title}>
        <span className="browse-number">0{index + 1}</span><h3>{title}</h3><p>{copy}</p><span aria-hidden="true" className="arrow">↗</span>
      </Link>)}</div>
    </section>

    {featured && featuredCase && <section className="featured-section">
      <div className="container featured-grid">
        <div><p className="kicker light">Featured question</p><h2>{featured.question}</h2></div>
        <div className="featured-answer"><p>Explore how the court approached this question in:</p><Link to={`/cases/${featuredCase.id}`}><strong>{featuredCase.title}</strong><span>{featuredCase.citation} · Read the case →</span></Link></div>
      </div>
    </section>}

    {recent.length > 0 && <section className="recent-section container">
      <div className="section-heading"><div><p className="kicker">From the collection</p><h2>Recently added or updated</h2></div></div>
      <div className="recent-list">{recent.map((item) => <article key={item.id}>
        <div><span>{item.court}</span><span>{formatDate(item.decision_date)}</span></div>
        <h3><Link to={`/cases/${item.id}`}>{item.title}</Link></h3><p>{item.citation}</p>
      </article>)}</div>
    </section>}
  </>
}
