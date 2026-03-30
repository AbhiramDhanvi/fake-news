const LogoGrad = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={id} x1="4" y1="4" x2="28" y2="28">
      <stop stopColor="#6366f1"/>
      <stop offset="1" stopColor="#ec4899"/>
    </linearGradient>
  </defs>
)

export default function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="container">
        <div className="footer-grid footer-grid-6">
          <div className="footer-brand">
            <a href="#" className="navbar-brand">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="url(#footerLogoGrad)" strokeWidth="2.5"/>
                <path d="M10 16.5L14 20.5L22 12.5" stroke="url(#footerLogoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <LogoGrad id="footerLogoGrad" />
              </svg>
              <span>TruthLens<span className="brand-ai">AI</span></span>
            </a>
            <p className="footer-tagline">Multi-agent AI system fighting misinformation with confidence-calibrated verdicts.</p>
          </div>

          <div className="footer-links-group">
            <h4>Product</h4>
            <a href="#scanner">Scanner</a>
            <a href="#features">Features</a>
            <a href="#agents">AI Agents</a>
            <a href="#knowledge-graph">Knowledge Graph</a>
          </div>

          <div className="footer-links-group">
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">Blog / Insights</a>
            <a href="#">Changelog</a>
            <a href="#">Cite TruthLens</a>
          </div>

          <div className="footer-links-group">
            <h4>Developers</h4>
            <a href="#">API Docs</a>
            <a href="#">SDK Reference</a>
            <a href="#">Methodology</a>
            <a href="#">Open Data</a>
          </div>

          <div className="footer-links-group">
            <h4>Community</h4>
            <a href="#community">Discussions forum</a>
            <a href="#community">Submit an article</a>
            <a href="#community">Live sessions</a>
            <a href="#">Community guidelines</a>
            <a href="#">Suggest a fact-checker</a>
          </div>

          <div className="footer-links-group">
            <h4>Company</h4>
            <a href="#">About us</a>
            <a href="#contact">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 TruthLens AI. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Accessibility Statement</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
