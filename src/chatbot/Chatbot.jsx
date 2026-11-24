import { useEffect, useRef, useState } from 'react'
import { businessKnowledge } from './businessKnowledge'
import { postChatMessage } from './chatApi'
import './chatbot.css'

const quickQuestions = [
  'Explore Our Products',
  'Agricultural Products',
  'Automotive Products',
  'Electronics & Mobile Accessories',
  'Computers & Technology Equipment',
  'Import & Export Services',
  'Contact the founder',
]

const navigationLabels = {
  about: 'About',
  products: 'Products',
  services: 'Services',
  contact: 'Contact',
  location: 'View Location',
}

const navigationTargets = {
  about: businessKnowledge.sections.About,
  products: businessKnowledge.sections.Products,
  services: businessKnowledge.sections.Services,
  contact: businessKnowledge.sections.Contact,
  location: businessKnowledge.sections.Location,
}

function getNavigationAction(question, answer) {
  const text = `${question} ${answer}`.toLowerCase()
  if (/(address|located|location|visit|ঠিকানা|কোথায়|কোথায়)/i.test(text)) return { label: navigationLabels.location, href: navigationTargets.location }
  if (/(founder|founder|founder|প্রতিষ্ঠাতা|ফাউন্ডার|ওমর|omar)/i.test(text)) return { label: navigationLabels.about, href: navigationTargets.about }
  if (/(ginger|garlic|chili|agricultural|automotive|engine|spare|paint|electronics|mobile|fruit|feed|wheat|computer|technology|laptop|monitor|camera|gaming|peripheral|network|products|পণ্য|প্রোডাক্ট|আদা|রসুন|মরিচ|ইঞ্জিন|ফল|কম্পিউটার|প্রযুক্তি|ল্যাপটপ|মনিটর|ক্যামেরা|গেমিং|নেটওয়ার্ক|নেটওয়ার্ক)/i.test(text)) return { label: navigationLabels.products, href: navigationTargets.products }
  if (/(contact|enquiry|phone|email|whatsapp|যোগাযোগ|ফোন|ইমেইল|নম্বর)/i.test(text)) return { label: navigationLabels.contact, href: navigationTargets.contact }
  if (/(import|export|auction|supplier|supply|source|আমদানি|রপ্তানি|নিলাম|সরবরাহকারী)/i.test(text)) return { label: navigationLabels.services, href: navigationTargets.services }
  return null
}

function formatAssistantContent(content) {
  return String(content || '')
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/^```[^\n]*\n?|```$/g, ''))
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function cleanAssistantContent(content) {
  return { visibleContent: formatAssistantContent(content), embeddedUrl: null }
}

function getChatErrorMessage(error, question) {
  const bangla = /[\u0980-\u09FF]/.test(question) || /\b(tomader|apnader|kothay|ase|ache|dam|daam|ki)\b/i.test(question)
  if (error?.code === 'GROQ_NOT_CONFIGURED') {
    return bangla ? 'সহকারীটি এখনো কনফিগার করা হয়নি। অনুগ্রহ করে IRHAM ENTERPRISE-এর সঙ্গে যোগাযোগ করুন।' : 'The assistant is not configured yet. Please contact IRHAM ENTERPRISE.'
  }
  if (error?.code === 'GROQ_AUTH_REJECTED' || error?.code === 'GROQ_REQUEST_REJECTED') {
    return bangla ? 'সহকারীটির সার্ভার কনফিগারেশনে সমস্যা হয়েছে। অনুগ্রহ করে IRHAM ENTERPRISE-এর সঙ্গে যোগাযোগ করুন।' : 'The assistant has a server configuration issue. Please contact IRHAM ENTERPRISE.'
  }
  if (error?.status === 429) {
    return bangla ? 'অনেকগুলো অনুরোধ হয়েছে। একটু অপেক্ষা করে আবার চেষ্টা করুন।' : 'Too many requests. Please wait a moment and try again.'
  }
  if (error?.status === 0 || error?.name === 'TypeError') {
    return bangla ? 'চ্যাট সার্ভারে সংযোগ করা যাচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন বা আমাদের সঙ্গে যোগাযোগ করুন।' : 'The chat service cannot be reached. Please try again or contact IRHAM ENTERPRISE.'
  }
  if (error?.status === 503) {
    return bangla ? 'সহকারীটি এখন সাময়িকভাবে প্রস্তুত নয়। অনুগ্রহ করে পরে আবার চেষ্টা করুন বা আমাদের সঙ্গে যোগাযোগ করুন।' : 'The assistant is temporarily unavailable. Please try again later or contact our team.'
  }
  if (error?.status === 504 || error?.name === 'AbortError') {
    return bangla ? 'উত্তর পেতে দেরি হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন, অথবা আমাদের সঙ্গে যোগাযোগ করুন।' : 'The assistant is taking longer than usual to respond. Please try again or contact us.'
  }
  if (error?.name === 'ChatApiError' && error.message) return error.message
  return bangla
    ? 'দুঃখিত, সহকারীটি এখন সাময়িকভাবে পাওয়া যাচ্ছে না। আবার চেষ্টা করুন অথবা IRHAM ENTERPRISE-এর সঙ্গে যোগাযোগ করুন।'
    : 'Sorry, the assistant is temporarily unavailable. Please try again or contact IRHAM ENTERPRISE directly.'
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: 'Hello! 👋 Welcome to IRHAM ENTERPRISE. How can I help you with our products or business services today?' },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messageIdRef = useRef(0)
  const requestInFlightRef = useRef(false)
  const requestControllerRef = useRef(null)
  const mountedRef = useRef(true)
  const configuredApiUrl = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
  const apiUrls = [...new Set(['/api/chat', configuredApiUrl ? `${configuredApiUrl}/api/chat` : ''].filter(Boolean))]
  const requestTimeoutMs = 30_000

  const getApiUrls = () => apiUrls

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requestControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, isLoading])

  useEffect(() => {
    if (!isOpen) return undefined
    inputRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const sendMessage = async (question) => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || requestInFlightRef.current) return

    const requestId = `${Date.now()}-${messageIdRef.current + 1}`
    messageIdRef.current += 1
    const userMessage = { id: `${requestId}-user`, role: 'user', content: trimmedQuestion }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setShowQuickReplies(false)
    setIsLoading(true)
    requestInFlightRef.current = true

    const controller = new AbortController()
    requestControllerRef.current = controller
    let timedOut = false
    const timeoutId = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, requestTimeoutMs)
    const connectingTimeoutId = window.setTimeout(() => {
      if (mountedRef.current) setIsConnecting(true)
    }, 2000)

    try {
      const endpoints = getApiUrls()
      const history = messages
        .filter((entry) => !entry.isError && entry.id !== 'welcome' && ['user', 'assistant'].includes(entry.role) && typeof entry.content === 'string' && entry.content.trim())
        .slice(-12)
        .map(({ role, content }) => ({ role, content }))
      const payload = await postChatMessage(endpoints, { message: trimmedQuestion, history, signal: controller.signal })
      const answer = payload.message
      const { visibleContent } = cleanAssistantContent(answer)
      if (mountedRef.current) {
        setMessages((current) => [...current, {
          id: `${requestId}-assistant`,
          role: 'assistant',
          content: visibleContent,
          action: getNavigationAction(trimmedQuestion, visibleContent),
        }])
      }
    } catch (error) {
      if (mountedRef.current && (error?.name !== 'AbortError' || timedOut)) {
        const displayedError = error?.name === 'AbortError'
          ? { name: 'AbortError', status: 504, code: 'CHAT_TIMEOUT' }
          : error
        setMessages((current) => [
          ...current.map((entry) => entry.id === userMessage.id ? { ...entry, isError: true } : entry),
          {
            id: `${requestId}-error`,
            role: 'assistant',
            content: getChatErrorMessage(displayedError, trimmedQuestion),
            isError: true,
            retryQuestion: trimmedQuestion,
          },
        ])
      }
    } finally {
      window.clearTimeout(timeoutId)
      window.clearTimeout(connectingTimeoutId)
      requestInFlightRef.current = false
      requestControllerRef.current = null
      if (mountedRef.current) {
        setIsConnecting(false)
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(input)
  }

  const handleNavigationActionClick = (event, action) => {
    if (action.href?.startsWith('#')) {
      const target = document.querySelector(action.href)
      if (target) {
        event.preventDefault()
        const targetTop = target.getBoundingClientRect().top + window.scrollY - 118
        window.scrollTo({ top: targetTop, behavior: 'smooth' })
        window.history.pushState(null, '', action.href)
      }
    }
    setIsOpen(false)
  }

  return (
    <div className="chatbot-root">
      {isOpen && (
        <section className="chatbot-window" aria-label="IRHAM ENTERPRISE assistant chat" aria-live="polite">
          <header className="chatbot-header">
            <div>
              <p className="chatbot-eyebrow">IRHAM ENTERPRISE</p>
              <h2>Business Assistant</h2>
              <span>Online / Business Assistant</span>
            </div>
            <button type="button" className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">&times;</button>
          </header>

          <div className="chatbot-content">
            <div className="chatbot-messages" role="log" aria-label="Conversation">
              {messages.map((message) => (
                <div className={`chatbot-message-row ${message.role}`} key={message.id}>
                  <div className="chatbot-message">
                    {message.content}
                    {message.retryQuestion && (
                      <button type="button" className="chatbot-retry" onClick={() => sendMessage(message.retryQuestion)} disabled={isLoading}>
                        Retry
                      </button>
                    )}
                    {message.action && (
                      <a className="chatbot-action" href={message.action.href} target={message.action.external ? '_blank' : undefined} rel={message.action.external ? 'noopener noreferrer' : undefined} onClick={(event) => handleNavigationActionClick(event, message.action)}>{message.action.label} <span aria-hidden="true">&rarr;</span></a>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && <div className="chatbot-message-row assistant"><div className="chatbot-message chatbot-thinking">{isConnecting && <span className="chatbot-connecting">Connecting to the business assistant...</span>}<span /> <span /> <span /></div></div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-suggestions">
              <div className={`chatbot-quick-questions ${showQuickReplies ? 'is-visible' : ''}`} aria-label="Suggested questions" aria-hidden={!showQuickReplies}>
                {quickQuestions.map((question) => (
                  <button type="button" key={question} onClick={() => sendMessage(question)} tabIndex={showQuickReplies ? 0 : -1} disabled={!showQuickReplies}>{question}</button>
                ))}
              </div>
              <button type="button" className="chatbot-hint-toggle" onClick={() => setShowQuickReplies((current) => !current)} aria-label={showQuickReplies ? 'Hide suggested questions' : 'Show suggested questions'} aria-expanded={showQuickReplies}>
                <span aria-hidden="true">✦</span>
              </button>
            </div>
          </div>

          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about products, import, supply or business enquiries..."
              aria-label="Ask IRHAM ENTERPRISE assistant"
              disabled={isLoading}
            />
            <button type="submit" aria-label="Send message" disabled={isLoading || !input.trim()}>&rarr;</button>
          </form>
        </section>
      )}
      <button type="button" className="chatbot-trigger" onClick={() => setIsOpen((current) => !current)} aria-label={isOpen ? 'Close business assistant' : 'Open business assistant'} aria-expanded={isOpen} title={isOpen ? 'Close business assistant' : 'Open business assistant'}>
        <svg className="chatbot-trigger-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 22.5V10.2A2.2 2.2 0 0 1 9.2 8h13.6A2.2 2.2 0 0 1 25 10.2v8.6a2.2 2.2 0 0 1-2.2 2.2H12l-5 4v-2.5Z" />
          <path d="M11 13h10M11 17h7" />
        </svg>
      </button>
    </div>
  )
}

export default Chatbot
