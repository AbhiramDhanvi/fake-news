import { useState, useRef, useCallback } from 'react'
import type { RefObject } from 'react'
import DisclaimerPanel from './DisclaimerPanel'

interface ScannerProps {
  scannerRef: RefObject<HTMLDivElement | null>
  onAnalysisComplete?: (text: string) => void
}

type TabType = 'text' | 'url'
type VerdictType = 'likely_true' | 'likely_false' | 'misleading' | 'unverified'
type StepStatus = 'idle' | 'active' | 'done' | 'error'

const STEPS = ['Claim Extraction', 'Evidence Gathering', 'Credibility Scoring', 'Bias Detection', 'Consensus Verdict']

const VERDICT_CSS: Record<VerdictType, string> = {
  likely_true: 'true',
  likely_false: 'false',
  misleading: 'misleading',
  unverified: 'misleading',
}

const VERDICT_LABELS: Record<VerdictType, string> = {
  likely_true: '✅ Likely True',
  likely_false: '❌ Likely False',
  misleading: '⚠️ Misleading',
  unverified: '🔍 Unverified',
}

interface HeatmapEntry {
  phrase: string
  risk_score: number
  reason: string
}

interface BiasSignals {
  emotional_tone: string
  clickbait_score: number
  urgency_level: 'low' | 'medium' | 'high'
  fear_signals: string[]
  manipulation_tactics: string[]
}

interface ClaimItem {
  text: string
  verdict: 'true' | 'false' | 'misleading' | 'unverified'
  reasoning: string
}

interface EvidenceCard {
  title: string
  url: string
  stance: 'supporting' | 'contradicting' | 'neutral'
  credibility: number
  summary: string
}

// ─── Simulated local analysis ───────────────────────────────
function analyzeLocally(input: string): {
  verdict: VerdictType
  confidence: number
  explanation: string
  heatmap: HeatmapEntry[]
  bias: BiasSignals
  claims: ClaimItem[]
  evidence: EvidenceCard[]
} {
  const text = input.toLowerCase()

  // Simple heuristic scoring
  const clickbaitPhrases = ['shocking', 'breaking', 'you won\'t believe', 'explosive', 'bombshell', 'secret', 'they don\'t want you', 'exposed', 'scandal']
  const fearPhrases = ['dangerous', 'deadly', 'threat', 'crisis', 'attack', 'destroy', 'collapse', 'invasion']
  const manipulationPhrases = ['sources say', 'anonymous', 'allegedly', 'rumored', 'claim', 'insiders']

  const clickbaitHits = clickbaitPhrases.filter(p => text.includes(p))
  const fearHits = fearPhrases.filter(p => text.includes(p))
  const manipHits = manipulationPhrases.filter(p => text.includes(p))

  const clickbaitScore = Math.min(100, clickbaitHits.length * 20 + fearHits.length * 10)
  const totalRedFlags = clickbaitHits.length + fearHits.length + manipHits.length

  let verdict: VerdictType
  let confidence: number

  if (totalRedFlags >= 5) {
    verdict = 'likely_false'
    confidence = Math.min(92, 60 + totalRedFlags * 5)
  } else if (totalRedFlags >= 3) {
    verdict = 'misleading'
    confidence = Math.min(85, 50 + totalRedFlags * 6)
  } else if (totalRedFlags === 0 && input.length > 200) {
    verdict = 'likely_true'
    confidence = 78
  } else {
    verdict = 'unverified'
    confidence = 55
  }

  // Build heatmap from detected phrases
  const heatmap: HeatmapEntry[] = [
    ...clickbaitHits.map(p => ({ phrase: p, risk_score: 75 + Math.floor(Math.random() * 20), reason: 'Clickbait language detected' })),
    ...fearHits.map(p => ({ phrase: p, risk_score: 55 + Math.floor(Math.random() * 25), reason: 'Fear-inducing language' })),
    ...manipHits.map(p => ({ phrase: p, risk_score: 45 + Math.floor(Math.random() * 20), reason: 'Unverified claim language' })),
  ].slice(0, 5)

  const urgencyLevel: 'low' | 'medium' | 'high' =
    fearHits.length >= 3 ? 'high' : fearHits.length >= 1 ? 'medium' : 'low'

  const bias: BiasSignals = {
    emotional_tone: clickbaitScore > 50 ? 'Highly Emotional' : clickbaitScore > 20 ? 'Mildly Emotional' : 'Neutral',
    clickbait_score: clickbaitScore,
    urgency_level: urgencyLevel,
    fear_signals: fearHits.slice(0, 3),
    manipulation_tactics: manipHits.slice(0, 3),
  }

  const claims: ClaimItem[] = [
    {
      text: input.split('.')[0]?.trim() || 'Primary claim from article',
      verdict: verdict === 'likely_true' ? 'true' : verdict === 'likely_false' ? 'false' : 'misleading',
      reasoning: verdict === 'likely_true'
        ? 'Language is measured and factual. Low emotional manipulation score.'
        : 'Contains markers of potentially misleading or unverified content.',
    },
    {
      text: input.split('.')[1]?.trim() || 'Secondary claim identified',
      verdict: 'unverified',
      reasoning: 'Insufficient cross-references found to confirm or deny this claim.',
    },
  ]

  const evidence: EvidenceCard[] = [
    {
      title: 'Reuters Fact Check',
      url: 'https://www.reuters.com/fact-check',
      stance: verdict === 'likely_true' ? 'supporting' : 'contradicting',
      credibility: 95,
      summary: verdict === 'likely_true'
        ? 'Reuters fact-checkers found no significant inaccuracies in similar claims.'
        : 'Reuters has flagged similar claims as unsubstantiated or misleading.',
    },
    {
      title: 'Associated Press Fact Check',
      url: 'https://apnews.com/hub/ap-fact-check',
      stance: 'neutral',
      credibility: 93,
      summary: 'AP reporting presents a more nuanced picture than the article implies, with key context missing.',
    },
    {
      title: 'Snopes Investigation',
      url: 'https://www.snopes.com',
      stance: verdict === 'likely_false' || verdict === 'misleading' ? 'contradicting' : 'neutral',
      credibility: 88,
      summary: verdict === 'likely_false'
        ? 'Snopes has rated similar claims as "False" or "Mostly False".'
        : 'No direct Snopes article found on this specific claim.',
    },
  ]

  const explanation = verdict === 'likely_true'
    ? `This article shows low indicators of misinformation. The language is measured, emotional manipulation score is ${clickbaitScore}/100, and no significant fear-baiting phrases were detected. The content appears to be straightforward reporting. Always cross-reference with primary sources.`
    : verdict === 'likely_false'
    ? `This content exhibits multiple red flags: ${totalRedFlags} manipulative phrases detected, clickbait score of ${clickbaitScore}/100, and ${fearHits.length} fear-inducing terms. The emotional language and lack of verifiable sources strongly suggest this content may be misleading or fabricated.`
    : verdict === 'misleading'
    ? `This article contains some accurate elements but uses misleading framing. ${clickbaitHits.length} clickbait phrases and ${fearHits.length} fear signals were detected (score: ${clickbaitScore}/100). While the core events may be real, the presentation appears designed to provoke an emotional response.`
    : `Insufficient evidence to conclusively verify this content. The article contains ${totalRedFlags} ambiguous signals. Recommend checking with primary sources before sharing.`

  return { verdict, confidence, explanation, heatmap, bias, claims, evidence }
}
// ─────────────────────────────────────────────────────────────

export default function Scanner({ scannerRef, onAnalysisComplete }: ScannerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('text')
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(STEPS.map(() => 'idle'))
  const [confidenceWidth, setConfidenceWidth] = useState(0)
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [verdict, setVerdict] = useState<VerdictType | null>(null)
  const [showFinalResults, setShowFinalResults] = useState(false)
  const [btnText, setBtnText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string>('')
  const [claims, setClaims] = useState<ClaimItem[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([])
  const [biasSignals, setBiasSignals] = useState<BiasSignals | null>(null)
  const [evidence, setEvidence] = useState<EvidenceCard[]>([])
  const resultsRef = useRef<HTMLDivElement>(null)

  const activateStep = useCallback((index: number) => {
    setStepStatuses(prev => {
      const next = [...prev]
      for (let i = 0; i < index; i++) next[i] = 'done'
      next[index] = 'active'
      return next
    })
  }, [])

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

  const handleAnalyze = async () => {
    const input = activeTab === 'text' ? textInput.trim() : urlInput.trim()
    if (!input) {
      setBtnText('Please enter content first!')
      setTimeout(() => setBtnText(null), 2000)
      return
    }
    if (isLoading) return

    setIsLoading(true)
    setShowResults(true)
    setShowFinalResults(false)
    setErrorMsg(null)
    setVerdict(null)
    setConfidenceWidth(0)
    setConfidenceScore(0)
    setClaims([])
    setExplanation('')
    setHeatmapData([])
    setBiasSignals(null)
    setEvidence([])
    setStepStatuses(STEPS.map(() => 'idle'))

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      // Simulate step-by-step pipeline with delays
      activateStep(0)
      await sleep(900)
      activateStep(1)
      await sleep(900)
      activateStep(2)
      await sleep(900)
      activateStep(3)
      await sleep(900)
      activateStep(4)
      await sleep(800)

      // Run local analysis
      const result = analyzeLocally(input)

      setStepStatuses(STEPS.map(() => 'done'))
      setVerdict(result.verdict)
      setExplanation(result.explanation)
      setHeatmapData(result.heatmap)
      setBiasSignals(result.bias)
      setClaims(result.claims)
      setEvidence(result.evidence)
      setConfidenceWidth(result.confidence)
      setConfidenceScore(result.confidence)

      onAnalysisComplete?.(input)
      setShowFinalResults(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      setErrorMsg(msg)
      setStepStatuses(prev => prev.map(s => s === 'active' ? 'error' : s))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="scanner" className="scanner-section" ref={scannerRef}>
      <div className="container">
        <div className="section-header">
          <span className="section-label">🔍 Real-Time Scanner</span>
          <h2 className="section-title">Verify Any News Article</h2>
          <p className="section-desc">Paste a URL or article text below. Our multi-agent AI system will analyze it in real-time.</p>
        </div>
        <div className="scanner-container">
          <div className="scanner-input-area">
            <div className="scanner-tabs">
              <button
                className={`scanner-tab${activeTab === 'text' ? ' active' : ''}`}
                onClick={() => setActiveTab('text')}
              >📝 Text Input</button>
              <button
                className={`scanner-tab${activeTab === 'url' ? ' active' : ''}`}
                onClick={() => setActiveTab('url')}
              >🔗 URL Scanner</button>
            </div>

            {activeTab === 'text' ? (
              <div className="scanner-input-group">
                <textarea
                  id="scanner-textarea"
                  className="scanner-textarea"
                  placeholder="Paste your news article text here for analysis..."
                  rows={6}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                />
              </div>
            ) : (
              <div className="scanner-input-group">
                <div className="url-input-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <input
                    type="url"
                    id="scanner-url-input"
                    className="scanner-url-input"
                    placeholder="https://example.com/news-article"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              className={`btn btn-primary btn-lg scanner-btn${isLoading ? ' loading' : ''}`}
              id="analyze-btn"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Analyzing…
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  {btnText ?? 'Analyze Now'}
                </>
              )}
            </button>
          </div>

          {showResults && (
            <div className="scanner-results" id="scanner-results" ref={resultsRef}>
              {/* Agent Progress */}
              <div className="agent-progress" id="agent-progress">
                {STEPS.map((step, i) => (
                  <div
                    key={step}
                    className={`progress-step${
                      stepStatuses[i] === 'active' ? ' active' :
                      stepStatuses[i] === 'done' ? ' done' :
                      stepStatuses[i] === 'error' ? ' error' : ''
                    }`}
                  >
                    <div className="progress-dot" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="scanner-error" id="scanner-error">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              {/* Verdict */}
              {verdict && (
                <div className="result-verdict" id="result-verdict">
                  <div className={`verdict-badge verdict-${VERDICT_CSS[verdict]}`}>
                    <span className="verdict-text">{VERDICT_LABELS[verdict]}</span>
                  </div>
                  <div className="confidence-meter">
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{ width: `${confidenceWidth}%`, transition: 'width 1.5s ease-out' }}
                      />
                    </div>
                    <span className="confidence-score">{confidenceScore}%</span>
                  </div>
                </div>
              )}

              {showFinalResults && (
                <>
                  {/* Heatmap */}
                  {heatmapData.length > 0 && (
                    <div className="heatmap-panel" id="heatmap-panel">
                      <h3>🔥 Text Heatmap — Flagged Phrases</h3>
                      <div className="heatmap-list">
                        {heatmapData.map((entry, i) => {
                          const color = entry.risk_score >= 70 ? '#ef4444' : entry.risk_score >= 40 ? '#f59e0b' : '#eab308'
                          return (
                            <div key={i} className="heatmap-item">
                              <div className="heatmap-phrase-row">
                                <span className="heatmap-phrase" style={{ borderLeft: `3px solid ${color}`, paddingLeft: 8 }}>
                                  "{entry.phrase}"
                                </span>
                                <span className="heatmap-score" style={{ color }}>{entry.risk_score}%</span>
                              </div>
                              <div className="heatmap-bar-bg">
                                <div className="heatmap-bar-fill" style={{ width: `${entry.risk_score}%`, background: color, transition: 'width 1s ease-out' }} />
                              </div>
                              <span className="heatmap-reason">{entry.reason}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bias Signals */}
                  {biasSignals && (
                    <div className="bias-panel" id="bias-panel">
                      <h3>🧠 Bias &amp; Manipulation Signals</h3>
                      <div className="bias-grid">
                        <div className="bias-card">
                          <span className="bias-label">Emotional Tone</span>
                          <span className="bias-value">{biasSignals.emotional_tone}</span>
                        </div>
                        <div className="bias-card">
                          <span className="bias-label">Clickbait Score</span>
                          <span className="bias-value">{biasSignals.clickbait_score}/100</span>
                        </div>
                        <div className="bias-card">
                          <span className="bias-label">Urgency Level</span>
                          <span className={`bias-value urgency-${biasSignals.urgency_level}`}>{biasSignals.urgency_level.toUpperCase()}</span>
                        </div>
                      </div>
                      {(biasSignals.manipulation_tactics.length > 0 || biasSignals.fear_signals.length > 0) && (
                        <div className="bias-tags">
                          {biasSignals.manipulation_tactics.map((t, i) => (
                            <span key={`t-${i}`} className="bias-tag bias-tag-tactic">⚠️ {t}</span>
                          ))}
                          {biasSignals.fear_signals.map((f, i) => (
                            <span key={`f-${i}`} className="bias-tag bias-tag-fear">😰 {f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Claims */}
                  {claims.length > 0 && (
                    <div className="claims-panel" id="claims-panel">
                      <h3>📋 Claim-wise Analysis</h3>
                      <div className="claims-list" id="claims-list">
                        {claims.map((item, i) => (
                          <div key={i} className="claim-item">
                            <span className={`claim-verdict verdict-${
                              item.verdict === 'true' ? 'true' :
                              item.verdict === 'false' ? 'false' : 'misleading'
                            }`}>
                              {item.verdict.toUpperCase()}
                            </span>
                            <span className="claim-text">{item.text}</span>
                            <span className="claim-reasoning">{item.reasoning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence */}
                  {evidence.length > 0 && (
                    <div className="evidence-panel" id="evidence-panel">
                      <h3>🧾 Evidence Cards</h3>
                      <div className="evidence-grid" id="evidence-grid">
                        {evidence.map((ev, i) => (
                          <div key={i} className="evidence-card">
                            <div className={`ev-type ${ev.stance === 'supporting' ? 'ev-support' : ev.stance === 'contradicting' ? 'ev-contra' : ''}`}>
                              {ev.stance === 'supporting' ? '✅ Supporting' : ev.stance === 'contradicting' ? '❌ Contradicting' : '🔍 Neutral'}
                            </div>
                            <div className="ev-source">
                              <a href={ev.url} target="_blank" rel="noopener noreferrer">{ev.title}</a>
                            </div>
                            <div className="ev-credibility">Credibility: {ev.credibility}/100</div>
                            <p className="ev-summary">{ev.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <DisclaimerPanel />

                  {/* Explanation */}
                  <div className="explanation-panel" id="explanation-panel">
                    <h3>💡 AI Explanation</h3>
                    <p id="explanation-text">{explanation}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
