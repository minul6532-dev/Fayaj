export class ChatApiError extends Error {
  constructor(message, status = 0, code = '') {
    super(message)
    this.name = 'ChatApiError'
    this.status = status
    this.code = code
  }
}

function isChatPayload(value) {
  return value?.success === true && typeof value.message === 'string' && value.message.trim().length > 0
}

export async function postChatMessage(endpoints, request, fetcher = fetch) {
  let lastError
  const uniqueEndpoints = [...new Set(endpoints.filter(Boolean))]

  for (const [index, endpoint] of uniqueEndpoints.entries()) {
    let response
    try {
      response = await fetcher(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: request.signal,
        body: JSON.stringify({ message: request.message, history: request.history }),
      })
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      lastError = error
      continue
    }

    let data
    try {
      data = await response.json()
    } catch {
      lastError = new ChatApiError('The chat service returned an invalid response.', response.status)
      const shouldTryFallback = response.status === 404 || response.status >= 500 || response.ok
      if (shouldTryFallback && index < uniqueEndpoints.length - 1) continue
      throw lastError
    }

    if (response.ok && isChatPayload(data)) return data

    lastError = new ChatApiError(
      typeof data?.error === 'string' && data.error.trim()
        ? data.error
        : 'The chat service returned an invalid response.',
      response.status,
      typeof data?.code === 'string' ? data.code : '',
    )
    const shouldTryFallback = response.status === 404 || response.status >= 500 || (response.ok && !isChatPayload(data))
    if (!shouldTryFallback || index === uniqueEndpoints.length - 1) throw lastError
  }

  throw lastError || new ChatApiError('The chat service is unavailable.')
}
