import { Link } from 'react-router-dom'
import TrustStats from '../components/TrustStats'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Agents from '../components/Agents'
import ShaderAnimation from '../components/ShaderAnimation'
import Comparison from '../components/Comparison'
import KnowledgeGraph from '../components/KnowledgeGraph'
import Footer from '../components/Footer'

export default function HowItWorksPage() {
  return (
    <div className="page-wrapper">
      {/* Page hero */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <span className="section-label">🧠 Methodology</span>
          <h1 className="page-hero-title">
            How TruthLens Works
          </h1>
          <p className="page-hero-desc">
            Five specialized AI agents work in concert to analyze news articles —
            extracting claims, gathering evidence, scoring source credibility,
            detecting linguistic bias, and delivering a confidence-calibrated verdict.
          </p>
          <div className="page-hero-actions">
            <Link to="/" className="btn btn-primary btn-sm">Try the Scanner →</Link>
            <Link to="/community" className="btn btn-outline btn-sm">Join Community</Link>
          </div>
        </div>
      </div>

      {/* Pipeline summary strip */}
      <div className="pipeline-strip">
        <div className="container">
          <div className="pipeline-strip-inner">
            {[
              { n: '01', name: 'Claim Agent', icon: '🔍', desc: 'Extracts verifiable factual claims' },
              { n: '02', name: 'Evidence Agent', icon: '📂', desc: 'Fetches corroborating sources' },
              { n: '03', name: 'Credibility Agent', icon: '⭐', desc: 'Scores source trustworthiness' },
              { n: '04', name: 'Bias Agent', icon: '⚖️', desc: 'Detects linguistic manipulation' },
              { n: '05', name: 'Consensus Agent', icon: '🏛️', desc: 'Synthesises final verdict' },
            ].map((step, i) => (
              <div key={step.n} className="pipeline-strip-step">
                <div className="pipeline-strip-num">{step.n}</div>
                <div className="pipeline-strip-icon">{step.icon}</div>
                <div className="pipeline-strip-name">{step.name}</div>
                <div className="pipeline-strip-desc">{step.desc}</div>
                {i < 4 && <div className="pipeline-strip-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <TrustStats />
      <Features />
      <HowItWorks />
      <Agents />
      <ShaderAnimation />
      <Comparison />
      <KnowledgeGraph />
      <Footer />
    </div>
  )
}
