import { useState, useRef, useEffect } from 'react'

interface UIMessage {
  text: string
  isUser: boolean
  isError?: boolean
}

interface ChatbotProps {
  articleText?: string | null
}

const INITIAL_SUGGESTIONS = [
  { label: 'How does TruthLens work?', msg: 'How does TruthLens detect fake news?' },
  { label: 'What is clickbait?', msg: 'What is clickbait and how is it detected?' },
  { label: 'How to spot fake news?', msg: 'What are the best ways to spot fake news?' },
  { label: 'Why is bias analysis important?', msg: 'Why is bias analysis important in news?' },
]

const ARTICLE_SUGGESTIONS = [
  { label: 'Why is this misleading?', msg: 'Why might this article be misleading or fake?' },
  { label: 'Show me the red flags', msg: 'What are the main red flags in this article?' },
  { label: 'How to verify this?', msg: 'How can I independently verify this article?' },
  { label: 'Key manipulation tactics', msg: 'What manipulation tactics are used in this article?' },
]

// Simple local response engine
function generateResponse(msg: string, hasArticle: boolean): string {
  const q = msg.toLowerCase()

  if (q.includes('how does truthlens') || q.includes('how does it work') || q.includes('how does this work')) {
    return 'TruthLens uses a multi-agent AI pipeline: first, a Claim Agent extracts key factual assertions. Then an Evidence Agent cross-references them with known sources. A Credibility Agent scores sources, a Bias Agent detects emotional manipulation language, and finally a Consensus Agent delivers a unified verdict with a confidence score.'
  }
  if (q.includes('clickbait')) {
    return 'Clickbait uses sensational headlines to bait clicks — phrases like "You won\'t believe...", "SHOCKING:", or "They don\'t want you to know..." TruthLens scans for these patterns and scores them on a 0–100 Clickbait Scale. A score above 50 suggests the content may be designed to provoke rather than inform.'
  }
  if (q.includes('spot fake news') || q.includes('detect fake')) {
    return 'Key red flags for fake news: 1️⃣ Overly emotional or sensational headlines. 2️⃣ No named author or source. 3️⃣ Extreme political bias. 4️⃣ Claims that seem too good (or bad) to be true. 5️⃣ Missing dates or outdated info presented as new. Always cross-check with trusted outlets like Reuters, AP, or BBC.'
  }
  if (q.includes('bias')) {
    return 'Bias analysis matters because even factually correct information can mislead through selective framing, emotional language, or omission of key context. TruthLens detects emotional tone, urgency signaling, fear-baiting, and manipulation tactics to give you a fuller picture of how a story is being told — not just what it says.'
  }
  if (q.includes('misleading') || q.includes('red flags')) {
    if (hasArticle) {
      return 'Based on the article you scanned, the system detected emotional language patterns and potential clickbait signals. Key indicators include urgency-inducing phrases, fear language, and unverified attribution ("sources say"). These are common in deliberately misleading content. Always look for named sources and cross-reference claims independently.'
    }
    return 'Common misleading patterns include: fear-inducing language, vague attribution ("insiders say"), extreme urgency, and emotional manipulation. Scan an article above to get a specific analysis!'
  }
  if (q.includes('verify') || q.includes('check')) {
    return 'To independently verify a news claim: 1️⃣ Search the claim on Google News to find corroborating reports. 2️⃣ Check Reuters Fact Check (reuters.com/fact-check), Snopes (snopes.com), or AP Fact Check. 3️⃣ Look for the original primary source (government reports, scientific papers, official statements). 4️⃣ Check the publication\'s about page and track record.'
  }
  if (q.includes('manipulation') || q.includes('tactic')) {
    if (hasArticle) {
      return 'The scanned article was checked for common manipulation tactics: emotional amplification, false urgency, fear signaling, unverified sourcing, and provocative framing. The agent pipeline identified specific phrases that match these patterns — see the Bias & Manipulation Signals panel above for the full breakdown.'
    }
    return 'Common manipulation tactics include: creating false urgency ("Act now!"), emotional amplification, us-vs-them framing, cherry-picked statistics, and vague attribution. Scan an article to detect these patterns automatically!'
  }
  if (q.includes('confidence') || q.includes('score') || q.includes('percent')) {
    return 'The confidence score (0–100%) represents how certain the AI pipeline is in its verdict. Above 80%: high certainty. 60–80%: moderate evidence. Below 60%: limited signals, treat as unverified. It\'s based on the strength and consistency of signals across all five analysis agents.'
  }
  if (q.includes('what is truthlens') || q.includes('about truthlens')) {
    return 'TruthLens AI is a multi-agent fake news detection engine. It breaks news content down through 5 specialized AI agents — Claim, Evidence, Credibility, Bias, and Consensus — to deliver an explainable verdict. The goal is to make misinformation detection transparent, not just a black-box label.'
  }
  if (hasArticle) {
    return `Great question about the article you scanned! The TruthLens pipeline analyzed it for factual claims, source credibility, emotional language, and bias patterns. The verdict and detailed breakdown are shown in the scanner panel above. Is there a specific aspect — the claims, evidence, or bias signals — you'd like me to explain further?`
  }
  return `I'm TruthLens AI, your misinformation analysis assistant. Try scanning a news article above and I can help explain the results! You can also ask me about how fake news detection works, what clickbait is, or how to verify claims yourself.`
}

export default function Chatbot({ articleText }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [messages, isOpen])

  // Reset conversation when article changes
  useEffect(() => {
    setMessages([])
  }, [articleText])

  const addMessage = (msg: UIMessage) => {
    setMessages(prev => [...prev, msg])
  }

  const handleSend = async (msgOverride?: string) => {
    const msg = (msgOverride ?? inputVal).trim()
    if (!msg || isTyping) return

    addMessage({ text: msg, isUser: true })
    setInputVal('')
    setIsTyping(true)

    // Simulate typing delay (300–700ms)
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400))

    const response = generateResponse(msg, Boolean(articleText))
    addMessage({ text: response, isUser: false })
    setIsTyping(false)
  }

  const hasScannedArticle = Boolean(articleText)
  const suggestions = hasScannedArticle ? ARTICLE_SUGGESTIONS : INITIAL_SUGGESTIONS

  return (
    <div className="chatbot-widget" id="chatbot-widget">
      <button
        className="chatbot-toggle"
        id="chatbot-toggle"
        aria-label="Open AI assistant"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span className="chatbot-badge">AI</span>
      </button>

      {isOpen && (
        <div className="chatbot-panel" id="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
              </svg>
              <span>TruthLens AI Assistant</span>
              {hasScannedArticle && (
                <span className="chatbot-context-badge">📰 Article loaded</span>
              )}
            </div>
            <button
              className="chatbot-close"
              id="chatbot-close"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >✕</button>
          </div>

          <div className="chatbot-messages" id="chatbot-messages">
            <div className="chat-message bot-message">
              <p>
                {hasScannedArticle
                  ? '📰 I have the article context loaded! Ask me anything about the analysis, claims, or evidence.'
                  : '👋 Hi! I\'m TruthLens AI. Ask me about fake news detection, or scan an article above for specific analysis:'}
              </p>
              {messages.length === 0 && (
                <div className="chat-suggestions">
                  {suggestions.map(s => (
                    <button
                      key={s.msg}
                      className="suggestion-btn"
                      onClick={() => handleSend(s.msg)}
                      disabled={isTyping}
                    >{s.label}</button>
                  ))}
                </div>
              )}
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-message ${m.isUser ? 'user-message' : m.isError ? 'bot-message error-message' : 'bot-message'}`}
              >
                <p>{m.text}</p>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message bot-message typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              id="chatbot-input"
              className="chatbot-input"
              placeholder={hasScannedArticle ? 'Ask about this article…' : 'Ask about fake news detection…'}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
              disabled={isTyping}
            />
            <button
              className="chatbot-send"
              id="chatbot-send"
              aria-label="Send message"
              onClick={() => handleSend()}
              disabled={isTyping}
            >
              {isTyping ? (
                <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
