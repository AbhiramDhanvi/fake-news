import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'

interface NavbarProps {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
}

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/how-it-works', label: 'How it Works', end: false },
  { to: '/community', label: 'Community', end: false },
  { to: '/contact', label: 'Contact', end: false },
]

export default function Navbar({ theme: _theme, onThemeToggle }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav id="navbar" className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" id="nav-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="url(#logoGrad)" strokeWidth="2.5"/>
            <path d="M10 16.5L14 20.5L22 12.5" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="logoGrad" x1="4" y1="4" x2="28" y2="28">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#ec4899"/>
              </linearGradient>
            </defs>
          </svg>
          <span>TruthLens<span className="brand-ai">AI</span></span>
        </Link>

        <div className={`navbar-links${mobileOpen ? ' open' : ''}`} id="nav-links">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link${isActive ? ' nav-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="theme-toggle"
            id="theme-toggle"
            onClick={onThemeToggle}
            aria-label="Toggle theme"
          >
            <svg className="sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <svg className="moon-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <Link to="/" className="btn btn-primary btn-sm" id="nav-cta">
            Analyze Free
          </Link>
          <button
            className="mobile-menu-btn"
            id="mobile-menu-btn"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(prev => !prev)}
          >
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </nav>
  )
}
