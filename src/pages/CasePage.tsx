import { Link, Navigate, useParams } from 'react-router-dom'
import { casesById, content, formatDate, humanize } from '../lib/content'

const relationLabels: Record<string, string> = {
  'appeal-of': 'Appeal of', 'appealed-by': 'Appealed by', 'judicial-review-of': 'Judicial review of',
  'reviewed-by': 'Reviewed by', affirms: 'Affirms', reverses: 'Reverses', varies: 'Varies', 'related-litigation': 'Related litigation',
}

function MetaGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="meta-group"><h3>{title}</h3><div>{children}</div></div>
}

export default function CasePage() {
  const { id } = useParams()
  const item = id ? casesById.get(id) : undefined
  if (!item) return <Navigate to="/not-found" replace />
  const family = item.case_family ? content.cases.filter((candidate) => candidate.case_family === item.case_family && candidate.id !== item.id) : []
  const relationships = item.relationships.map((relation) => ({ ...relation, target: casesById.get(relation.target_id) })).filter((relation) => relation.target)

  return <>
    <div className="case-header">
      <div className="container case-header-inner">
        <Link className="back-link" to="/cases">← All cases</Link>
        <div className="case-heading-grid"><div>
          <p className="kicker light">{item.court} · {item.jurisdiction}</p><h1>{item.title}</h1><p className="case-citation">{item.citation}</p>
        </div><dl><div><dt>Decision date</dt><dd>{formatDate(item.decision_date)}</dd></div><div><dt>Court</dt><dd>{item.court}</dd></div>{item.canlii?.url && <div><dt>Original decision</dt><dd><a href={item.canlii.url} target="_blank" rel="noreferrer">View on CanLII ↗</a></dd></div>}</dl></div>
      </div>
    </div>
    <div className="container case-layout">
      <article className="case-body">
        <div className="markdown" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
        <div className="case-disclaimer"><strong>About this resource</strong><p>This resource is a curated reference aid and is not legal advice. The original decision is authoritative.</p></div>
      </article>
      <aside className="case-sidebar" aria-label="Case metadata">
        <h2>Case details</h2>
        {item.public_health_functions.length > 0 && <MetaGroup title="Public health functions">{item.public_health_functions.map((value) => <Link className="meta-chip" to={`/cases?public_health_functions=${encodeURIComponent(value)}`} key={value}>{humanize(value)}</Link>)}</MetaGroup>}
        {item.topics.length > 0 && <MetaGroup title="Topics">{item.topics.map((value) => <Link className="meta-chip" to={`/cases?topics=${encodeURIComponent(value)}`} key={value}>{humanize(value)}</Link>)}</MetaGroup>}
        {item.diseases_or_hazards.length > 0 && <MetaGroup title="Diseases or hazards">{item.diseases_or_hazards.map((value) => <Link className="meta-chip" to={`/cases?diseases_or_hazards=${encodeURIComponent(value)}`} key={value}>{humanize(value)}</Link>)}</MetaGroup>}
        {item.settings.length > 0 && <MetaGroup title="Settings">{item.settings.map((value) => <Link className="meta-chip" to={`/cases?settings=${encodeURIComponent(value)}`} key={value}>{humanize(value)}</Link>)}</MetaGroup>}
        {item.legislation.length > 0 && <MetaGroup title="Legislation"><div className="legislation-list">{item.legislation.map((law, lawIndex) => {
          const registry = content.legislation[law.short_name]
          const key = `${law.short_name || law.statute}-${lawIndex}`
          return <div className="legislation-item" key={key}>
            {registry?.official_url
              ? <a className="statute-link" href={registry.official_url} target="_blank" rel="noreferrer">{law.statute}<span aria-hidden="true"> ↗</span></a>
              : <span className="statute-link">{law.statute}</span>}
            {law.citation && <span className="statute-citation">{law.citation}</span>}
            {law.provisions?.length > 0 && <div className="provision-list" aria-label={`Sections referenced from ${law.statute}`}>
              {law.provisions.map((provision, provisionIndex) => {
                const provisionEntry = registry?.provisions?.[provision]
                return provisionEntry?.official_url
                  ? <a className="provision-link" href={provisionEntry.official_url} target="_blank" rel="noreferrer" key={`${provision}-${provisionIndex}`}>{provision}<span className="visually-hidden"> of {law.statute}</span><span aria-hidden="true"> ↗</span></a>
                  : <span className="provision-link" key={`${provision}-${provisionIndex}`}>{provision}</span>
              })}
            </div>}
          </div>
        })}</div></MetaGroup>}
        {item.public_health_organizations.length > 0 && <MetaGroup title="Public health organizations">{item.public_health_organizations.map((org) => <span className="org-item" key={org.id}>{org.name}{org.role && <small>{humanize(org.role)}</small>}</span>)}</MetaGroup>}
        {item.public_health_roles.length > 0 && <MetaGroup title="Public health roles">{item.public_health_roles.map((org) => <span className="org-item" key={org}>{humanize(org)}</span>)}</MetaGroup>}
        {(relationships.length > 0 || family.length > 0) && <MetaGroup title="Related litigation">
          {relationships.map((relation) => <Link className="related-link" to={`/cases/${relation.target!.id}`} key={`${relation.type}-${relation.target_id}`}><small>{relationLabels[relation.type] ?? humanize(relation.type)}</small>{relation.target!.title}</Link>)}
          {family.filter((related) => !relationships.some((relation) => relation.target_id === related.id)).map((related) => <Link className="related-link" to={`/cases/${related.id}`} key={related.id}><small>Same case family</small>{related.title}</Link>)}
        </MetaGroup>}
      </aside>
    </div>
  </>
}
