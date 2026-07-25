export const UMA_DEFAULT = 117.31
export const UMA_VIGENCIA = '1 de febrero de 2026'
export const UMA_MIN = 250
export const UMA_MAX = 5000
export const PROBABLE_UMA_DEFAULT = 1000
export const PROBABLE_UMA_MIN = 1000
export const PROBABLE_UMA_MAX = 1500

export type Tier = 'le15' | '16to50' | 'gt50'
export type Nature = 'center' | 'worker' | 'exposed'

export type NumeralId =
  | '5.1'
  | '5.2'
  | '5.3'
  | '5.4'
  | '5.5'
  | '5.6'
  | '5.7'
  | '5.8'

export interface NumeralDef {
  id: NumeralId
  title: string
  description: string
  nature: Nature
  /** Default: can user override nature to per-worker? */
  natureToggleable?: boolean
  tiers: Tier[]
}

export const NUMERALS: NumeralDef[] = [
  {
    id: '5.1',
    title: 'Política de prevención',
    description: 'Establecer, implantar y difundir la política de prevención de riesgos psicosociales.',
    nature: 'center',
    tiers: ['le15', '16to50', 'gt50'],
  },
  {
    id: '5.2',
    title: 'Identificar y analizar factores',
    description: 'Identificar y analizar los factores de riesgo psicosocial (cuestionario, 7.1-a y 7.2).',
    nature: 'worker',
    tiers: ['16to50'],
  },
  {
    id: '5.3',
    title: 'Factores + entorno organizacional',
    description: 'Identificar/analizar factores y evaluar el entorno organizacional (7.1-b, 7.2 y 7.3).',
    nature: 'worker',
    tiers: ['gt50'],
  },
  {
    id: '5.4',
    title: 'Medidas de prevención y control',
    description: 'Adoptar medidas de prevención y control según resultados.',
    nature: 'center',
    natureToggleable: true,
    tiers: ['16to50', 'gt50'],
  },
  {
    id: '5.5',
    title: 'Acontecimientos traumáticos severos',
    description: 'Identificar a trabajadores sujetos a acontecimientos traumáticos severos (ATS).',
    nature: 'exposed',
    tiers: ['le15', '16to50', 'gt50'],
  },
  {
    id: '5.6',
    title: 'Exámenes médicos / evaluaciones',
    description: 'Practicar exámenes médicos o evaluaciones psicológicas a los expuestos.',
    nature: 'exposed',
    tiers: ['le15', '16to50', 'gt50'],
  },
  {
    id: '5.7',
    title: 'Difusión de política y resultados',
    description: 'Difundir la política y los resultados a los trabajadores.',
    nature: 'center',
    tiers: ['le15', '16to50', 'gt50'],
  },
  {
    id: '5.8',
    title: 'Registros',
    description: 'Llevar los registros de resultados y medidas de control.',
    nature: 'center',
    tiers: ['16to50', 'gt50'],
  },
]

export const LEGAL = {
  formula: 'Art. 992 LFT',
  range: 'Art. 994, fracción V LFT',
  uma: 'Art. 992 LFT',
  reincidencia: 'Art. 992 LFT',
  nom: 'NOM-035-STPS-2018, numeral 5',
} as const

export const AUDANTRA_COST_DEFAULT = 180_000

/** Nota al pie del escenario techo (interpretación máxima Art. 992). */
export const TECHO_FOOTNOTE =
  'El techo asume que cada obligación afecta a todos los trabajadores (Art. 992), interpretación máxima.'
