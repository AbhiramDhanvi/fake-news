import { useEffect, useRef } from 'react'

const stats = [
  { value: '98.7%', label: 'Detection Accuracy', desc: 'Industry-leading accuracy in identifying misinformation patterns using multi-source verification.' },
  { value: '5', label: 'Specialized AI Agents', desc: 'A team of AI agents each focused on claims, evidence, credibility, bias, and consensus.' },
  { value: '50K+', label: 'Sources Verified', desc: 'Cross-referencing tens of thousands of trusted sources for every claim in real-time.' },
  { value: '<3s', label: 'Analysis Time', desc: 'Lightning-fast parallel processing delivers comprehensive verification in seconds.' },
  { value: '0–100', label: 'Confidence Score', desc: 'Calibrated confidence scoring with full transparency on how each verdict was reached.' },
]

export default function TrustStats() {
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.trust-card')
    if (!cards) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => (entry.target as HTMLElement).classList.add('visible'), i * 60)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    cards.forEach(card => {
      card.classList.add('reveal')
      observer.observe(card)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="trust-stats" className="trust-stats-section">
      <div className="container">
        <div className="trust-stats-header">
          <span className="section-label">Core Values</span>
          <h2 className="section-title">Building Trust Through AI-Powered Verification</h2>
          <p className="section-desc">Our multi-agent system combines cutting-edge AI with rigorous fact-checking methodology to deliver reliable, transparent verdicts.</p>
        </div>
        <div className="trust-cards-grid" ref={cardsRef}>
          {stats.map((stat, i) => (
            <div
              className={`trust-card${i === 2 ? ' trust-card-featured' : ''}`}
              key={i}
              id={`trust-card-${i + 1}`}
            >
              <h3 className="trust-value">{stat.value}</h3>
              <p className="trust-label">{stat.label}</p>
              <p className="trust-desc">{stat.desc}</p>
              <a href="#" className="trust-link">Learn more →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
