export const MODES = {
  organic: {
    label: 'Orgánico',
    a: 2.4,
    b: 1.05,
    c: 2.5,
    d: 0.38,
    description: 'Equipo familiarizado con el dominio y requisitos estables.',
  },
  semi: {
    label: 'Semiacoplado',
    a: 3,
    b: 1.12,
    c: 2.5,
    d: 0.35,
    description: 'Experiencia mixta y complejidad intermedia del proyecto.',
  },
  embedded: {
    label: 'Empotrado',
    a: 3.6,
    b: 1.2,
    c: 2.5,
    d: 0.32,
    description: 'Restricciones estrictas de hardware, operación o interfaces.',
  },
} as const

export type Mode = keyof typeof MODES
export type Unit = 'KLOC' | 'LOC'

export function convertSize(size: number, from: Unit, to: Unit): number {
  if (from === to) return size
  // Elimina ruido binario al convertir, por ejemplo, 1.001 KLOC a 1001 LOC.
  return to === 'LOC' ? Number((size * 1000).toFixed(9)) : size / 1000
}

export interface EstimateInput {
  name: string
  size: number
  unit: Unit
  mode: Mode
  monthlyRate: number
}
export interface Estimate {
  kloc: number
  effort: number
  duration: number
  team: number
  cost: number
  productivity: number
}

export function estimate(input: EstimateInput): Estimate {
  if (!Object.hasOwn(MODES, input.mode))
    throw new Error('Selecciona un modo válido.')
  if (input.unit !== 'KLOC' && input.unit !== 'LOC')
    throw new Error('Selecciona LOC o KLOC.')
  if (!input.name.trim() || input.name.trim().length > 100)
    throw new Error('Escribe un nombre de 1 a 100 caracteres.')
  const kloc = input.unit === 'LOC' ? input.size / 1000 : input.size
  if (!Number.isFinite(kloc) || kloc < 0.001 || kloc > 10000)
    throw new Error(
      'El tamaño debe estar entre 1 y 10,000,000 LOC (0.001 a 10,000 KLOC).',
    )
  if (input.unit === 'LOC' && !Number.isInteger(input.size))
    throw new Error('Las líneas de código (LOC) deben ser un número entero.')
  if (
    !Number.isFinite(input.monthlyRate) ||
    input.monthlyRate < 0 ||
    input.monthlyRate > 10000000
  )
    throw new Error('El costo mensual debe estar entre 0 y 10,000,000 MXN.')
  const { a, b, c, d } = MODES[input.mode]
  const effort = a * kloc ** b
  const duration = c * effort ** d
  return {
    kloc,
    effort,
    duration,
    team: effort / duration,
    cost: effort * input.monthlyRate,
    productivity: (kloc * 1000) / effort,
  }
}

export const EXAMPLE: EstimateInput = {
  name: 'ToDoList colaborativa',
  size: 8,
  unit: 'KLOC',
  mode: 'organic',
  monthlyRate: 35000,
}
export const REFERENCE: EstimateInput = {
  name: 'Ejercicio de referencia · UCI',
  size: 32,
  unit: 'KLOC',
  mode: 'semi',
  monthlyRate: 0,
}
export const SOURCE_URL =
  'https://ics.uci.edu/~michele/Teaching/INF111-Sum08/Slides/INF%20111%20-%20SET%2010-6up.pdf'

export const format = (value: number, digits = 2) =>
  new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
export const money = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(value)

export function makeReport(input: EstimateInput, result: Estimate): string {
  const mode = MODES[input.mode]
  return `# Estimación COCOMO 81 básico\n\nProyecto: ${input.name.replace(/[\r\n]/g, ' ')}\n\nModo: ${mode.label}\nTamaño: ${format(result.kloc, 3)} KLOC\nCosto mensual por persona: ${money(input.monthlyRate)} MXN\n\n## Resultados\n\n- Esfuerzo: ${format(result.effort)} personas-mes.\n- Duración: ${format(result.duration)} meses.\n- Equipo promedio equivalente: ${format(result.team)} personas.\n- Costo de trabajo: ${money(result.cost)} MXN.\n- Productividad: ${format(result.productivity)} LOC/persona-mes.\n\n## Fórmulas\n\nE = ${mode.a} × ${result.kloc}^${mode.b} = ${format(result.effort)} personas-mes\nT = ${mode.c} × E^${mode.d} = ${format(result.duration)} meses\nP = E / T = ${format(result.team)} personas\nCosto = E × ${input.monthlyRate} = ${money(result.cost)} MXN\n\nSe conserva precisión completa en las operaciones; solo se redondea la presentación. El equipo es una media equivalente, no una asignación fija. El costo excluye infraestructura, impuestos y contingencias. La estimación depende del tamaño supuesto; no es una garantía de plazo.\n\nReferencia de fórmulas: ${SOURCE_URL}\n\nValidación con material específico de clase: pendiente de recibir sus ejercicios.\n`
}
