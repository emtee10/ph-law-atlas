import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBox({ initial = '', large = false }: { initial?: string; large?: boolean }) {
  const [query, setQuery] = useState(initial)
  const navigate = useNavigate()
  function submit(event: FormEvent) {
    event.preventDefault()
    navigate(`/cases${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }
  return <form className={`search-box ${large ? 'search-box-large' : ''}`} role="search" onSubmit={submit}>
    <label htmlFor={large ? 'home-search' : 'case-search'}>Search the case collection</label>
    <div className="search-row">
      <span aria-hidden="true" className="search-icon">⌕</span>
      <input id={large ? 'home-search' : 'case-search'} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cases, topics, statutes, or s. 22…" />
      <button type="submit">Search</button>
    </div>
  </form>
}
