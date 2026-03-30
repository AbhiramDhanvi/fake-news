import { useState } from 'react'
import {
  Discussion,
  DiscussionItem,
  DiscussionContent,
  DiscussionTitle,
  DiscussionBody,
  DiscussionExpand,
  DiscussionReplies,
} from './ui/Discussion'

interface Thread {
  id: string
  title: string
  category: string
  status: 'open' | 'resolved' | 'contested' | 'flagged'
  verdict?: string
  replies: Reply[]
  author: string
  initials: string
  color: string
  timeAgo: string
  replyCount: number
}

interface Reply {
  id: string
  author: string
  initials: string
  color: string
  timeAgo: string
  body: string
  replies?: Reply[]
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  open: { bg: 'rgba(16,185,129,0.15)', color: '#10B981', label: 'Open' },
  resolved: { bg: 'rgba(37,99,235,0.15)', color: '#2563EB', label: 'Resolved' },
  contested: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'Contested' },
  flagged: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: 'Flagged' },
}

const SAMPLE_THREADS: Thread[] = [
  {
    id: 'thread-1',
    title: 'Viral health claim about vitamin supplements — is the study peer-reviewed?',
    category: 'Health',
    status: 'open',
    verdict: 'misleading',
    author: 'Dr. Priya Nair',
    initials: 'PN',
    color: '#6366f1',
    timeAgo: '2h ago',
    replyCount: 8,
    replies: [
      {
        id: 'r1', author: 'James K.', initials: 'JK', color: '#10B981', timeAgo: '1h ago',
        body: 'I tracked down the original study — it was a preprint, not peer-reviewed. The article omitted that crucial detail entirely.',
        replies: [
          {
            id: 'r1.1', author: 'Dr. Priya Nair', initials: 'PN', color: '#6366f1', timeAgo: '45m ago',
            body: 'Exactly. Preprints can be valuable, but presenting them as final research is misleading. TruthLens flagged this correctly.'
          }
        ]
      },
      {
        id: 'r2', author: 'meera_v', initials: 'MV', color: '#ec4899', timeAgo: '30m ago',
        body: 'The journal link in the article is broken too. Classic sign of fabricated or misattributed citations.',
      }
    ]
  },
  {
    id: 'thread-2',
    title: 'Breaking: Economic data misrepresented in widely shared social post — cross-check needed',
    category: 'Finance',
    status: 'resolved',
    verdict: 'likely_false',
    author: 'arun_econ',
    initials: 'AE',
    color: '#F59E0B',
    timeAgo: '5h ago',
    replyCount: 14,
    replies: [
      {
        id: 'r3', author: 'Sarah W.', initials: 'SW', color: '#2563EB', timeAgo: '4h ago',
        body: 'The IMF actually published updated figures last month. The post is using 2021 data and presenting it as current. Reuters already covered this discrepancy.',
      }
    ]
  },
  {
    id: 'thread-3',
    title: 'Election coverage — two major outlets contradicting each other on vote count methodology',
    category: 'Politics',
    status: 'contested',
    author: 'civic_watcher',
    initials: 'CW',
    color: '#EF4444',
    timeAgo: '1d ago',
    replyCount: 31,
    replies: [
      {
        id: 'r4', author: 'Sophia L.', initials: 'SL', color: '#6366f1', timeAgo: '20h ago',
        body: 'Both outlets are using valid but different methodologies. AP uses a live county feed, others use projected models. Neither is wrong per se — the headline framing is the problem.',
        replies: [
          {
            id: 'r4.1', author: 'civic_watcher', initials: 'CW', color: '#EF4444', timeAgo: '18h ago',
            body: 'This is why methodology transparency matters. Neither piece explains their counting method in the article itself.'
          }
        ]
      }
    ]
  }
]

const FEATURE_CARDS = [
  {
    icon: '💬',
    title: 'Discussions',
    desc: 'Join fact-checking threads, cite evidence, and help the community reach verified consensus on the articles that matter.',
    stats: '2,400+ active threads',
    color: '#2563EB',
  },
  {
    icon: '📤',
    title: 'Submit an Article',
    desc: 'Flag suspect content for community review. Our AI pipeline runs automatically, then opens it for collective analysis.',
    stats: '340 articles in queue',
    color: '#10B981',
  },
  {
    icon: '🔴',
    title: 'Live Sessions',
    desc: 'Watch a scan happen in real time with other users. React, cite sources, and vote on claims as each agent result reveals.',
    stats: '12 sessions live now',
    color: '#EF4444',
  },
]

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', background: color + '22',
      border: `1.5px solid ${color}55`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 11, fontWeight: 700, color,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function renderReplies(replies: Reply[]) {
  return replies.map(reply => (
    <DiscussionItem key={reply.id} value={reply.id}>
      <DiscussionContent className="gap-3">
        <Avatar initials={reply.initials} color={reply.color} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <DiscussionTitle style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#fff', fontSize: 13 }}>{reply.author}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>• {reply.timeAgo}</span>
          </DiscussionTitle>
          <DiscussionBody style={{ color: 'rgba(255,255,255,0.70)', fontSize: 13, lineHeight: 1.6 }}>
            {reply.body}
          </DiscussionBody>
          {reply.replies && reply.replies.length > 0 && <DiscussionExpand />}
        </div>
      </DiscussionContent>
      {reply.replies && reply.replies.length > 0 && (
        <DiscussionReplies>
          {renderReplies(reply.replies)}
        </DiscussionReplies>
      )}
    </DiscussionItem>
  ))
}

export default function Community() {
  const [activeThread, setActiveThread] = useState<string | null>(null)

  return (
    <section id="community" className="community-section">
      <div className="container">
        {/* Section header */}
        <div className="section-header">
          <span className="section-label">👥 Community</span>
          <h2 className="section-title">Verify Together</h2>
          <p className="section-desc">
            Join journalists, researchers, and curious readers fighting misinformation —
            one article at a time. Collective human verification alongside AI is more
            accurate, more defensible, and more transparent.
          </p>
        </div>

        {/* Feature cards */}
        <div className="community-feature-grid">
          {FEATURE_CARDS.map(card => (
            <div key={card.title} className="community-feature-card">
              <div className="community-feature-icon" style={{ background: card.color + '18', color: card.color }}>
                {card.icon}
              </div>
              <h3 className="community-feature-title">{card.title}</h3>
              <p className="community-feature-desc">{card.desc}</p>
              <span className="community-feature-stat" style={{ color: card.color }}>
                <span className="community-live-dot" style={{ background: card.color }} />
                {card.stats}
              </span>
            </div>
          ))}
        </div>

        {/* Discussion threads */}
        <div className="community-threads-wrapper">
          <div className="community-threads-header">
            <h3 className="community-threads-title">
              <span style={{ color: '#10B981' }}>●</span> Live Discussion Threads
            </h3>
            <a href="#community" className="community-view-all">View all threads →</a>
          </div>

          <div className="community-threads-layout">
            {/* Thread list */}
            <div className="community-thread-list">
              {SAMPLE_THREADS.map(thread => {
                const status = STATUS_STYLES[thread.status]
                return (
                  <div
                    key={thread.id}
                    className={`community-thread-item${activeThread === thread.id ? ' active' : ''}`}
                    onClick={() => setActiveThread(thread.id === activeThread ? null : thread.id)}
                  >
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <span className="community-category-pill">{thread.category}</span>
                      <span className="community-status-pill" style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                      {thread.verdict && (
                        <span className="community-verdict-pill">
                          Scan: {thread.verdict.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="community-thread-title">{thread.title}</p>
                    <div className="community-thread-meta">
                      <Avatar initials={thread.initials} color={thread.color} />
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{thread.author}</span>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>•</span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{thread.replyCount} replies</span>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>•</span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{thread.timeAgo}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Thread viewer */}
            <div className="community-thread-viewer">
              {activeThread ? (() => {
                const thread = SAMPLE_THREADS.find(t => t.id === activeThread)!
                const status = STATUS_STYLES[thread.status]
                return (
                  <>
                    <div className="community-viewer-header">
                      <span className="community-category-pill">{thread.category}</span>
                      <span className="community-status-pill" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                    </div>
                    <h4 className="community-viewer-title">{thread.title}</h4>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
                      <Avatar initials={thread.initials} color={thread.color} />
                      <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: 12 }}>{thread.author} · {thread.timeAgo}</span>
                    </div>
                    <Discussion type="multiple" defaultValue={[thread.replies[0]?.id]} className="community-discussion">
                      {renderReplies(thread.replies)}
                    </Discussion>
                    <div className="community-reply-box">
                      <textarea
                        className="community-reply-textarea"
                        placeholder="Add your analysis or evidence…"
                        rows={3}
                      />
                      <button className="btn btn-primary community-reply-btn">Post reply</button>
                    </div>
                    <p className="community-moderation-note">
                      Replies are reviewed for accuracy and civility. Repeated misinformation sharing may restrict your account.
                    </p>
                  </>
                )
              })() : (
                <div className="community-viewer-empty">
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                  <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14, textAlign: 'center' }}>
                    Select a thread from the left to view the discussion
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="community-cta">
          <div className="community-cta-inner">
            <h3 className="community-cta-title">Ready to join the conversation?</h3>
            <p className="community-cta-desc">
              Sign up free to post, submit articles, and join live scanning sessions.
              No subscription required.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#scanner" className="btn btn-primary">Start a discussion</a>
              <a href="#scanner" className="btn btn-outline">Submit an article</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
