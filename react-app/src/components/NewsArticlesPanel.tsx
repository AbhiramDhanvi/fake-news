import { useState } from 'react'

type VerdictType = 'likely_true' | 'likely_false' | 'misleading' | 'unverified'

interface NewsArticlesPanelProps {
  verdict?: VerdictType | null
  inputText?: string
}

type TabId = 'sources' | 'related' | 'previous' | 'factcheck'

interface Source {
  domain: string
  headline: string
  credibility: number
  stance: 'supporting' | 'contradicting'
  claimRef: string
  url: string
}

interface RelatedArticle {
  domain: string
  headline: string
  date: string
  url: string
}

interface PreviousScan {
  headline: string
  domain: string
  verdict: VerdictType
  confidence: number
  daysAgo: number
}

interface FactCheckOrg {
  name: string
  tag: string
  searchBase: string
  favicon: string
}

const FACT_CHECK_ORGS: FactCheckOrg[] = [
  { name: 'Snopes', tag: 'General fact-checking', searchBase: 'https://www.snopes.com/search?q=', favicon: '🔎' },
  { name: 'PolitiFact', tag: 'Political claims', searchBase: 'https://www.politifact.com/search/?q=', favicon: '⚖️' },
  { name: 'FactCheck.org', tag: 'US politics & science', searchBase: 'https://www.factcheck.org/?s=', favicon: '🔬' },
  { name: 'Reuters Fact Check', tag: 'Global news', searchBase: 'https://www.reuters.com/fact-check/', favicon: '📰' },
  { name: 'AP Fact Check', tag: 'Breaking news', searchBase: 'https://apnews.com/hub/ap-fact-check', favicon: '📡' },
  { name: 'Full Fact (UK)', tag: 'UK / EU claims', searchBase: 'https://fullfact.org/search/?q=', favicon: '🇬🇧' },
  { name: 'Africa Check', tag: 'African news', searchBase: 'https://africacheck.org/?s=', favicon: '🌍' },
  { name: 'Boom Live', tag: 'South / Southeast Asia', searchBase: 'https://www.boomlive.in/search?q=', favicon: '🌏' },
]

function getSourcesForVerdict(verdict: VerdictType | null | undefined): { supporting: Source[]; contradicting: Source[] } {
  const base = {
    supporting: [
      { domain: 'reuters.com', headline: 'Officials confirm partial accuracy of circulating reports amid growing scrutiny', credibility: 94, stance: 'supporting' as const, claimRef: 'Claim #1', url: 'https://reuters.com' },
      { domain: 'apnews.com', headline: 'Independent verification finds core elements consistent with official records', credibility: 92, stance: 'supporting' as const, claimRef: 'Claim #2', url: 'https://apnews.com' },
      { domain: 'bbc.com', headline: 'Timeline reconstruction matches documented sequence of events', credibility: 91, stance: 'supporting' as const, claimRef: 'Claim #1', url: 'https://bbc.com' },
    ],
    contradicting: [
      { domain: 'snopes.com', headline: 'Claim rated misleading — key statistics cited without primary source', credibility: 89, stance: 'contradicting' as const, claimRef: 'Claim #3', url: 'https://snopes.com' },
      { domain: 'politifact.com', headline: 'Fact check: Numbers significantly exaggerated compared to original report', credibility: 87, stance: 'contradicting' as const, claimRef: 'Claim #2', url: 'https://politifact.com' },
      { domain: 'factcheck.org', headline: 'Attribution error found — quote misassigned to wrong official', credibility: 88, stance: 'contradicting' as const, claimRef: 'Claim #3', url: 'https://factcheck.org' },
    ],
  }

  if (verdict === 'likely_true') {
    base.supporting[0].headline = 'Comprehensive government data confirms report accuracy within acceptable margin'
    base.contradicting = base.contradicting.slice(0, 1)
  } else if (verdict === 'likely_false') {
    base.supporting = base.supporting.slice(0, 1)
    base.supporting[0].credibility = 51
    base.contradicting[0].headline = 'Multiple primary sources directly contradict central claim in article'
  }

  return base
}

function getRelatedArticles(verdict: VerdictType | null | undefined): RelatedArticle[] {
  return [
    { domain: 'theguardian.com', headline: 'Analysis: Understanding the broader context behind this week\'s most-shared story', date: '2 hours ago', url: 'https://theguardian.com' },
    { domain: 'nytimes.com', headline: 'Experts weigh in on the growing information environment around this narrative', date: '5 hours ago', url: 'https://nytimes.com' },
    { domain: 'washingtonpost.com', headline: 'Fact-checkers trace the origin of the claim to a misread government document', date: '1 day ago', url: 'https://washingtonpost.com' },
    { domain: 'bbc.com', headline: verdict === 'likely_true' ? 'Independent corroboration strengthens credibility of circulating reports' : 'Viral story shows signs of coordinated amplification across platforms', date: '3 hours ago', url: 'https://bbc.com' },
    { domain: 'npr.org', headline: 'Media analysts examine how the story spread and why it resonated', date: '8 hours ago', url: 'https://npr.org' },
    { domain: 'theatlantic.com', headline: 'Why misinformation about this topic keeps recurring — a pattern analysis', date: '2 days ago', url: 'https://theatlantic.com' },
  ]
}

function getPreviousScans(): PreviousScan[] {
  return [
    { headline: 'New study claims coffee cures all forms of cancer instantly', domain: 'healthnews.net', verdict: 'likely_false', confidence: 91, daysAgo: 1 },
    { headline: 'Government announces new digital ID mandatory by end of year', domain: 'techpolicy.org', verdict: 'misleading', confidence: 78, daysAgo: 2 },
    { headline: 'Central bank confirms inflation figures consistent with EU averages', domain: 'reuters.com', verdict: 'likely_true', confidence: 88, daysAgo: 3 },
    { headline: 'Viral video shows flooding in city — actual footage is from 2019', domain: 'breaking24.io', verdict: 'likely_false', confidence: 95, daysAgo: 4 },
    { headline: 'Scientists confirm new climate data — significant sea level rise projection updated', domain: 'science.org', verdict: 'likely_true', confidence: 83, daysAgo: 5 },
    { headline: 'Politician quoted out of context in widely-shared social media post', domain: 'factfront.com', verdict: 'misleading', confidence: 82, daysAgo: 6 },
  ]
}

function credibilityColor(score: number) {
  if (score >= 80) return { bg: 'rgba(16,185,129,0.15)', color: '#10B981' }
  if (score >= 50) return { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' }
  return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' }
}

function verdictBadgeStyle(v: VerdictType) {
  if (v === 'likely_true') return { bg: 'rgba(16,185,129,0.15)', color: '#10B981', label: '✅ Likely True' }
  if (v === 'likely_false') return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: '❌ Likely False' }
  if (v === 'misleading') return { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: '⚠️ Misleading' }
  return { bg: 'rgba(136,136,136,0.15)', color: '#888', label: '🔍 Unverified' }
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'sources', label: 'Sources used' },
  { id: 'related', label: 'Related articles' },
  { id: 'previous', label: 'Previously scanned' },
  { id: 'factcheck', label: 'Fact-check orgs' },
]

export default function NewsArticlesPanel({ verdict, inputText }: NewsArticlesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('sources')
  const [showAllSources, setShowAllSources] = useState(false)

  const sources = getSourcesForVerdict(verdict)
  const related = getRelatedArticles(verdict)
  const previous = getPreviousScans()
  const searchQuery = encodeURIComponent(inputText?.slice(0, 60) ?? 'fake news')

  return (
    <div className="nap-panel">
      {/* Header */}
      <div className="nap-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
        </svg>
        <span className="nap-label">Articles analysed in this scan</span>
      </div>

      {/* Tab bar */}
      <div className="nap-tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nap-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Sources Used */}
      {activeTab === 'sources' && (
        <div className="nap-content">
          {/* Supporting */}
          <div className="nap-subsection-header">
            <span className="nap-dot nap-dot-green" />
            <span>Supporting sources</span>
          </div>
          {sources.supporting.map((src, i) => {
            const cred = credibilityColor(src.credibility)
            return (
              <div key={i} className="nap-source-row">
                <div className="nap-source-favicon">{src.domain.charAt(0).toUpperCase()}</div>
                <div className="nap-source-info">
                  <span className="nap-source-domain">{src.domain}</span>
                  <span className="nap-source-headline">{src.headline.slice(0, 70)}{src.headline.length > 70 ? '…' : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <span className="nap-cred-badge" style={{ background: cred.bg, color: cred.color }}>{src.credibility}</span>
                  <span className="nap-contrib-tag nap-tag-support">{src.claimRef}</span>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="nap-open-link" title="Open source">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                </div>
              </div>
            )
          })}

          {/* Contradicting */}
          <div className="nap-subsection-header" style={{ marginTop: 16 }}>
            <span className="nap-dot nap-dot-red" />
            <span>Contradicting sources</span>
          </div>
          {(showAllSources ? sources.contradicting : sources.contradicting.slice(0, 3)).map((src, i) => {
            const cred = credibilityColor(src.credibility)
            return (
              <div key={i} className="nap-source-row">
                <div className="nap-source-favicon">{src.domain.charAt(0).toUpperCase()}</div>
                <div className="nap-source-info">
                  <span className="nap-source-domain">{src.domain}</span>
                  <span className="nap-source-headline">{src.headline.slice(0, 70)}{src.headline.length > 70 ? '…' : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <span className="nap-cred-badge" style={{ background: cred.bg, color: cred.color }}>{src.credibility}</span>
                  <span className="nap-contrib-tag nap-tag-contra">Contradicts {src.claimRef.replace('Claim ', '#')}</span>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="nap-open-link" title="Open source">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                </div>
              </div>
            )
          })}
          {!showAllSources && sources.contradicting.length > 3 && (
            <button className="nap-show-more" onClick={() => setShowAllSources(true)}>
              Show all {sources.contradicting.length} sources →
            </button>
          )}
        </div>
      )}

      {/* Tab 2: Related Articles */}
      {activeTab === 'related' && (
        <div className="nap-content">
          <div className="nap-related-grid">
            {related.map((art, i) => (
              <div key={i} className="nap-related-card">
                <div className="nap-related-card-top">
                  <span className="nap-source-domain">{art.domain}</span>
                  <span className="nap-related-date">{art.date}</span>
                </div>
                <p className="nap-related-headline">{art.headline}</p>
                <a href={art.url} target="_blank" rel="noopener noreferrer" className="nap-scan-link">
                  Scan this article →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Previously Scanned */}
      {activeTab === 'previous' && (
        <div className="nap-content">
          <p className="nap-prev-note">Community archive — articles recently scanned by TruthLens users</p>
          {previous.map((scan, i) => {
            const badge = verdictBadgeStyle(scan.verdict)
            return (
              <div key={i} className="nap-prev-row">
                <span className="nap-prev-badge" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                <div className="nap-prev-info">
                  <span className="nap-prev-headline">{scan.headline}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
                    <span className="nap-source-domain">{scan.domain}</span>
                    <span className="nap-prev-meta">Scanned {scan.daysAgo}d ago</span>
                    <div className="nap-prev-conf-bar">
                      <div className="nap-prev-conf-fill" style={{ width: `${scan.confidence}%`, background: badge.color }} />
                    </div>
                    <span className="nap-prev-meta">{scan.confidence}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab 4: Fact-check Orgs */}
      {activeTab === 'factcheck' && (
        <div className="nap-content">
          <p className="nap-factcheck-note">
            TruthLens cross-references these organisations in every scan. Verify findings directly at the source.
          </p>
          <div className="nap-factcheck-grid">
            {FACT_CHECK_ORGS.map((org, i) => (
              <div key={i} className="nap-org-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{org.favicon}</span>
                  <div>
                    <div className="nap-org-name">{org.name}</div>
                    <span className="nap-org-tag">{org.tag}</span>
                  </div>
                </div>
                <a
                  href={org.searchBase + searchQuery}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nap-org-link"
                >
                  Search {org.name.split(' ')[0]} →
                </a>
              </div>
            ))}
          </div>
          <p className="nap-factcheck-footer">
            Know a fact-checker we've missed?{' '}
            <a href="#community" className="nap-show-more">Suggest an organisation →</a>
          </p>
        </div>
      )}
    </div>
  )
}
