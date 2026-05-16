/**
 * JOBFLOW — Executive Global Benchmark Engine v5.0
 * Production-grade 8-Phase competitive analysis
 * 
 * v5.0 Changes:
 * - Uses aiProviders.ts for multi-provider support (Gemini + OpenAI)
 * - JSON extraction inside retry loop (no more silent parse failures)
 * - 5s inter-phase cooldown (increased from 3s)
 * - Adaptive cooldown: doubles after rate-limited phase
 * - Provider-agnostic — works with either or both API keys
 */

import { callAIAndParse, type AIProviderConfig } from './aiProviders'
import { phase1Prompt, phase2Prompt, phase3Prompt, phase4Prompt, phase5Prompt, phase6Prompt, phase7Prompt, phase8Prompt } from './benchmarkPrompts'

const DOCLING_API = 'http://localhost:8001'
const BASE_COOLDOWN_MS = 5000

/* ═══ TYPES ═══════════════════════════════════════════ */

export interface BenchmarkInput {
  cvText: string
  jobDescription: string
  jobUrl?: string
  candidateName?: string
}

export interface CategoryScore { category: string; weight: number; score: number; justification: string }
export interface Phase1Result { overallScore: number; categories: CategoryScore[]; strategicJustification: string }
export interface Phase2Result { fortune100: string; bigTech: string; tier1Consulting: string; ipoMa: string; globalExecs: string; marketPosition: string; explanation: string }
export interface Phase3Result { differentiators: string[]; isCommodity: string; isReplaceable: string; top3Strengths: string[]; weaknessesVsCompetitors: string[] }
export interface RiskItem { area: string; severity: string; detail: string }
export interface Phase4Result { risks: RiskItem[] }
export interface Phase5Result { repositioningPlan: string[]; keyChanges: string[] }
export interface Phase6Result { winProbability: number; estimatedRanking: string; competitivenessLevel: string; summary: string }
export interface Phase7Result { rewrittenCV: string; highlights: string[] }
export interface Phase8Result { newScore: number; gaps: Array<{ area: string; suggestion: string; isMock: boolean }>; finalVerdict: string }
export interface BenchmarkResult { phase1?: Phase1Result; phase2?: Phase2Result; phase3?: Phase3Result; phase4?: Phase4Result; phase5?: Phase5Result; phase6?: Phase6Result; phase7?: Phase7Result; phase8?: Phase8Result }

/* ═══ UTILITIES ═══════════════════════════════════════ */

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

/* ═══ JOB URL SCRAPING ════════════════════════════════ */

export async function scrapeJobUrl(url: string): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const r = await fetch(`${DOCLING_API}/api/convert-url`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
    if (!r.ok) return { success: false, error: `Docling retornou ${r.status}. Cole a descrição manualmente.` }
    const data = await r.json()
    const text = data.markdown || data.text || ''
    return text.length > 50 ? { success: true, text } : { success: false, error: 'Conteúdo insuficiente. Cole manualmente.' }
  } catch { return { success: false, error: 'Docling offline. Cole a descrição manualmente.' } }
}

/* ═══ PHASE RUNNERS (using callAIAndParse) ════════════ */

export async function runPhase1(config: AIProviderConfig, input: BenchmarkInput): Promise<Phase1Result> {
  return callAIAndParse(phase1Prompt(input.cvText, input.jobDescription), config)
}
export async function runPhase2(config: AIProviderConfig, input: BenchmarkInput, p1: Phase1Result): Promise<Phase2Result> {
  return callAIAndParse(phase2Prompt(input.cvText, input.jobDescription, p1.overallScore), config)
}
export async function runPhase3(config: AIProviderConfig, input: BenchmarkInput): Promise<Phase3Result> {
  return callAIAndParse(phase3Prompt(input.cvText, input.jobDescription), config)
}
export async function runPhase4(config: AIProviderConfig, input: BenchmarkInput): Promise<Phase4Result> {
  return callAIAndParse(phase4Prompt(input.cvText, input.jobDescription), config)
}
export async function runPhase5(config: AIProviderConfig, input: BenchmarkInput, p4: Phase4Result): Promise<Phase5Result> {
  const risksStr = p4.risks.map(r => `${r.area}: ${r.severity} — ${r.detail}`).join('\n')
  return callAIAndParse(phase5Prompt(input.cvText, input.jobDescription, risksStr), config)
}
export async function runPhase6(config: AIProviderConfig, input: BenchmarkInput, p1: Phase1Result): Promise<Phase6Result> {
  return callAIAndParse(phase6Prompt(input.cvText, input.jobDescription, p1.overallScore), config)
}
export async function runPhase7(config: AIProviderConfig, input: BenchmarkInput, p5: Phase5Result): Promise<Phase7Result> {
  return callAIAndParse(phase7Prompt(input.cvText, input.jobDescription, p5.keyChanges), config)
}
export async function runPhase8(config: AIProviderConfig, input: BenchmarkInput, p7: Phase7Result): Promise<Phase8Result> {
  return callAIAndParse(phase8Prompt(p7.rewrittenCV, input.jobDescription), config)
}

/* ═══ ORCHESTRATOR ════════════════════════════════════ */

export type PhaseStatus = 'pending' | 'running' | 'complete' | 'error'
export interface PhaseProgress { phase: number; name: string; status: PhaseStatus; error?: string }

export const PHASE_NAMES = [
  'Market Positioning Score',
  'Benchmark Comparativo',
  'Análise de Distintividade',
  'Riscos de Posicionamento',
  'Reposicionamento Estratégico',
  'Probabilidade de Dominância',
  'CV Premium Rewrite',
  'Re-Avaliação & Gaps',
]

export async function runFullBenchmark(
  config: AIProviderConfig, input: BenchmarkInput,
  onProgress: (phases: PhaseProgress[], result: BenchmarkResult) => void,
): Promise<BenchmarkResult> {
  const result: BenchmarkResult = {}
  const phases: PhaseProgress[] = PHASE_NAMES.map((name, i) => ({ phase: i + 1, name, status: 'pending' as PhaseStatus }))
  let cooldownMs = BASE_COOLDOWN_MS
  let lastPhaseHadRateLimit = false

  const update = (idx: number, status: PhaseStatus, error?: string) => {
    phases[idx].status = status
    if (error) phases[idx].error = error
    onProgress([...phases], { ...result })
  }

  const run = async <T>(idx: number, fn: () => Promise<T>): Promise<T | null> => {
    update(idx, 'running')
    try {
      const r = await fn()
      update(idx, 'complete')
      lastPhaseHadRateLimit = false
      return r
    } catch (e: any) {
      const errorMsg = e.message || 'Erro desconhecido'
      update(idx, 'error', errorMsg)
      // Detect rate limiting to adapt cooldown
      if (errorMsg.includes('429') || errorMsg.includes('503') || errorMsg.includes('rate') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        lastPhaseHadRateLimit = true
      }
      return null
    }
  }

  const cooldown = async (phaseNum: number) => {
    // Adaptive cooldown: double if previous phase hit rate limits
    const actualCooldown = lastPhaseHadRateLimit ? cooldownMs * 2 : cooldownMs
    if (lastPhaseHadRateLimit) {
      console.log(`[Benchmark] ⚠️ Previous phase hit rate limits. Extended cooldown: ${Math.round(actualCooldown / 1000)}s before Phase ${phaseNum}`)
    } else {
      console.log(`[Benchmark] ⏳ Cooldown ${Math.round(actualCooldown / 1000)}s before Phase ${phaseNum}...`)
    }
    await sleep(actualCooldown)
  }

  const providers = []
  if (config.geminiApiKey) providers.push('Gemini')
  if (config.openaiApiKey) providers.push('OpenAI')
  console.log(`[Benchmark] ═══ Starting 8-Phase Executive Benchmark ═══`)
  console.log(`[Benchmark] Providers: ${providers.join(' → ')} | Cooldown: ${BASE_COOLDOWN_MS}ms | Adaptive: ON`)

  // Phase 1
  result.phase1 = await run(0, () => runPhase1(config, input)) || undefined
  if (!result.phase1) {
    console.error('[Benchmark] Phase 1 failed. Aborting.')
    return result
  }

  await cooldown(2)
  result.phase2 = await run(1, () => runPhase2(config, input, result.phase1!)) || undefined

  await cooldown(3)
  result.phase3 = await run(2, () => runPhase3(config, input)) || undefined

  await cooldown(4)
  result.phase4 = await run(3, () => runPhase4(config, input)) || undefined

  await cooldown(5)
  if (result.phase4) {
    result.phase5 = await run(4, () => runPhase5(config, input, result.phase4!)) || undefined
  } else {
    update(4, 'error', 'Fase 4 falhou — dependência não disponível')
  }

  await cooldown(6)
  result.phase6 = await run(5, () => runPhase6(config, input, result.phase1!)) || undefined

  await cooldown(7)
  if (result.phase5) {
    result.phase7 = await run(6, () => runPhase7(config, input, result.phase5!)) || undefined
  } else {
    update(6, 'error', 'Fase 5 falhou — dependência não disponível')
  }

  await cooldown(8)
  if (result.phase7) {
    result.phase8 = await run(7, () => runPhase8(config, input, result.phase7!)) || undefined
  } else {
    update(7, 'error', 'Fase 7 falhou — dependência não disponível')
  }

  console.log('[Benchmark] ═══ Benchmark Complete ═══')
  console.log('[Benchmark] Results:', Object.keys(result).filter(k => result[k as keyof BenchmarkResult]).join(', '))

  return result
}
