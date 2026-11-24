import Groq from 'groq-sdk'
import {
  businessKnowledge,
  getKnowledgeAnswer,
} from './businessKnowledge.js'
import { getBusinessSystemPrompt } from './systemPrompt.js'

const defaultModel = 'openai/gpt-oss-20b'
const maxMessageLength = 2000
const maxHistoryEntries = 12
const requestWindowMs = 60_000
const requestLimit = 30
const groqRequestTimeoutMs = 14_000
const safeErrorMessage = 'Sorry, I’m having trouble connecting right now. Please try again in a moment.'
const requestLog = new Map()
let groqClientFactory = (apiKey) => new Groq({ apiKey })

function isRateLimited(request) {
  const address = request.ip || request.socket?.remoteAddress || request.headers?.['x-forwarded-for'] || 'unknown'
  const now = Date.now()
  const recent = (requestLog.get(address) || []).filter((time) => now - time < requestWindowMs)
  recent.push(now)
  requestLog.set(address, recent)
  return recent.length > requestLimit
}

function getSafeHistory(history) {
  if (!Array.isArray(history)) return []
  const entries = history
    .filter((entry) => entry && ['user', 'assistant'].includes(entry.role) && typeof entry.content === 'string' && entry.content.trim())
    .map((entry) => ({ role: entry.role, content: entry.content.trim().slice(0, maxMessageLength) }))
  const pairedEntries = []
  for (const entry of entries) {
    if (pairedEntries.length && pairedEntries[pairedEntries.length - 1].role === entry.role) continue
    pairedEntries.push(entry)
  }
  if (pairedEntries[0]?.role === 'assistant') pairedEntries.shift()
  if (pairedEntries[pairedEntries.length - 1]?.role === 'user') pairedEntries.pop()
  return pairedEntries.slice(-maxHistoryEntries)
}

function getReplyContent(completion) {
  const content = completion?.choices?.[0]?.message?.content
  if (typeof content === 'string') return content.trim()
  if (Array.isArray(content)) return content.map((part) => typeof part === 'string' ? part : part?.text || '').join('').trim()
  return ''
}

export function getConfiguredModel() {
  return (globalThis.process.env.GROQ_MODEL || defaultModel).trim() || defaultModel
}

export function getSafeErrorMessage() {
  return safeErrorMessage
}

export function setGroqClientFactory(factory) {
  groqClientFactory = factory
}

export async function handleChatRequest(request, response) {
  const body = request.body || {}
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return response.status(400).json({ success: false, error: 'Message is required.' })
  if (message.length > maxMessageLength) return response.status(413).json({ success: false, error: 'Please keep your message under 2,000 characters.' })
  if (body.history !== undefined && !Array.isArray(body.history)) return response.status(400).json({ success: false, error: 'History must be an array.' })
  if (isRateLimited(request)) return response.status(429).json({ success: false, error: 'Please wait a moment before trying again.' })

  const history = getSafeHistory(body.history)
  const knownAnswer = getKnowledgeAnswer(message, history)
  if (knownAnswer) return response.json({ success: true, message: knownAnswer })

  const apiKey = globalThis.process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('[chat] GROQ_API_KEY is not configured')
    return response.status(503).json({
      success: false,
      code: 'GROQ_NOT_CONFIGURED',
      error: 'The AI assistant is not configured. Please contact the site administrator.',
    })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), groqRequestTimeoutMs)
  try {
    const completion = await groqClientFactory(apiKey).chat.completions.create({
      model: getConfiguredModel(),
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        { role: 'system', content: getBusinessSystemPrompt() },
        ...history,
        { role: 'user', content: message },
      ],
    }, { signal: controller.signal })
    const reply = getReplyContent(completion)
    if (!reply) return response.status(502).json({ success: false, error: safeErrorMessage })
    return response.json({ success: true, message: reply })
  } catch (error) {
    const groqStatus = Number.isInteger(error?.status) ? error.status : null
    const timedOut = error?.name === 'AbortError'
    const code = timedOut
      ? 'GROQ_TIMEOUT'
      : groqStatus === 401 || groqStatus === 403
        ? 'GROQ_AUTH_REJECTED'
        : groqStatus === 400
          ? 'GROQ_REQUEST_REJECTED'
          : groqStatus === 429
            ? 'GROQ_RATE_LIMITED'
            : 'GROQ_UPSTREAM_FAILURE'
    const status = timedOut ? 504 : groqStatus === 429 ? 429 : groqStatus === 401 || groqStatus === 403 ? 503 : 502
    const errorMessage = code === 'GROQ_TIMEOUT'
      ? 'The assistant request timed out. Please try again.'
      : code === 'GROQ_AUTH_REJECTED'
        ? 'The AI service rejected its server configuration. Please contact the site administrator.'
        : code === 'GROQ_REQUEST_REJECTED'
          ? 'The AI service rejected its configured request. Please contact the site administrator.'
          : code === 'GROQ_RATE_LIMITED'
            ? 'The AI service is rate limited. Please try again shortly.'
            : safeErrorMessage
    console.error('[chat] Groq request failed', JSON.stringify({
      model: getConfiguredModel(),
      status: groqStatus,
      code: typeof error?.code === 'string' ? error.code : null,
      name: typeof error?.name === 'string' ? error.name : 'Error',
    }))
    return response.status(status).json({ success: false, code, error: errorMessage })
  } finally {
    clearTimeout(timeoutId)
  }
}

export { getSafeHistory, getReplyContent }
