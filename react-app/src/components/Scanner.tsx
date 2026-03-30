import { useState, useRef, useCallback } from 'react'
import type { RefObject } from 'react'
import DisclaimerPanel from './DisclaimerPanel'
import {
  submitNews,
  triggerPipeline,
  pollAnalysisResult,
  getClaimBreakdown,
  getVerdictLabel,
  type AnalysisResult,
  type ClaimBreakdownItem,
  type HeatmapEntry,
  type BiasSignals,
} from '../lib/insforge'

interface ScannerProps {
  scannerRef: RefObject<HTMLDivElement | null>
  onAnalysisComplete?: (newsId: string, analysis: AnalysisResult) => void
}

type TabType = 'text' | 'url'
type VerdictType = AnalysisResult['final_verdict']
type StepStatus = 'idle' | 'active' | 'done' | 'error'

const STEPS = ['Claim Extraction', 'Evidence Gathering', 'Credibility Scoring', 'Bias Detection', 'Consensus Verdict']

const VERDICT_CSS: Record<VerdictType, string> = {
  likely_true: 'true',
  likely_false: 'false',
  misleading: 'misleading',
  unverified: 'misleading',
}

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
  const [claimBreakdown, setClaimBreakdown] = useState<ClaimBreakdownItem[]>([])
  const [currentNewsId, setCurrentNewsId] = useState<string | null>(null)
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([])
  const [biasSignals, setBiasSignals] = useState<BiasSignals | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const activateStep = useCallback((index: number) => {
    setStepStatuses(prev => {
      const next = [...prev]
      for (let i = 0; i < index; i++) next[i] = 'done'
      next[index] = 'active'
      return next
    })
  }, [])

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
    setClaimBreakdown([])
    setExplanation('')
    setHeatmapData([])
    setBiasSignals(null)
    setStepStatuses(STEPS.map(() => 'idle'))

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      // Step 1: Submit
      activateStep(0)
      const submitResult = await submitNews(input, activeTab)
      if ('error' in submitResult) throw new Error(submitResult.error)
      const newsId = submitResult.news_id
      const text = submitResult.text
      setCurrentNewsId(newsId)

      // Step 2: Evidence (simulate timing with real poll)
      activateStep(1)
      
      // Fire the backend pipeline immediately after step 1
      await triggerPipeline(newsId, text)

      // Step 3: Credibility
      setTimeout(() => activateStep(2), 1200)

      // Step 4: Bias Detection
      setTimeout(() => activateStep(3), 2400)

      // Step 5: Poll for consensus verdict
      setTimeout(() => activateStep(4), 3600)

      const result = await pollAnalysisResult(
        newsId,
        (status) => console.log('Poll status:', status),
        60 // up to 3 minutes
      )

      if (!result) throw new Error('Analysis timed out. Please try again.')

      const { analysis } = result

      // Animate confidence bar
      setStepStatuses(STEPS.map(() => 'done'))
      setVerdict(analysis.final_verdict)
      setExplanation(analysis.explanation)
      setHeatmapData(analysis.heatmap_data ?? [])
      setBiasSignals(analysis.bias_signals ?? null)

      // Animate bar
      setConfidenceWidth(analysis.confidence_score)
      setConfidenceScore(analysis.confidence_score)

      // Fetch claim breakdown
      try {
        const breakdown = await getClaimBreakdown(newsId)
        setClaimBreakdown(breakdown.claims)
      } catch {
        // Non-critical — show results without claim breakdown
      }

      onAnalysisComplete?.(newsId, analysis)
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
                    <span className="verdict-text">{getVerdictLabel(verdict)}</span>
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
                  {/* Heatmap — Flagged Phrases */}
                  {heatmapData.length > 0 && (
                    <div className="heatmap-panel" id="heatmap-panel">
                      <h3>🔥 Text Heatmap — Flagged Phrases</h3>
                      <div className="heatmap-list">
                        {heatmapData.map((entry, i) => {
                          const color = entry.risk_score >= 70 ? '#ef4444' : entry.risk_score >= 40 ? '#f59e0b' : '#eab308';
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
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bias Signals */}
                  {biasSignals && (
                    <div className="bias-panel" id="bias-panel">
                      <h3>🧠 Bias & Manipulation Signals</h3>
                      <div className="bias-grid">
                        <div className="bias-card">
                          <span className="bias-label">Emotional Tone</span>
                          <span className="bias-value">{biasSignals.emotional_tone || 'Neutral'}</span>
                        </div>
                        <div className="bias-card">
                          <span className="bias-label">Clickbait Score</span>
                          <span className="bias-value">{biasSignals.clickbait_score}/100</span>
                        </div>
                        <div className="bias-card">
                          <span className="bias-label">Urgency Level</span>
                          <span className={`bias-value urgency-${biasSignals.urgency_level}`}>{biasSignals.urgency_level?.toUpperCase() || 'LOW'}</span>
                        </div>
                      </div>
                      {(biasSignals.manipulation_tactics?.length > 0 || biasSignals.fear_signals?.length > 0) && (
                        <div className="bias-tags">
                          {biasSignals.manipulation_tactics?.map((t, i) => (
                            <span key={`t-${i}`} className="bias-tag bias-tag-tactic">⚠️ {t}</span>
                          ))}
                          {biasSignals.fear_signals?.map((f, i) => (
                            <span key={`f-${i}`} className="bias-tag bias-tag-fear">😰 {f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Claims from real backend */}
                  {claimBreakdown.length > 0 && (
                    <div className="claims-panel" id="claims-panel">
                      <h3>📋 Claim-wise Analysis</h3>
                      <div className="claims-list" id="claims-list">
                        {claimBreakdown.map((item, i) => (
                          <div key={i} className="claim-item">
                            <span className={`claim-verdict verdict-${
                              item.analysis?.verdict === 'true' ? 'true' :
                              item.analysis?.verdict === 'false' ? 'false' : 'misleading'
                            }`}>
                              {item.analysis?.verdict?.toUpperCase() ?? 'UNVERIFIED'}
                            </span>
                            <span className="claim-text">{item.claim.claim_text}</span>
                            {item.analysis?.reasoning && (
                              <span className="claim-reasoning">{item.analysis.reasoning}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence from real backend */}
                  {claimBreakdown.some(c => c.sources.length > 0) && (
                    <div className="evidence-panel" id="evidence-panel">
                      <h3>🧾 Evidence Cards</h3>
                      <div className="evidence-grid" id="evidence-grid">
                        {claimBreakdown.flatMap(item => item.sources).slice(0, 6).map((ev, i) => (
                          <div key={i} className="evidence-card">
                            <div className={`ev-type ${ev.stance === 'supporting' ? 'ev-support' : ev.stance === 'contradicting' ? 'ev-contra' : ''}`}>
                              {ev.stance === 'supporting' ? '✅ Supporting' : ev.stance === 'contradicting' ? '❌ Contradicting' : '🔍 Neutral'}
                            </div>
                            <div className="ev-source">
                              {ev.source_url ? (
                                <a href={ev.source_url} target="_blank" rel="noopener noreferrer">
                                  {ev.source_title || ev.source_url}
                                </a>
                              ) : (
                                ev.source_title
                              )}
                            </div>
                            <div className="ev-credibility">Credibility: {ev.credibility_score}/100</div>
                            <p className="ev-summary">{ev.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Disclaimer Panel */}
                  <DisclaimerPanel />

                  {/* Real AI Explanation */}
                  <div className="explanation-panel" id="explanation-panel">
                    <h3>💡 AI Explanation</h3>
                    <p id="explanation-text">{explanation}</p>
                    {currentNewsId && (
                      <p className="scanner-news-id">
                        Analysis ID: <code>{currentNewsId}</code>
                        <span className="scanner-chatbot-hint"> — Open the AI chat to ask follow-up questions about this article.</span>
                      </p>
                    )}
                  </div>
                </>
              )}

              {isLoading && !showFinalResults && !errorMsg && (
                <div className="scanner-loading-hint">
                  <span>🤖 Multi-agent AI pipeline running… This typically takes 30–60 seconds.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
