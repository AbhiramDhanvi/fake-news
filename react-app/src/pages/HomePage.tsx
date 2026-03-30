import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Scanner from '../components/Scanner'

interface HomePageProps {
  onArticleAnalyzed?: (text: string) => void
}

const AGENT_CHIPS = [
  { n: '1', label: 'Claim', color: '#6366f1' },
  { n: '2', label: 'Evidence', color: '#2563EB' },
  { n: '3', label: 'Credibility', color: '#10B981' },
  { n: '4', label: 'Bias', color: '#F59E0B' },
  { n: '5', label: 'Consensus', color: '#ec4899' },
]

export default function HomePage({ onArticleAnalyzed }: HomePageProps) {
  const scannerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="home-page">
      {/* ── Left: Hero panel ── */}
      <div className="home-hero-panel">
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <span className="badge-dot" />
            AI-Powered Fact Checking
          </div>

          <h1 className="home-hero-title">
            Detect<br />
            Misinformation<br />
            <span className="home-hero-accent">Instantly</span>
          </h1>

          <p className="home-hero-sub">
            Five specialized AI agents analyze any article in real time —
            extracting claims, gathering evidence, scoring credibility,
            detecting bias, and delivering a confidence-calibrated verdict.
          </p>

          {/* Stats */}
          <div className="home-stats-row">
            <div className="home-stat">
              <span className="home-stat-num">99.2<span className="home-stat-suffix">%</span></span>
              <span className="home-stat-lab">Accuracy</span>
            </div>
            <div className="home-stat-div" />
            <div className="home-stat">
              <span className="home-stat-num">4.2<span className="home-stat-suffix">s</span></span>
              <span className="home-stat-lab">Avg. analysis</span>
            </div>
            <div className="home-stat-div" />
            <div className="home-stat">
              <span className="home-stat-num">50<span className="home-stat-suffix">k+</span></span>
              <span className="home-stat-lab">Scanned</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="home-cta-row">
            <Link to="/how-it-works" className="btn btn-outline btn-sm">How it works →</Link>
            <Link to="/community" className="btn btn-outline btn-sm">Join community →</Link>
          </div>

          {/* Agent chips */}
          <div className="home-agents-row">
            {AGENT_CHIPS.map(a => (
              <div key={a.n} className="home-agent-chip">
                <span className="home-agent-num" style={{ background: a.color + '22', color: a.color, border: `1px solid ${a.color}44` }}>
                  {a.n}
                </span>
                <span className="home-agent-label">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ambient background shapes */}
        <div className="home-hero-shape home-hero-shape-1" />
        <div className="home-hero-shape home-hero-shape-2" />
      </div>

      {/* ── Right: Scanner panel ── */}
      <div className="home-scanner-panel">
        <div className="home-scanner-header">
          <div className="home-scanner-header-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'#6366f1' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="home-scanner-title">Live Scanner</span>
            <span className="home-scanner-live-dot" />
          </div>
          <span className="home-scanner-hint">Paste article text or URL to verify</span>
        </div>
        <div className="home-scanner-body">
          <Scanner
            scannerRef={scannerRef}
            onAnalysisComplete={onArticleAnalyzed}
            isEmbedded
          />
        </div>
      </div>
    </div>
  )
}
