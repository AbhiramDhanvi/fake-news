import { useEffect, useRef } from 'react'

interface Feature {
  svgPath: string
  title: string
  desc: string
}

const features: Feature[] = [
  {
    svgPath: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    title: 'Content Analysis Engine',
    desc: 'Input text or URL — AI analyzes news content and detects misinformation patterns instantly.',
  },
  {
    svgPath: '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>',
    title: 'Verdict Classification',
    desc: 'Get clear outputs: Likely True, Likely False, Misleading, or Unverified with supporting evidence.',
  },
  {
    svgPath: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
    title: 'Confidence Score',
    desc: 'Score from 0–100% indicates reliability of prediction with full calibration transparency.',
  },
  {
    svgPath: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/>',
    title: 'Evidence Cards',
    desc: 'Supporting ✅ and contradicting ❌ sources with links and summaries for full transparency.',
  },
  {
    svgPath: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    title: 'Claim-wise Analysis',
    desc: 'Breaks articles into individual claims and verifies each one separately with detailed reasoning.',
  },
  {
    svgPath: '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>',
    title: 'Explainability Heatmap',
    desc: "Highlights suspicious words and phrases, showing the AI's reasoning behind each decision.",
  },
  {
    svgPath: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    title: 'Multi-Source Verification',
    desc: 'Fetches and cross-checks data from multiple trusted sources for comprehensive verification.',
  },
  {
    svgPath: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    title: 'Source Credibility Score',
    desc: 'Trust score for each domain based on historical accuracy, editorial standards, and reliability.',
  },
  {
    svgPath: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    title: 'Bias & Emotion Detection',
    desc: 'Detects fear language, clickbait patterns, urgency cues, and emotional manipulation.',
  },
  {
    svgPath: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    title: 'AI Fact-Check Chatbot',
    desc: 'Ask "Why is this fake?" or "Show evidence" — a context-aware chatbot answers instantly.',
  },
  {
    svgPath: '<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    title: 'Real-Time Scan Mode',
    desc: 'Instant analysis on input with quick alerts — scan content as you type or paste URLs.',
  },
  {
    svgPath: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    title: 'Trust Score System',
    desc: 'Users earn points for correct verifications and adding sources — building community credibility.',
  },
]

export default function Features() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.feature-card')
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
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Power. Intelligence. Trust.</h2>
          <p className="section-desc">Everything you need to verify news and fight misinformation with AI.</p>
        </div>
        <div className="features-grid" ref={gridRef}>
          {features.map((feature, i) => (
            <div className="feature-card" key={i} id={`feature-${i + 1}`}>
              <div className="feature-pattern" />
              <svg
                className="feature-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                dangerouslySetInnerHTML={{ __html: feature.svgPath }}
              />
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
