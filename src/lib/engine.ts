import {
  LEGAL,
  NUMERALS,
  PROBABLE_UMA_DEFAULT,
  UMA_MAX,
  UMA_MIN,
  type Nature,
  type NumeralDef,
  type NumeralId,
  type Tier,
} from './constants'

export type ScenarioKey = 'piso' | 'probable' | 'techo'

export interface CenterInput {
  id: string
  name: string
  workers: number
  exposedWorkers: number
  /** Numerales marcados como incumplidos */
  breached: NumeralId[]
  /** Overrides: forzar por trabajador (true) o de centro (false) */
  natureOverrides: Partial<Record<NumeralId, Nature>>
}

export interface CalculatorInput {
  uma: number
  probableFactor: number
  reincidencia: boolean
  centers: CenterInput[]
  indirectCosts: {
    suspension: number
    legal: number
    remediation: number
    turnover: number
  }
  audantraCost: number
}

export interface LineItem {
  numeral: NumeralId
  title: string
  factorUma: number
  affected: number
  amount: number
  nature: Nature
  legalBasis: string
  formula: string
}

export interface CenterResult {
  center: CenterInput
  tier: Tier
  applicable: NumeralDef[]
  lines: LineItem[]
  subtotal: number
  withReincidencia: number
  reincidenciaApplied: boolean
}

export interface ScenarioResult {
  key: ScenarioKey
  label: string
  description: string
  centers: CenterResult[]
  total: number
  indirectTotal: number
  grandWithIndirect: number
  roiMultiple: number | null
}

export interface FullResult {
  piso: ScenarioResult
  probable: ScenarioResult
  techo: ScenarioResult
}

export function getTier(workers: number): Tier {
  if (workers <= 15) return 'le15'
  if (workers <= 50) return '16to50'
  return 'gt50'
}

export function tierLabel(tier: Tier): string {
  if (tier === 'le15') return '≤15 trabajadores'
  if (tier === '16to50') return '16–50 trabajadores'
  return '>50 trabajadores'
}

export function applicableNumerals(tier: Tier): NumeralDef[] {
  return NUMERALS.filter((n) => n.tiers.includes(tier))
}

/**
 * Al cruzar 16–50 ↔ >50, 5.2 y 5.3 son equivalentes funcionales
 * (identificación/análisis de factores). Auto-mapea para no perder la marca.
 */
export function remapBreachesForTier(
  breached: NumeralId[],
  fromTier: Tier,
  toTier: Tier,
): NumeralId[] {
  if (fromTier === toTier) return breached

  let next = [...breached]

  if (fromTier === '16to50' && toTier === 'gt50' && next.includes('5.2')) {
    next = next.filter((id) => id !== '5.2')
    if (!next.includes('5.3')) next.push('5.3')
  }

  if (fromTier === 'gt50' && toTier === '16to50' && next.includes('5.3')) {
    next = next.filter((id) => id !== '5.3')
    if (!next.includes('5.2')) next.push('5.2')
  }

  const allowed = new Set(applicableNumerals(toTier).map((n) => n.id))
  return next.filter((id) => allowed.has(id))
}

function resolveNature(
  def: NumeralDef,
  overrides: Partial<Record<NumeralId, Nature>>,
): Nature {
  return overrides[def.id] ?? def.nature
}

function affectedFor(
  nature: Nature,
  workers: number,
  exposed: number,
  scenario: ScenarioKey,
): number {
  if (scenario === 'piso') return 1
  if (scenario === 'techo') {
    // Techo legal: plantilla completa en toda obligación multiplicable
    if (nature === 'center') return workers
    return workers
  }
  if (nature === 'center') return 1
  if (nature === 'exposed') return Math.max(1, Math.min(exposed, workers))
  return workers
}

function factorFor(scenario: ScenarioKey, probableFactor: number): number {
  if (scenario === 'piso') return UMA_MIN
  if (scenario === 'techo') return UMA_MAX
  return probableFactor
}

function applyReincidencia(
  scenario: ScenarioKey,
  userToggle: boolean,
): boolean {
  if (scenario === 'piso') return false
  if (scenario === 'techo') return true
  return userToggle
}

function computeCenter(
  center: CenterInput,
  scenario: ScenarioKey,
  uma: number,
  probableFactor: number,
  reincidencia: boolean,
): CenterResult {
  const tier = getTier(center.workers)
  const applicable = applicableNumerals(tier)
  const factor = factorFor(scenario, probableFactor)
  const lines: LineItem[] = []

  for (const def of applicable) {
    if (!center.breached.includes(def.id)) continue
    const nature = resolveNature(def, center.natureOverrides)
    const affected = affectedFor(
      nature,
      center.workers,
      center.exposedWorkers,
      scenario,
    )
    const amount = factor * uma * affected
    lines.push({
      numeral: def.id,
      title: def.title,
      factorUma: factor,
      affected,
      amount,
      nature,
      legalBasis: `${LEGAL.range} · ${LEGAL.formula}`,
      formula: `${factor.toLocaleString('es-MX')} UMA × $${uma.toFixed(2)} × ${affected} trabajador${affected === 1 ? '' : 'es'}`,
    })
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0)
  const rein = applyReincidencia(scenario, reincidencia)
  const withReincidencia = rein ? subtotal * 2 : subtotal

  return {
    center,
    tier,
    applicable,
    lines,
    subtotal,
    withReincidencia,
    reincidenciaApplied: rein,
  }
}

function scenarioMeta(key: ScenarioKey): Pick<ScenarioResult, 'label' | 'description'> {
  if (key === 'piso') {
    return {
      label: 'Piso defendible',
      description:
        'Lo mínimo que la autoridad podría imponer solo por no tener los documentos (250 UMA × 1 por infracción).',
    }
  }
  if (key === 'techo') {
    return {
      label: 'Techo legal',
      description:
        'Máximo teórico: 5,000 UMA × plantilla en toda obligación × reincidencia. No es promesa.',
    }
  }
  return {
    label: 'Probable',
    description:
      'Escenario realista: factor medio, multiplicación por trabajador solo en obligaciones evaluativas. Primera visita.',
  }
}

function computeScenario(
  key: ScenarioKey,
  input: CalculatorInput,
): ScenarioResult {
  const centers = input.centers.map((c) =>
    computeCenter(c, key, input.uma, input.probableFactor, input.reincidencia),
  )
  const total = centers.reduce((s, c) => s + c.withReincidencia, 0)
  const indirectTotal =
    input.indirectCosts.suspension +
    input.indirectCosts.legal +
    input.indirectCosts.remediation +
    input.indirectCosts.turnover
  const roiMultiple =
    input.audantraCost > 0 ? total / input.audantraCost : null

  return {
    key,
    ...scenarioMeta(key),
    centers,
    total,
    indirectTotal,
    grandWithIndirect: total + indirectTotal,
    roiMultiple,
  }
}

export function calculate(input: CalculatorInput): FullResult {
  return {
    piso: computeScenario('piso', input),
    probable: computeScenario('probable', input),
    techo: computeScenario('techo', input),
  }
}

export function createDefaultCenter(
  index = 1,
  workers = 60,
): CenterInput {
  const applicable = applicableNumerals(getTier(workers)).map((n) => n.id)
  return {
    id: crypto.randomUUID(),
    name: `Centro ${index}`,
    workers,
    exposedWorkers: Math.max(1, Math.round(workers * 0.1)),
    breached: applicable.slice(0, 3),
    natureOverrides: {},
  }
}

export function createDefaultInput(): CalculatorInput {
  return {
    uma: 117.31,
    probableFactor: PROBABLE_UMA_DEFAULT,
    reincidencia: false,
    centers: [createDefaultCenter(1, 60)],
    indirectCosts: {
      suspension: 0,
      legal: 0,
      remediation: 0,
      turnover: 0,
    },
    audantraCost: 180_000,
  }
}

/** Quick sanity check against the worked example in the concept doc. */
export function verifyWorkedExample(): {
  piso: number
  probable: number
  techo: number
} {
  const input = createDefaultInput()
  input.centers = [
    {
      id: 'ex',
      name: 'Ejemplo',
      workers: 60,
      exposedWorkers: 6,
      breached: ['5.1', '5.3', '5.4'],
      natureOverrides: {},
    },
  ]
  const r = calculate(input)
  return {
    piso: r.piso.total,
    probable: r.probable.total,
    techo: r.techo.total,
  }
}
