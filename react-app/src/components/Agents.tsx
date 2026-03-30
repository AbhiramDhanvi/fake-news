const FileTextIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const ZapIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
  </svg>
)

const AGENT_ICONS = [FileTextIcon, SearchIcon, ShieldIcon, ZapIcon, CheckCircleIcon]

const agents = [
  { badge: 'Agent 1', title: 'Claim Extraction Agent', desc: 'Parses article → identifies individual factual claims → passes claim list downstream' },
  { badge: 'Agent 2', title: 'Evidence Agent', desc: 'Fetches supporting & contradicting sources from trusted databases' },
  { badge: 'Agent 3', title: 'Credibility Agent', desc: 'Scores each source domain by trust history & editorial reliability' },
  { badge: 'Agent 4', title: 'Bias & Emotion Agent', desc: 'Detects fear language, clickbait, urgency cues & manipulation' },
  { badge: 'Agent 5', title: 'Consensus & Verdict Agent', desc: 'Weighs evidence + source credibility + bias signals → Confidence-calibrated final verdict' },
]

const outputs = [
  { icon: '⚖️', title: 'Verdict', desc: 'True / False / Misleading' },
  { icon: '📊', title: 'Confidence Score', desc: '0–100% with calibration' },
  { icon: '🧾', title: 'Evidence Cards', desc: 'Supporting & contradicting' },
  { icon: '💡', title: 'Explanation', desc: 'Human-readable summary' },
]

export default function Agents() {
  return (
    <section id="agents" className="agents-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">🤖 Agentic Architecture</span>
          <h2 className="section-title">Multi-Agent Verification Pipeline</h2>
          <p className="section-desc">Five specialized AI agents collaborate like a team of experts. Each agent brings unique capabilities, and their outputs converge into a consensus verdict.</p>
        </div>

        <div className="agent-pipeline">
          {/* Input Node */}
          <div className="pipeline-node pipeline-input" id="agent-input">
            <div className="node-icon"><FileTextIcon /></div>
            <h4>News Article / URL Input</h4>
            <p>User submits content for verification</p>
          </div>

          <div className="pipeline-arrow pipeline-arrow-down">
            <svg width="24" height="40" viewBox="0 0 24 40">
              <path d="M12 0v32M6 26l6 8 6-8" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>

          {/* Agent 1 */}
          <div className="pipeline-node agent-node agent-1" id="agent-1">
            <div className="agent-badge">{agents[0].badge}</div>
            <div className="node-icon"><FileTextIcon /></div>
            <h4>{agents[0].title}</h4>
            <p>{agents[0].desc}</p>
          </div>

          <div className="pipeline-arrow pipeline-arrow-fork">
            <svg width="200" height="60" viewBox="0 0 200 60">
              <path d="M100 0 V20 M100 20 L30 50 M100 20 L100 50 M100 20 L170 50" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="30" cy="55" r="4" fill="currentColor"/>
              <circle cx="100" cy="55" r="4" fill="currentColor"/>
              <circle cx="170" cy="55" r="4" fill="currentColor"/>
            </svg>
            <span className="fork-label">Claims sent in parallel to three specialist agents</span>
          </div>

          {/* Parallel Agents Row */}
          <div className="agents-parallel-row">
            {[1, 2, 3].map(i => {
              const Icon = AGENT_ICONS[i]
              return (
                <div className={`pipeline-node agent-node agent-${i + 1}`} key={i} id={`agent-${i + 1}`}>
                  <div className="agent-badge">{agents[i].badge}</div>
                  <div className="node-icon"><Icon /></div>
                  <h4>{agents[i].title}</h4>
                  <p>{agents[i].desc}</p>
                </div>
              )
            })}
          </div>

          <div className="pipeline-arrow pipeline-arrow-merge">
            <svg width="200" height="60" viewBox="0 0 200 60">
              <path d="M30 5 L100 40 M100 5 V40 M170 5 L100 40 M100 40 V55" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="100" cy="55" r="4" fill="currentColor"/>
            </svg>
            <span className="fork-label">All outputs converge into consensus agent</span>
          </div>

          {/* Agent 5 */}
          <div className="pipeline-node agent-node agent-5" id="agent-5">
            <div className="agent-badge">{agents[4].badge}</div>
            <div className="node-icon"><CheckCircleIcon /></div>
            <h4>{agents[4].title}</h4>
            <p>{agents[4].desc}</p>
          </div>

          <div className="pipeline-arrow pipeline-arrow-down">
            <svg width="24" height="40" viewBox="0 0 24 40">
              <path d="M12 0v32M6 26l6 8 6-8" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>

          {/* Output Cards */}
          <div className="verdict-output-grid">
            {outputs.map((output, i) => (
              <div className="verdict-card" key={i} id={`verdict-${['result','confidence','evidence','explanation'][i]}`}>
                <div className="verdict-icon">{output.icon}</div>
                <h4>{output.title}</h4>
                <p>{output.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
