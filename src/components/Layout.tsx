import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [location.pathname])

  return <div className="app-shell">
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="PH Law Atlas home">
          <span><strong>PH Law Atlas</strong><small>Ontario public health jurisprudence</small></span>
        </Link>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-nav">Menu</button>
        <nav id="main-nav" className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Primary navigation">
          <NavLink to="/cases">Cases</NavLink>
          <NavLink to="/browse">Explore</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </div>
    </header>
    <main id="main"><Outlet /></main>
    <footer className="site-footer">
      <div className="container footer-inner">
        <div><strong>PH Law Atlas</strong><p>Ontario public health cases and legal authorities.</p></div>
        <p className="disclaimer">This resource is a curated reference aid and is not legal advice. The original decision is authoritative.</p>
      </div>
    </footer>
  </div>
}
