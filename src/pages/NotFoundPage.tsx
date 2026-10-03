import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <div className="not-found container"><p className="kicker">404</p><h1>Page not found</h1><p>The page may have moved, or the case is not part of the visible collection.</p><Link className="button-link" to="/cases">Browse all cases</Link></div>
}
