import test from 'node:test'
import assert from 'node:assert/strict'

import {
  businessKnowledge,
  detectLanguage,
  getKnowledgeAnswer,
  getLocationResponse,
  getProductAnswer,
} from '../src/chatbot/businessKnowledge.js'
import { getBusinessSystemPrompt } from '../src/chatbot/systemPrompt.js'
import { postChatMessage } from '../src/chatbot/chatApi.js'

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(payload) { this.body = payload; return this },
  }
}

test('knowledge base contains the confirmed Irham identity and six categories', () => {
  assert.equal(businessKnowledge.name, 'IRHAM ENTERPRISE')
  assert.equal(businessKnowledge.founder.name, 'Omar Fayaj Chy')
  assert.equal(businessKnowledge.phone, '+88 01815-677521')
  assert.deepEqual(businessKnowledge.categories, [
    { name: 'Agricultural Products', products: ['Ginger', 'Garlic', 'Chili', 'Fresh Agricultural Products'] },
    { name: 'Food & Agricultural Supply', products: ['Sunflower Oil', 'Cattle Feed', 'Wheat Bran'] },
    { name: 'Automotive Products', products: ['Car Engines', 'Car Spare Parts', 'Car Paint'] },
    { name: 'Electronics & Mobile Accessories', products: ['Mobile Accessories', 'Other Electronics Products'] },
    { name: 'Fresh Fruits', products: ['Imported Fresh Fruits', 'Seasonal Fruits'] },
    { name: 'Computers & Technology Equipment', products: ['Laptops & Monitors', 'Digital Cameras', 'Gaming Accessories', 'Computer Peripherals', 'Networking Devices'] },
  ])
  assert.doesNotMatch(JSON.stringify(businessKnowledge.categories), /textile|garment|fabric|apparel/i)
})

test('chatbot system instructions are generated from the six-category catalogue', () => {
  const prompt = getBusinessSystemPrompt()
  for (const { name, products } of businessKnowledge.categories) {
    assert.ok(prompt.includes(name))
    for (const product of products) assert.ok(prompt.includes(product))
  }
  assert.match(prompt, /only claim that a product or category is offered if it appears in the catalogue/i)
  assert.doesNotMatch(prompt, /textile|garment|fabric|apparel/i)
})

test('product and location questions use confirmed information', () => {
  assert.match(getProductAnswer('Do you supply ginger?'), /ginger/i)
  assert.match(getProductAnswer('Do you supply car engines?'), /car engines/i)
  assert.equal(getProductAnswer('Do you sell textile fabrics?'), null)
  assert.match(getLocationResponse().message, /7th Floor, Orient Tower/i)
})

test('English, Bangla and Banglish product questions receive relevant replies', () => {
  const allBangla = getKnowledgeAnswer('তোমাদের কাছে কি কি প্রোডাক্ট আছে?')
  const allBanglish = getKnowledgeAnswer('tomader kache ki ki product ase?')
  const ginger = getKnowledgeAnswer('তোমাদের কাছে কি আদা আছে?')
  const automotive = getKnowledgeAnswer('What automotive products do you supply?')
  const electronics = getKnowledgeAnswer('তোমাদের কাছে কি কি electronics পাওয়া যায়?')
  const computers = getKnowledgeAnswer('Do you sell laptops and networking devices?')
  const computersBangla = getKnowledgeAnswer('কম্পিউটার পণ্য কি আছে?')

  assert.equal(detectLanguage('tomader kache ki ki product ase?'), 'banglish')
  assert.match(allBangla, /Agricultural Products|কৃষিপণ্য/i)
  assert.match(allBangla, /Fresh Fruits/)
  assert.doesNotMatch(allBangla, /textile|garment|fabric|apparel/i)
  assert.match(allBanglish, /Agricultural Products|কৃষিপণ্য/i)
  assert.match(ginger, /আদা|Ginger/)
  assert.match(automotive, /Car Engines, Car Spare Parts, Car Paint/)
  assert.match(electronics, /Mobile Accessories/)
  assert.doesNotMatch(electronics, /chargers|earphones|headphones/i)
  assert.match(computers, /Computers & Technology Equipment/)
  assert.match(computers, /Laptops & Monitors, Digital Cameras, Gaming Accessories, Computer Peripherals, Networking Devices/)
  assert.match(computersBangla, /Laptops & Monitors|Networking Devices/)
})

test('founder, contact, office hours and unsupported questions use confirmed information', () => {
  assert.match(getKnowledgeAnswer('তোমাদের প্রতিষ্ঠাতা কে?'), /Omar Fayaj Chy/)
  assert.match(getKnowledgeAnswer('তোমাদের অফিস কোথায়?'), /7th Floor, Orient Tower, North Laldigi, Kotowali, Chattogram, Bangladesh/)
  assert.match(getKnowledgeAnswer('তোমাদের WhatsApp নম্বর দাও।'), /\+88 01815-677521/)
  assert.match(getKnowledgeAnswer('তোমাদের email address দাও।'), /enterpriseirham@gmail.com/)
  assert.match(getKnowledgeAnswer('Do you sell textiles or garments?'), /not currently listed in .*catalogue/i)
  assert.match(getKnowledgeAnswer('আপনারা কি পোশাক বিক্রি করেন?'), /পণ্য তালিকায় নেই.*6টি বিভাগের/s)
  assert.match(getKnowledgeAnswer('তোমাদের অফিস শুক্রবার খোলা থাকে?'), /Friday closed/i)
  assert.match(getKnowledgeAnswer('আগের automotive products গুলোর দাম কত?', [
    { role: 'user', content: 'What automotive products do you supply?' },
    { role: 'assistant', content: 'Car engines, spare parts and car paint.' },
  ]), /নিশ্চিত মূল্য|দাম|পরিমাণ/i)
  assert.match(getKnowledgeAnswer('আমার ৫০০ কেজি রসুন লাগবে।'), /৫০০ কেজি|পরিমাণ/i)
  assert.match(getKnowledgeAnswer('Tell me a joke.'), /focus on IRHAM ENTERPRISE/i)
})

test('conversation follow-ups retain context without inventing inventory or prices', () => {
  const history = [
    { role: 'user', content: 'What automotive products do you supply?' },
    { role: 'assistant', content: 'Car engines, spare parts and car paint.' },
  ]
  assert.match(getKnowledgeAnswer('আগের automotive products গুলোর দাম কত?', history), /দাম|মূল্য|পরিমাণ/i)
  assert.match(getKnowledgeAnswer('আমার ৫০০ কেজি রসুন লাগবে।'), /৫০০ কেজি|পরিমাণ/i)
})

test('out-of-scope requests are redirected to company support', () => {
  assert.match(getKnowledgeAnswer('Tell me a joke.'), /focus on IRHAM ENTERPRISE/i)
})

test('chat API accepts only valid success payloads and falls back on server or parse errors', async () => {
  const calls = []
  const result = await postChatMessage(['/primary', '/backup'], { message: 'Hello', history: [] }, async (url) => {
    calls.push(url)
    if (url === '/primary') return { ok: true, status: 200, json: async () => ({ success: true, message: '' }) }
    return { ok: true, status: 200, json: async () => ({ success: true, message: 'Hello from the assistant.' }) }
  })
  assert.deepEqual(calls, ['/primary', '/backup'])
  assert.equal(result.message, 'Hello from the assistant.')
})

test('chat API does not retry non-retryable client errors', async () => {
  let calls = 0
  await assert.rejects(
    postChatMessage(['/primary', '/backup'], { message: 'Hello', history: [] }, async () => {
      calls += 1
      return { ok: false, status: 429, json: async () => ({ success: false, code: 'GROQ_RATE_LIMITED', error: 'Rate limited.' }) }
    }),
    (error) => error.status === 429 && error.code === 'GROQ_RATE_LIMITED',
  )
  assert.equal(calls, 1)
})

test('chat validation and oversized input are rejected', async () => {
  const { handleChatRequest } = await import('../src/chatbot/chatHandler.js')
  const empty = createResponse()
  await handleChatRequest({ body: {} }, empty)
  assert.equal(empty.statusCode, 400)
  assert.deepEqual(empty.body, { success: false, error: 'Message is required.' })

  const large = createResponse()
  await handleChatRequest({ body: { message: 'x'.repeat(2001) } }, large)
  assert.equal(large.statusCode, 413)
})

test('chat safely reports a missing Groq key', async () => {
  const { handleChatRequest } = await import('../src/chatbot/chatHandler.js')
  const previousKey = process.env.GROQ_API_KEY
  delete process.env.GROQ_API_KEY
  const response = createResponse()
  try {
    await handleChatRequest({ body: { message: 'What supplier onboarding process do you use?' } }, response)
  } finally {
    if (previousKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousKey
  }
  assert.equal(response.statusCode, 503)
  assert.equal(response.body.code, 'GROQ_NOT_CONFIGURED')
  assert.match(response.body.error, /GROQ_API_KEY|configured/i)
  assert.doesNotMatch(response.body.error, /gsk_|stack trace/i)
})

test('Groq failures return safe typed errors without echoing credentials or user content', async () => {
  const { handleChatRequest, setGroqClientFactory } = await import('../src/chatbot/chatHandler.js')
  const previousKey = process.env.GROQ_API_KEY
  const previousModel = process.env.GROQ_MODEL
  const previousConsoleError = console.error
  const diagnostics = []
  const failureCases = [
    { status: 429, code: 'GROQ_RATE_LIMITED', errorStatus: 429, errorCode: 'rate_limit_exceeded', message: 'The AI service is rate limited. Please try again shortly.' },
    { status: 504, code: 'GROQ_TIMEOUT', errorName: 'AbortError', message: 'The assistant request timed out. Please try again.' },
    { status: 503, code: 'GROQ_AUTH_REJECTED', errorStatus: 401, errorCode: 'invalid_api_key', message: 'The AI service rejected its server configuration. Please contact the site administrator.' },
  ]
  process.env.GROQ_API_KEY = 'test-secret-placeholder'
  delete process.env.GROQ_MODEL
  console.error = (...values) => diagnostics.push(values.join(' '))
  try {
    for (const failureCase of failureCases) {
      setGroqClientFactory(() => ({
        chat: { completions: { create: async () => {
          const error = new Error('test-secret-placeholder supplier onboarding process')
          if (failureCase.errorStatus) error.status = failureCase.errorStatus
          if (failureCase.errorCode) error.code = failureCase.errorCode
          if (failureCase.errorName) error.name = failureCase.errorName
          throw error
        } } },
      }))
      const response = createResponse()
      await handleChatRequest({ body: { message: 'What supplier onboarding process do you use?' } }, response)
      assert.equal(response.statusCode, failureCase.status)
      assert.equal(response.body.code, failureCase.code)
      assert.equal(response.body.error, failureCase.message)
      assert.doesNotMatch(JSON.stringify(response.body), /test-secret-placeholder|supplier onboarding process/)
    }
  } finally {
    console.error = previousConsoleError
    setGroqClientFactory(() => ({ chat: { completions: { create: async () => ({ choices: [] }) } } }))
    if (previousKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousKey
    if (previousModel === undefined) delete process.env.GROQ_MODEL
    else process.env.GROQ_MODEL = previousModel
  }
  assert.doesNotMatch(diagnostics.join(' '), /test-secret-placeholder|supplier onboarding process/)
})

test('confirmed product and unlisted-category questions work without calling Groq', async () => {
  const { handleChatRequest } = await import('../src/chatbot/chatHandler.js')
  const previousKey = process.env.GROQ_API_KEY
  delete process.env.GROQ_API_KEY
  const response = createResponse()
  const unlisted = createResponse()
  try {
    await handleChatRequest({ body: { message: 'Do you supply car engines?' } }, response)
    await handleChatRequest({ body: { message: 'Do you sell garments?' } }, unlisted)
  } finally {
    if (previousKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousKey
  }
  assert.equal(response.statusCode, 200)
  assert.equal(response.body.success, true)
  assert.match(response.body.message, /car engines/i)
  assert.equal(unlisted.statusCode, 200)
  assert.match(unlisted.body.message, /not currently listed in .*catalogue/i)
})

test('chat sends bounded history and parses a Groq response', async () => {
  const { handleChatRequest, setGroqClientFactory } = await import('../src/chatbot/chatHandler.js')
  const previousKey = process.env.GROQ_API_KEY
  const previousModel = process.env.GROQ_MODEL
  let receivedRequest
  process.env.GROQ_API_KEY = 'test-only-placeholder'
  delete process.env.GROQ_MODEL
  setGroqClientFactory(() => ({
    chat: { completions: { create: async (request) => {
      receivedRequest = request
      return { choices: [{ message: { content: 'IRHAM ENTERPRISE provides import and export connections.' } }] }
    } } },
  }))
  const response = createResponse()
  try {
    await handleChatRequest({
      body: {
        message: 'What supplier onboarding process do you use?',
        history: Array.from({ length: 15 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', content: `message ${index}` })),
      },
    }, response)
  } finally {
    setGroqClientFactory(() => ({ chat: { completions: { create: async () => ({ choices: [] }) } } }))
    if (previousKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousKey
    if (previousModel === undefined) delete process.env.GROQ_MODEL
    else process.env.GROQ_MODEL = previousModel
  }
  assert.equal(response.statusCode, 200)
  assert.equal(receivedRequest.messages.length, 14)
  assert.equal(receivedRequest.messages[0].role, 'system')
  assert.equal(receivedRequest.messages[1].role, 'user')
  assert.equal(receivedRequest.messages[12].role, 'assistant')
  assert.equal(receivedRequest.messages[13].role, 'user')
  assert.equal(receivedRequest.model, 'openai/gpt-oss-20b')
})
