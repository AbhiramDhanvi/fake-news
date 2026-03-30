export default function Comparison() {
  return (
    <section id="comparison" className="comparison-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">🧩 Debate View</span>
          <h2 className="section-title">Claim Comparison Panel</h2>
          <p className="section-desc">See supporting vs. contradicting evidence side-by-side — like a structured debate.</p>
        </div>
        <div className="comparison-grid">
          <div className="comparison-column comparison-support">
            <div className="comparison-header">
              <span className="comparison-icon">✅</span>
              <h3>Supporting Evidence</h3>
            </div>
            <div className="comparison-cards">
              <div className="comp-card">
                <div className="comp-source">Reuters</div>
                <p>Multiple independent sources confirm the core data points cited in the article.</p>
                <span className="comp-trust">Trust: 94%</span>
              </div>
              <div className="comp-card">
                <div className="comp-source">Associated Press</div>
                <p>Official statistics corroborate the reported figures within a 2% margin.</p>
                <span className="comp-trust">Trust: 96%</span>
              </div>
              <div className="comp-card">
                <div className="comp-source">WHO Report</div>
                <p>Peer-reviewed study supports the primary claim with robust methodology.</p>
                <span className="comp-trust">Trust: 91%</span>
              </div>
            </div>
          </div>

          <div className="comparison-divider">
            <span className="vs-badge">VS</span>
          </div>

          <div className="comparison-column comparison-contra">
            <div className="comparison-header">
              <span className="comparison-icon">❌</span>
              <h3>Contradicting Evidence</h3>
            </div>
            <div className="comparison-cards">
              <div className="comp-card">
                <div className="comp-source">Fact-Check.org</div>
                <p>The headline exaggerates findings — actual numbers are 40% lower than claimed.</p>
                <span className="comp-trust comp-trust-warning">Contradiction level: High</span>
              </div>
              <div className="comp-card">
                <div className="comp-source">Snopes</div>
                <p>Key quote attributed to the expert was taken out of context from a 2019 paper.</p>
                <span className="comp-trust comp-trust-warning">Contradiction level: Medium</span>
              </div>
              <div className="comp-card">
                <div className="comp-source">PolitiFact</div>
                <p>Timeline of events differs from publicly available records and official statements.</p>
                <span className="comp-trust comp-trust-warning">Contradiction level: High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
