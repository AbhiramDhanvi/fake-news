import { useState, useRef, useEffect } from 'react'
import { chatbotQuery, type ChatMessage as BackendChatMessage } from '../lib/insforge'

interface UIMessage {
  text: string
  isUser: boolean
  isError?: boolean
}

interface ChatbotProps {
  currentNewsId?: string | null
}

const INITIAL_SUGGESTIONS = [
  { label: 'Why is this misleading?', msg: 'Why is this article misleading or fake?' },
  { label: 'Show me the evidence', msg: 'What evidence was found for and against this article?' },
  { label: 'How confident is AI?', msg: 'How confident is the AI about this verdict and why?' },
  { label: 'Main red flags', msg: 'What are the main red flags or manipulation tactics used?' },
]

export default function Chatbot({ currentNewsId }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [conversationHistory, setConversationHistory] = useState<BackendChatMessage[]>([])
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

  // Reset conversation when news article changes
  useEffect(() => {
    setMessages([])
    setConversationHistory([])
  }, [currentNewsId])

  const addMessage = (msg: UIMessage) => {
    setMessages(prev => [...prev, msg])
  }

  const handleSend = async (msgOverride?: string) => {
    const msg = (msgOverride ?? inputVal).trim()
    if (!msg || isTyping) return

    addMessage({ text: msg, isUser: true })
    setInputVal('')
    setIsTyping(true)

    // Need a newsId for context-aware answers
    const newsId = currentNewsId ?? 'general'

    // Optimistically build new history
    const newHistory: BackendChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: msg },
    ]

    try {
      const response = await chatbotQuery(newsId, msg, conversationHistory)
      const answer = response.answer

      addMessage({ text: answer, isUser: false })
      setConversationHistory([...newHistory, { role: 'assistant', content: answer }])
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message.includes('news_id and question are required')
            ? 'Please analyze a news article first using the scanner above, then I can answer context-specific questions!'
            : `Error: ${err.message}`
          : 'Failed to get a response. Please try again.'
      addMessage({ text: errorMsg, isUser: false, isError: true })
    } finally {
      setIsTyping(false)
    }
  }

  const hasScannedArticle = Boolean(currentNewsId)

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
            {/* Welcome message */}
            <div className="chat-message bot-message">
              <p>
                {hasScannedArticle
                  ? '📰 I have the article context loaded! Ask me anything about the analysis, claims, or evidence.'
                  : '👋 Hi! I\'m TruthLens AI. Scan a news article above, then ask me anything about it:'}
              </p>
              {messages.length === 0 && (
                <div className="chat-suggestions">
                  {(hasScannedArticle ? INITIAL_SUGGESTIONS : INITIAL_SUGGESTIONS.slice(0, 2)).map(s => (
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
              placeholder={hasScannedArticle ? 'Ask about this article…' : 'Scan an article first, then ask…'}
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
