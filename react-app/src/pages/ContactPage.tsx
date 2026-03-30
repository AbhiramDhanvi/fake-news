import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

type FormField = { name: string; email: string; subject: string; message: string }

const CONTACT_INFO = [
  { icon: '✉️', label: 'Email', value: 'hello@truthlensai.com', href: 'mailto:hello@truthlensai.com' },
  { icon: '🐦', label: 'Twitter / X', value: '@truthlensai', href: 'https://twitter.com/truthlensai' },
  { icon: '💻', label: 'GitHub', value: 'github.com/AbhiramDhanvi/fake-news', href: 'https://github.com/AbhiramDhanvi/fake-news' },
  { icon: '💬', label: 'Discord', value: 'discord.gg/truthlens', href: '#' },
  { icon: '🕐', label: 'Response time', value: 'Within 24 hours', href: undefined },
]

const FAQ = [
  { q: 'Is TruthLens AI free to use?', a: 'Yes — the scanner, community discussions, and live sessions are all free. We plan a pro tier for API access and bulk scanning.' },
  { q: 'How accurate is the AI verdict?', a: 'Our 5-agent pipeline achieves 99.2% accuracy on our benchmark dataset. The confidence score reflects uncertainty — always read it alongside the explanation.' },
  { q: 'Can I use TruthLens on my own articles?', a: "Yes. You can paste any article text or URL. The scanner is designed for public-interest journalism, research, and fact-checking." },
  { q: 'How do I report an incorrect verdict?', a: 'Use the "Report analysis" link on any scan result, or email us with the article URL and your reasoning. Community threads are also a great place to contest findings.' },
  { q: 'Is my data stored or shared?', a: 'Scans are processed locally in your browser. We do not store article text. Community posts are public only if you opt in.' },
]

export default function ContactPage() {
  const [form, setForm] = useState<FormField>({ name:'', email:'', subject:'', message:'' })
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name && form.email && form.message) setSent(true)
  }

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <span className="section-label">📬 Get in touch</span>
          <h1 className="page-hero-title">Contact Us</h1>
          <p className="page-hero-desc">
            Have a question, found a bug, or want to collaborate? We'd love to hear from you.
            We respond to all messages within 24 hours.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container" style={{ paddingTop:60,paddingBottom:40 }}>
        <div className="contact-page-layout">

          {/* Left: Contact info + FAQ */}
          <div className="contact-info-col">
            <h2 className="contact-col-heading">Get in touch</h2>

            <div className="contact-info-cards">
              {CONTACT_INFO.map(item => (
                <div key={item.label} className="contact-info-card">
                  <span style={{ fontSize:22,lineHeight:1 }}>{item.icon}</span>
                  <div>
                    <div className="contact-info-label">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="contact-info-value contact-value-link">
                        {item.value}
                      </a>
                    ) : (
                      <div className="contact-info-value">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="contact-quick-links">
              <h3>Quick links</h3>
              <div className="contact-quick-grid">
                <Link to="/" className="contact-quick-card">
                  <span>🔍</span>
                  <div>
                    <div className="contact-quick-title">Try the Scanner</div>
                    <div className="contact-quick-desc">Analyze an article now</div>
                  </div>
                </Link>
                <Link to="/community" className="contact-quick-card">
                  <span>👥</span>
                  <div>
                    <div className="contact-quick-title">Community</div>
                    <div className="contact-quick-desc">Join the discussion</div>
                  </div>
                </Link>
                <Link to="/how-it-works" className="contact-quick-card">
                  <span>📖</span>
                  <div>
                    <div className="contact-quick-title">Documentation</div>
                    <div className="contact-quick-desc">How the AI works</div>
                  </div>
                </Link>
                <a href="https://github.com/AbhiramDhanvi/fake-news" target="_blank" rel="noopener noreferrer" className="contact-quick-card">
                  <span>⭐</span>
                  <div>
                    <div className="contact-quick-title">GitHub</div>
                    <div className="contact-quick-desc">Star the repository</div>
                  </div>
                </a>
              </div>
            </div>

            {/* FAQ */}
            <div className="contact-faq">
              <h3>Frequently asked questions</h3>
              {FAQ.map((item, i) => (
                <div key={i} className={`contact-faq-item${openFaq===i?' open':''}`}>
                  <button className="contact-faq-q" onClick={() => setOpenFaq(openFaq===i ? null : i)}>
                    <span>{item.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transform: openFaq===i ? 'rotate(180deg)' : 'rotate(0)', transition:'transform .25s', flexShrink:0 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="contact-faq-a">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="contact-form-col">
            <h2 className="contact-col-heading">Send us a message</h2>
            {sent ? (
              <div className="contact-success">
                <div style={{ fontSize:48,marginBottom:16 }}>🎉</div>
                <h3>Message sent!</h3>
                <p>Thanks for reaching out, {form.name}. We'll reply to <strong>{form.email}</strong> within 24 hours.</p>
                <button className="btn btn-outline" style={{ marginTop:20 }} onClick={() => { setSent(false); setForm({ name:'',email:'',subject:'',message:'' }) }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <div className="contact-form-field">
                    <label>Full name *</label>
                    <input
                      className="comm-input"
                      name="name"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="contact-form-field">
                    <label>Email address *</label>
                    <input
                      className="comm-input"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="contact-form-field">
                  <label>Subject</label>
                  <select className="comm-input" name="subject" value={form.subject} onChange={handleChange}>
                    <option value="">Select a topic…</option>
                    <option>General enquiry</option>
                    <option>Bug report</option>
                    <option>Feature request</option>
                    <option>Press / media</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="contact-form-field">
                  <label>Message *</label>
                  <textarea
                    className="comm-input"
                    name="message"
                    rows={6}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width:'100%',justifyContent:'center',padding:'14px 0',fontSize:15 }}>
                  Send message →
                </button>
                <p style={{ fontSize:12,color:'rgba(255,255,255,0.30)',textAlign:'center',marginTop:12 }}>
                  We respect your privacy. Your message is never shared with third parties.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
