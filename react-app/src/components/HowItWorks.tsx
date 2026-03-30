import { useEffect, useRef } from 'react'

const STEP_ICONS = [
  // Search
  <svg key="search" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>,
  // FileText
  <svg key="file" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6"/>
  </svg>,
  // CheckCircle
  <svg key="check" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
  </svg>,
]

const steps = [
  {
    title: 'Input Your Content',
    desc: 'Paste a news article URL or text. Our AI instantly begins content extraction and preprocessing.',
    benefits: ['URL auto-extraction and parsing', 'Smart text preprocessing', 'Multi-language support'],
  },
  {
    title: 'Multi-Agent Analysis',
    desc: '5 AI agents work in parallel: extracting claims, gathering evidence, scoring sources, and detecting bias.',
    benefits: ['Parallel claim extraction', 'Cross-source verification', 'Bias & emotion scanning'],
  },
  {
    title: 'Get Your Verdict',
    desc: 'Receive a confidence-calibrated verdict with evidence cards, explanations, and a detailed breakdown.',
    benefits: ['True / False / Misleading verdict', 'Evidence cards with sources', 'Human-readable explanation'],
  },
]

export default function HowItWorks() {
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.step-card')
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
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-desc">Our multi-agent system uses a sophisticated pipeline to analyze and verify news content in three simple steps.</p>
        </div>
        <div className="steps-indicators">
          <div className="steps-line" />
          <div className="step-number">1</div>
          <div className="step-number">2</div>
          <div className="step-number">3</div>
        </div>
        <div className="steps-grid" ref={cardsRef}>
          {steps.map((step, i) => (
            <div className="step-card" key={i} id={`step-${i + 1}`}>
              <div className="step-icon">
                {STEP_ICONS[i]}
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <ul className="step-benefits">
                {step.benefits.map((benefit, j) => (
                  <li key={j}><span className="benefit-dot" />{benefit}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
