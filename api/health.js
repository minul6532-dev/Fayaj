export default function handler(_request, response) {
  response.json({
    ok: true,
    service: 'irham-enterprise-api',
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
  })
}