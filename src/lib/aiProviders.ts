/**
 * JOBFLOW — AI Provider Abstraction Layer v1.0
 * 
 * Supports: Google Gemini (primary) + OpenAI/ChatGPT (fallback)
 * Strategy: Try Gemini first → on failure → try OpenAI
 * JSON extraction is INSIDE the retry loop to handle malformed responses
 * 
 * Rate limit handling:
 * - Exponential backoff with jitter (3s → 6s → 12s → 24s → 48s)
 * - 429/503 detection with extended wait
 * - Provider fallback on exhaustion
 */

/* ═══ CONFIG ═══════════════════════════════════════════ */

const GEMINI_PRIMARY_MODEL = 'gemini-2.5-flash'
const GEMINI_FALLBACK_MODEL = 'gemini-2.0-flash'
const OPENAI_MODEL = 'gpt-4o'
const MAX_RETRIES = 3
const BASE_DELAY_MS = 4000

/* ═══ TYPES ═══════════════════════════════════════════ */

export type AIProvider = 'gemini' | 'openai'

export interface AIProviderConfig {
  geminiApiKey?: string
  openaiApiKey?: string
  preferredProvider?: AIProvider
}

/* ═══ UTILITIES ═══════════════════════════════════════ */

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function getBackoffDelay(attempt: number): number {
  const exponential = BASE_DELAY_MS * Math.pow(2, attempt)
  const jitter = Math.random() * 2000
  return Math.min(exponential + jitter, 60000)
}

/* ═══ JSON EXTRACTION (ROBUST) ═══════════════════════ */

export function extractJSON(text: string): any {
  // Strategy 1: ```json code block
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1].trim()) } catch { /* next */ }
  }
  // Strategy 2: Raw JSON object
  const raw = text.match(/\{[\s\S]*\}/)
  if (raw) {
    try { return JSON.parse(raw[0]) } catch { /* next */ }
    // Fix common issues: trailing commas, single quotes
    try {
      const fixed = raw[0]
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/'/g, '"')
        .replace(/\n/g, '\\n')
      return JSON.parse(fixed)
    } catch { /* next */ }
  }
  // Strategy 3: Array
  const arr = text.match(/\[[\s\S]*\]/)
  if (arr) {
    try { return JSON.parse(arr[0]) } catch { /* next */ }
  }
  return null // Return null instead of throwing — caller decides
}

/* ═══ GEMINI PROVIDER ════════════════════════════════ */

async function callGeminiRaw(apiKey: string, prompt: string, model: string): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai')
  const client = new GoogleGenAI({ apiKey })
  const response = await client.models.generateContent({ model, contents: prompt })
  const text = response.text || ''
  if (text.length < 20) throw new Error('Empty response from Gemini')
  return text
}

/* ═══ OPENAI PROVIDER (fetch-based, no npm dep) ══════ */

async function callOpenAIRaw(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are an executive career strategist and C-level resume coach. Always respond with valid JSON only — no markdown, no explanations outside the JSON object.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    const code = response.status
    const msg = errBody?.error?.message || `HTTP ${code}`
    // Propagate rate limit info
    if (code === 429) throw Object.assign(new Error(`OpenAI rate limited: ${msg}`), { status: 429 })
    throw Object.assign(new Error(`OpenAI error [${code}]: ${msg}`), { status: code })
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''
  if (text.length < 20) throw new Error('Empty response from OpenAI')
  return text
}

/* ═══ UNIFIED AI CALL WITH RETRY + JSON EXTRACTION ═══ */

/**
 * callAIAndParse — The core function that:
 * 1. Tries the preferred provider with retries
 * 2. Falls back to alternate provider
 * 3. Extracts JSON from the response (INSIDE the retry loop)
 * 4. Returns parsed JSON object
 */
export async function callAIAndParse(prompt: string, config: AIProviderConfig): Promise<any> {
  // Build provider chain based on config
  type ProviderAttempt = { name: string; call: () => Promise<string> }
  const chain: ProviderAttempt[] = []

  const preferred = config.preferredProvider || 'gemini'

  if (preferred === 'gemini' && config.geminiApiKey) {
    chain.push({ name: `Gemini/${GEMINI_PRIMARY_MODEL}`, call: () => callGeminiRaw(config.geminiApiKey!, prompt, GEMINI_PRIMARY_MODEL) })
    chain.push({ name: `Gemini/${GEMINI_FALLBACK_MODEL}`, call: () => callGeminiRaw(config.geminiApiKey!, prompt, GEMINI_FALLBACK_MODEL) })
    if (config.openaiApiKey) {
      chain.push({ name: `OpenAI/${OPENAI_MODEL}`, call: () => callOpenAIRaw(config.openaiApiKey!, prompt) })
    }
  } else if (preferred === 'openai' && config.openaiApiKey) {
    chain.push({ name: `OpenAI/${OPENAI_MODEL}`, call: () => callOpenAIRaw(config.openaiApiKey!, prompt) })
    if (config.geminiApiKey) {
      chain.push({ name: `Gemini/${GEMINI_PRIMARY_MODEL}`, call: () => callGeminiRaw(config.geminiApiKey!, prompt, GEMINI_PRIMARY_MODEL) })
      chain.push({ name: `Gemini/${GEMINI_FALLBACK_MODEL}`, call: () => callGeminiRaw(config.geminiApiKey!, prompt, GEMINI_FALLBACK_MODEL) })
    }
  } else {
    // Use whatever key is available
    if (config.geminiApiKey) {
      chain.push({ name: `Gemini/${GEMINI_PRIMARY_MODEL}`, call: () => callGeminiRaw(config.geminiApiKey!, prompt, GEMINI_PRIMARY_MODEL) })
      chain.push({ name: `Gemini/${GEMINI_FALLBACK_MODEL}`, call: () => callGeminiRaw(config.geminiApiKey!, prompt, GEMINI_FALLBACK_MODEL) })
    }
    if (config.openaiApiKey) {
      chain.push({ name: `OpenAI/${OPENAI_MODEL}`, call: () => callOpenAIRaw(config.openaiApiKey!, prompt) })
    }
  }

  if (chain.length === 0) {
    throw new Error('Nenhuma chave de API configurada. Acesse Configurações para adicionar sua chave Gemini ou OpenAI.')
  }

  const allErrors: string[] = []

  for (const provider of chain) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[AI] ${provider.name} attempt ${attempt + 1}/${MAX_RETRIES + 1}`)
        const rawText = await provider.call()

        // JSON extraction INSIDE retry loop
        const parsed = extractJSON(rawText)
        if (!parsed) {
          console.warn(`[AI] ${provider.name}: response not valid JSON, retrying...`)
          if (attempt < MAX_RETRIES) {
            await sleep(2000)
            continue
          }
          throw new Error('JSON extraction failed after all attempts')
        }

        console.log(`[AI] ✅ ${provider.name} succeeded`)
        return parsed
      } catch (err: any) {
        const code = err?.status || err?.code || err?.httpStatusCode || 'UNKNOWN'
        const msg = err?.message || 'Unknown error'
        const errorStr = `${provider.name} [${code}] ${msg}`
        allErrors.push(errorStr)
        console.error(`[AI] ❌ ${errorStr}`)

        // Rate limit: extended backoff
        if (code === 429 || code === 503 || code === '429' || code === '503' ||
            msg.includes('429') || msg.includes('503') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('rate')) {
          if (attempt < MAX_RETRIES) {
            const delay = getBackoffDelay(attempt) * 1.5 // Extra wait for rate limits
            console.log(`[AI] ⏳ Rate limited. Waiting ${Math.round(delay / 1000)}s...`)
            await sleep(delay)
            continue
          }
          // Exhausted retries on this provider — skip to next provider immediately
          console.warn(`[AI] ⚠️ ${provider.name}: rate limit retries exhausted. Trying next provider...`)
          break
        }

        // Other errors: standard backoff
        if (attempt < MAX_RETRIES) {
          const delay = getBackoffDelay(attempt)
          console.log(`[AI] ⏳ Retrying in ${Math.round(delay / 1000)}s...`)
          await sleep(delay)
        }
      }
    }
  }

  throw new Error(`Todas as tentativas falharam em todos os provedores.\n\nDetalhes:\n${allErrors.join('\n')}`)
}
