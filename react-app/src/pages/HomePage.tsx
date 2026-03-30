import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Scanner from '../components/Scanner'
import Footer from '../components/Footer'

interface HomePageProps {
  onArticleAnalyzed?: (text: string) => void
}

const STATS = [
  { num: '99.2%', label: 'Detection Accuracy', icon: '🎯' },
  { num: '4.2s',  label: 'Avg. Analysis Time', icon: '⚡' },
  { num: '50k+',  label: 'Articles Scanned',   icon: '📰' },
  { num: '5',     label: 'AI Agents Working',   icon: '🤖' },
]

const AGENTS = [
  { n: '1', name: 'Claim Extraction',    color: '#6366f1', icon: '🔍' },
  { n: '2', name: 'Evidence Gathering',  color: '#2563EB', icon: '📂' },
  { n: '3', name: 'Credibility Scoring', color: '#10B981', icon: '⭐' },
  { n: '4', name: 'Bias Detection',      color: '#F59E0B', icon: '⚖️' },
  { n: '5', name: 'Consensus Verdict',   color: '#ec4899', icon: '🏛️' },
]

export default function HomePage({ onArticleAnalyzed }: HomePageProps) {
  const scannerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="home-v2">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="home-hero-full">
        {/* Ambient background blobs */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="container hero-container">
          {/* Badge */}
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Misinformation Detection
          </div>

          {/* Headline */}
          <h1 className="hero-headline">
            See Through the<br />
            <span className="hero-headline-accent">Noise.</span>{' '}
            <span className="hero-headline-sub-accent">Instantly.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subline">
            Superman Vision uses five specialized AI agents to analyze any news article in
            real time — extracting claims, gathering evidence, scoring credibility, detecting
            bias, and delivering a confidence-calibrated verdict you can trust.
          </p>

          {/* CTAs */}
          <div className="hero-cta-row">
            <button
              className="btn btn-primary hero-cta-primary"
              onClick={() => scannerRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              ⚡ Analyze an Article
            </button>
            <Link to="/how-it-works" className="btn btn-outline hero-cta-outline">
              How it works →
            </Link>
          </div>

          {/* Stats cards */}
          <div className="hero-stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="hero-stat-card">
                <div className="hero-stat-icon">{s.icon}</div>
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Agent pipeline */}
          <div className="hero-pipeline">
            {AGENTS.map((a, i) => (
              <div key={a.n} className="hero-pipeline-step">
                <div
                  className="hero-pipeline-icon"
                  style={{ background: a.color + '18', border: `1.5px solid ${a.color}44` }}
                >
                  <span>{a.icon}</span>
                  <span className="hero-pipeline-num" style={{ color: a.color }}>
                    {a.n}
                  </span>
                </div>
                <span className="hero-pipeline-name">{a.name}</span>
                {i < AGENTS.length - 1 && (
                  <div className="hero-pipeline-arrow">→</div>
                )}
              </div>
            ))}
          </div>

          {/* Trust strip */}
          <div className="hero-trust-strip">
            <span>Trusted by journalists, researchers &amp; educators</span>
            <span className="hero-trust-dot" />
            <span>No account required</span>
            <span className="hero-trust-dot" />
            <span>100% free, always</span>
          </div>
        </div>
      </section>

      {/* ── SCANNER ───────────────────────────────────────────── */}
      <section className="home-scanner-full" id="scanner" ref={scannerRef}>
        <div className="container">
          <div className="home-scanner-heading">
            <span className="section-label">🔍 Live Scanner</span>
            <h2 className="home-scanner-title">
              Verify Any Article — Right Now
            </h2>
            <p className="home-scanner-desc">
              Paste article text or a URL below. Our multi-agent pipeline will run in seconds
              and deliver a full breakdown: verdict, claims, evidence, heatmap, and bias analysis.
            </p>
          </div>

          <div className="home-scanner-card">
            <Scanner
              scannerRef={scannerRef}
              onAnalysisComplete={onArticleAnalyzed}
              isEmbedded
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}
