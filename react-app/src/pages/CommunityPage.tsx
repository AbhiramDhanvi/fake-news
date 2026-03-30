import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Discussion,
  DiscussionItem,
  DiscussionContent,
  DiscussionTitle,
  DiscussionBody,
  DiscussionExpand,
  DiscussionReplies,
} from '../components/ui/Discussion'
import Footer from '../components/Footer'

/* ── Types ─────────────────────────────────────── */
type ThreadCategory = 'All' | 'Politics' | 'Health' | 'Science' | 'Finance' | 'Technology'
type ThreadStatus = 'open' | 'resolved' | 'contested' | 'flagged'
type TabId = 'discussions' | 'submit' | 'live'

interface Reply { id: string; author: string; initials: string; color: string; time: string; body: string; replies?: Reply[] }
interface Thread {
  id: string; title: string; category: Exclude<ThreadCategory, 'All'>
  status: ThreadStatus; verdict?: string; author: string; initials: string
  color: string; time: string; replyCount: number; replies: Reply[]
}

/* ── Static data ────────────────────────────────── */
const STATUS_STYLES: Record<ThreadStatus, { bg: string; color: string; label: string }> = {
  open:     { bg: 'rgba(16,185,129,0.15)',  color: '#10B981', label: 'Open' },
  resolved: { bg: 'rgba(37,99,235,0.15)',   color: '#2563EB', label: 'Resolved' },
  contested:{ bg: 'rgba(239,68,68,0.15)',   color: '#EF4444', label: 'Contested' },
  flagged:  { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B', label: 'Flagged' },
}

const THREADS: Thread[] = [
  {
    id: 't1', title: 'Viral health claim about vitamin supplements — is the study peer-reviewed?',
    category: 'Health', status: 'open', verdict: 'misleading',
    author: 'Dr. Priya Nair', initials: 'PN', color: '#6366f1', time: '2h ago', replyCount: 8,
    replies: [
      { id: 'r1', author: 'James K.', initials: 'JK', color: '#10B981', time: '1h ago',
        body: 'I tracked down the original study — it was a preprint, not peer-reviewed. The article omitted that crucial detail entirely.',
        replies: [
          { id: 'r1-1', author: 'Dr. Priya Nair', initials: 'PN', color: '#6366f1', time: '45m ago',
            body: 'Exactly. Preprints can be valuable, but presenting them as final research is misleading. TruthLens flagged this correctly.' }
        ]
      },
      { id: 'r2', author: 'meera_v', initials: 'MV', color: '#ec4899', time: '30m ago',
        body: 'The journal link in the article is broken too. Classic sign of fabricated or misattributed citations.' },
    ]
  },
  {
    id: 't2', title: 'Economic data misrepresented in widely shared social post — IMF figures cited out of context',
    category: 'Finance', status: 'resolved',
    author: 'arun_econ', initials: 'AE', color: '#F59E0B', time: '5h ago', replyCount: 14,
    replies: [
      { id: 'r3', author: 'Sarah W.', initials: 'SW', color: '#2563EB', time: '4h ago',
        body: 'The IMF published updated figures last month. The post uses 2021 data and presents it as current. Reuters already covered this.' },
    ]
  },
  {
    id: 't3', title: 'Election coverage — two major outlets contradicting each other on vote count methodology',
    category: 'Politics', status: 'contested',
    author: 'civic_watcher', initials: 'CW', color: '#EF4444', time: '1d ago', replyCount: 31,
    replies: [
      { id: 'r4', author: 'Sophia L.', initials: 'SL', color: '#6366f1', time: '20h ago',
        body: 'Both outlets use valid but different methodologies. AP uses a live county feed; others use projected models. The headline framing is the problem.',
        replies: [
          { id: 'r4-1', author: 'civic_watcher', initials: 'CW', color: '#EF4444', time: '18h ago',
            body: 'This is why methodology transparency matters. Neither piece explains their counting method in the article itself.' }
        ]
      },
    ]
  },
  {
    id: 't4', title: 'New climate study shows Arctic ice recovery — is the framing accurate?',
    category: 'Science', status: 'open',
    author: 'climate_check', initials: 'CC', color: '#10B981', time: '3h ago', replyCount: 6,
    replies: [
      { id: 'r5', author: 'Prof. Li', initials: 'PL', color: '#6366f1', time: '2h ago',
        body: 'The study measures one specific region, not global Arctic ice. Classic cherry-picking of geographical scope.' },
    ]
  },
  {
    id: 't5', title: 'Tech giant data breach claims circulating — checking primary sources',
    category: 'Technology', status: 'flagged',
    author: 'sec_researcher', initials: 'SR', color: '#818cf8', time: '6h ago', replyCount: 19,
    replies: [
      { id: 'r6', author: 'devops_dan', initials: 'DD', color: '#F59E0B', time: '5h ago',
        body: 'The "breach" appears to be a recycled dataset from 2022. No new incident confirmed by the company or HaveIBeenPwned.' },
    ]
  },
]

const LIVE_SESSIONS = [
  { id: 's1', title: 'Breaking: Government policy reversal claim — live analysis in progress', category: 'Politics', participants: 14, progress: 67, started: '8m ago' },
  { id: 's2', title: 'WHO statement on new pathogen — verifying official source vs media headline', category: 'Health', participants: 9, progress: 34, started: '3m ago' },
  { id: 's3', title: 'Viral video claiming to show military activity — geolocating footage', category: 'Science', participants: 22, progress: 90, started: '18m ago' },
]

/* ── Helper components ─────────────────────────── */
function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div style={{ width:32,height:32,borderRadius:'50%',background:color+'22',border:`1.5px solid ${color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color,flexShrink:0 }}>
      {initials}
    </div>
  )
}

function renderReplies(replies: Reply[]): React.JSX.Element[] {
  return replies.map(r => (
    <DiscussionItem key={r.id} value={r.id}>
      <DiscussionContent style={{ gap:10 }}>
        <Avatar initials={r.initials} color={r.color} />
        <div style={{ display:'flex',flexDirection:'column',gap:4,flex:1 }}>
          <DiscussionTitle style={{ display:'flex',gap:8,alignItems:'center',color:'#fff',fontSize:13,fontWeight:600 }}>
            {r.author}
            <span style={{ color:'rgba(255,255,255,0.35)',fontSize:11,fontWeight:400 }}>• {r.time}</span>
          </DiscussionTitle>
          <DiscussionBody style={{ color:'rgba(255,255,255,0.70)',fontSize:13,lineHeight:1.6 }}>
            {r.body}
          </DiscussionBody>
          {r.replies && r.replies.length > 0 && <DiscussionExpand />}
        </div>
      </DiscussionContent>
      {r.replies && r.replies.length > 0 && (
        <DiscussionReplies>{renderReplies(r.replies)}</DiscussionReplies>
      )}
    </DiscussionItem>
  ))
}

/* ── Main component ─────────────────────────────── */
export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabId>('discussions')
  const [filterCat, setFilterCat] = useState<ThreadCategory>('All')
  const [activeThread, setActiveThread] = useState<string | null>('t1')
  const [submitUrl, setSubmitUrl] = useState('')
  const [submitCategory, setSubmitCategory] = useState('Politics')
  const [submitReason, setSubmitReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const filtered = THREADS.filter(t => filterCat === 'All' || t.category === filterCat)

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className="page-hero page-hero-community">
        <div className="page-hero-inner">
          <span className="section-label">👥 Open to all</span>
          <h1 className="page-hero-title">Verify Together</h1>
          <p className="page-hero-desc">
            Join journalists, researchers, and curious readers fighting misinformation —
            one article at a time. Collective human verification alongside AI is more
            accurate, more defensible, and more transparent.
          </p>
          <div className="comm-stat-row">
            <div className="comm-stat"><span className="comm-stat-num">2,400+</span><span className="comm-stat-lab">Active threads</span></div>
            <div className="comm-stat-div"/>
            <div className="comm-stat"><span className="comm-stat-num">340</span><span className="comm-stat-lab">Articles in queue</span></div>
            <div className="comm-stat-div"/>
            <div className="comm-stat"><span style={{ color:'#EF4444' }}>●</span>&nbsp;<span className="comm-stat-num">12</span><span className="comm-stat-lab">Live now</span></div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="comm-tab-strip">
        <div className="container">
          <div className="comm-tabs">
            {([['discussions','💬 Discussions'],['submit','📤 Submit Article'],['live','🔴 Live Sessions']] as const).map(([id,label]) => (
              <button key={id} className={`comm-tab${activeTab===id?' active':''}`} onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB 1: Discussions ── */}
      {activeTab === 'discussions' && (
        <div className="container" style={{ paddingTop:40, paddingBottom:80 }}>
          {/* Filter row */}
          <div className="comm-filter-row">
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {(['All','Politics','Health','Science','Finance','Technology'] as ThreadCategory[]).map(c => (
                <button key={c} className={`comm-filter-btn${filterCat===c?' active':''}`} onClick={() => setFilterCat(c)}>{c}</button>
              ))}
            </div>
            <span className="comm-thread-count">{filtered.length} threads</span>
          </div>

          {/* 2-col layout */}
          <div className="comm-threads-layout">
            {/* Thread list */}
            <div className="comm-thread-list">
              {filtered.map(t => {
                const s = STATUS_STYLES[t.status]
                return (
                  <div key={t.id} className={`comm-thread-item${activeThread===t.id?' active':''}`} onClick={() => setActiveThread(t.id)}>
                    <div style={{ display:'flex',gap:6,marginBottom:8,flexWrap:'wrap' }}>
                      <span className="comm-cat-pill">{t.category}</span>
                      <span className="comm-status-pill" style={{ background:s.bg,color:s.color }}>{s.label}</span>
                      {t.verdict && <span className="comm-verdict-pill">Scan: {t.verdict.replace('_',' ')}</span>}
                    </div>
                    <p className="comm-thread-title">{t.title}</p>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <Avatar initials={t.initials} color={t.color} />
                      <span style={{ fontSize:12,color:'rgba(255,255,255,0.45)' }}>{t.author}</span>
                      <span style={{ fontSize:12,color:'rgba(255,255,255,0.25)' }}>•</span>
                      <span style={{ fontSize:12,color:'rgba(255,255,255,0.35)' }}>{t.replyCount} replies</span>
                      <span style={{ fontSize:12,color:'rgba(255,255,255,0.25)' }}>•</span>
                      <span style={{ fontSize:12,color:'rgba(255,255,255,0.35)' }}>{t.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Thread viewer */}
            <div className="comm-thread-viewer">
              {activeThread ? (() => {
                const t = THREADS.find(x => x.id === activeThread)!
                const s = STATUS_STYLES[t.status]
                return (
                  <>
                    <div style={{ display:'flex',gap:8,marginBottom:10 }}>
                      <span className="comm-cat-pill">{t.category}</span>
                      <span className="comm-status-pill" style={{ background:s.bg,color:s.color }}>{s.label}</span>
                    </div>
                    <h3 className="comm-viewer-title">{t.title}</h3>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:20 }}>
                      <Avatar initials={t.initials} color={t.color} />
                      <span style={{ fontSize:12,color:'rgba(255,255,255,0.50)' }}>{t.author} · {t.time}</span>
                    </div>
                    <Discussion type="multiple" defaultValue={[t.replies[0]?.id]} style={{ marginBottom:20 }}>
                      {renderReplies(t.replies)}
                    </Discussion>
                    <div className="comm-reply-box">
                      <textarea className="comm-reply-ta" placeholder="Add your analysis or evidence…" rows={3}/>
                      <button className="btn btn-primary" style={{ padding:'8px 20px', fontSize:13 }}>Post reply</button>
                    </div>
                    <p style={{ fontSize:11,color:'rgba(255,255,255,0.25)',lineHeight:1.5,marginTop:10 }}>
                      Replies are reviewed for accuracy and civility.
                    </p>
                  </>
                )
              })() : (
                <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',minHeight:300,gap:8 }}>
                  <span style={{ fontSize:36 }}>💬</span>
                  <p style={{ color:'rgba(255,255,255,0.40)',fontSize:14 }}>Select a thread to view the discussion</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Submit ── */}
      {activeTab === 'submit' && (
        <div className="container" style={{ paddingTop:40,paddingBottom:80 }}>
          <div className="comm-submit-layout">
            <div className="comm-submit-form-col">
              <h2 className="comm-col-title">Submit an article for community review</h2>
              <p className="comm-col-sub">Our AI pipeline runs automatically, then opens the article for collective analysis by the community.</p>
              {submitted ? (
                <div className="comm-success-box">
                  <div style={{ fontSize:32,marginBottom:12 }}>✅</div>
                  <h3>Submitted successfully!</h3>
                  <p>The AI pipeline is now running. Your article will appear in the community queue shortly.</p>
                  <button className="btn btn-outline" style={{ marginTop:16 }} onClick={() => setSubmitted(false)}>Submit another</button>
                </div>
              ) : (
                <div className="comm-form-card">
                  <div className="comm-form-field">
                    <label>Article URL *</label>
                    <input className="comm-input" placeholder="https://example.com/article..." value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} />
                  </div>
                  <div className="comm-form-field">
                    <label>Category</label>
                    <select className="comm-input" value={submitCategory} onChange={e => setSubmitCategory(e.target.value)}>
                      {['Politics','Health','Science','Climate','Finance','Technology','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="comm-form-field">
                    <label>Why are you submitting this? <span style={{ color:'rgba(255,255,255,0.35)',fontWeight:400 }}>(optional)</span></label>
                    <textarea className="comm-input" rows={3} placeholder="What specifically concerns you about this article?" value={submitReason} onChange={e => setSubmitReason(e.target.value)} />
                  </div>
                  <div className="comm-form-check">
                    <input type="checkbox" id="public-check" defaultChecked />
                    <label htmlFor="public-check">Make my submission public</label>
                  </div>
                  <button className="btn btn-primary" style={{ width:'100%',justifyContent:'center',padding:'12px 0' }} onClick={() => submitUrl && setSubmitted(true)}>
                    Submit for community review
                  </button>
                </div>
              )}
            </div>

            {/* Community queue */}
            <div className="comm-queue-col">
              <h2 className="comm-col-title">Articles awaiting review</h2>
              <p className="comm-col-sub">Community queue — sorted by priority and submission time.</p>
              {[
                { title:'AI-generated images being spread as real news photos', cat:'Technology', analysts:7, priority:true },
                { title:'New cancer treatment claimed to be 100% effective in trial', cat:'Health', analysts:12, priority:true },
                { title:'Government spending data cited without verification', cat:'Finance', analysts:4, priority:false },
                { title:'Viral social post claims tax law change is immediate', cat:'Politics', analysts:3, priority:false },
                { title:'Earthquake prediction video spreading on social media', cat:'Science', analysts:9, priority:false },
              ].map((item, i) => (
                <div key={i} className={`comm-queue-item${item.priority?' priority':''}`}>
                  <div style={{ display:'flex',gap:6,marginBottom:6 }}>
                    <span className="comm-cat-pill">{item.cat}</span>
                    {item.priority && <span className="comm-priority-pill">⚡ High priority</span>}
                  </div>
                  <p className="comm-queue-title">{item.title}</p>
                  <span style={{ fontSize:11,color:'rgba(255,255,255,0.40)' }}>👥 {item.analysts} analysts looking at this</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Live Sessions ── */}
      {activeTab === 'live' && (
        <div className="container" style={{ paddingTop:40,paddingBottom:80 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28 }}>
            <h2 className="comm-col-title" style={{ marginBottom:0 }}>Active live sessions</h2>
            <button className="btn btn-primary btn-sm">+ Start a session</button>
          </div>
          <div className="comm-live-grid">
            {LIVE_SESSIONS.map(session => (
              <div key={session.id} className="comm-live-card">
                <div style={{ display:'flex',gap:8,marginBottom:12 }}>
                  <span className="comm-live-badge">🔴 LIVE</span>
                  <span className="comm-cat-pill">{session.category}</span>
                </div>
                <p className="comm-live-title">{session.title}</p>
                <div className="comm-live-meta">
                  <span>👥 {session.participants} participants</span>
                  <span>Started {session.started}</span>
                </div>
                <div className="comm-live-progress-bar">
                  <div className="comm-live-progress-fill" style={{ width:`${session.progress}%` }}/>
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:4,marginBottom:14 }}>
                  <span>Analysis progress</span>
                  <span>{session.progress}%</span>
                </div>
                <button className="btn btn-primary" style={{ width:'100%',justifyContent:'center',padding:'10px 0',fontSize:14 }}>
                  Join session →
                </button>
              </div>
            ))}
          </div>

          {/* How live sessions work */}
          <div className="comm-live-explainer">
            <h3>How live sessions work</h3>
            <div className="comm-live-steps">
              {[
                { icon:'🔗', title:'Start or join a session', desc:'Paste an article URL to create a room. Share the invite link with others.' },
                { icon:'👁️', title:'Watch the scan in real time', desc:"All 5 agents run live — evidence cards, heatmap, and verdict appear as they're generated." },
                { icon:'💬', title:'React and discuss', desc:'Chat with other participants, cite sources using /cite, and react to each finding.' },
                { icon:'🏛️', title:'Cast your vote', desc:"After the verdict reveals, vote per-claim: Agree, Disagree, or Unsure. Results are saved to the community archive." },
              ].map((step, i) => (
                <div key={i} className="comm-live-step">
                  <div className="comm-live-step-icon">{step.icon}</div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Join CTA */}
      <div className="container" style={{ paddingBottom:80 }}>
        <div className="comm-cta-box">
          <h2>Ready to join the conversation?</h2>
          <p>Sign up free to post replies, submit articles, and join live sessions.<br/>No subscription required — ever.</p>
          <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginTop:24 }}>
            <Link to="/" className="btn btn-primary">Try the scanner first</Link>
            <button className="btn btn-outline">Create free account</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
