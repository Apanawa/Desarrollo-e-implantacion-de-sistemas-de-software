import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  convertSize,
  estimate,
  EXAMPLE,
  makeReport,
  MODES,
  REFERENCE,
} from '../src/lib/cocomo.ts'
import type { EstimateInput, Mode, Unit } from '../src/lib/cocomo.ts'

function near(actual: number, expected: number, tolerance = 1e-6) {
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `Esperado ${expected}; obtenido ${actual}`,
  )
}

test('caso práctico ToDoList: esfuerzo, meses, equipo, costo y productividad', () => {
  const result = estimate(EXAMPLE)
  near(result.effort, 21.303733864)
  near(result.duration, 7.993798289)
  near(result.team, 2.665032703)
  near(result.cost, 745630.685229592)
  near(result.productivity, 375.521026088)
})

test('control orgánico de 10 KLOC con valores calculados independientemente', () => {
  const result = estimate({ ...EXAMPLE, size: 10 })
  near(result.effort, 26.928442903)
  near(result.duration, 8.738165793)
})

test('referencia UCI: 32 KLOC semiacoplado, aproximadamente 146 PM y 14 meses', () => {
  const result = estimate(REFERENCE)
  near(result.effort, 145.508790385)
  near(result.duration, 14.287335376)
  assert.equal(Math.round(result.effort), 146)
  assert.equal(Math.round(result.duration), 14)
})

test('control empotrado de 100 KLOC con valores calculados independientemente', () => {
  const result = estimate({ ...EXAMPLE, mode: 'embedded', size: 100 })
  near(result.effort, 904.279115343)
  near(result.duration, 22.077851553)
})

test('LOC y KLOC equivalentes producen exactamente los mismos resultados', () => {
  assert.deepEqual(
    estimate({ ...EXAMPLE, size: 8000, unit: 'LOC' }),
    estimate(EXAMPLE),
  )
})

test('convertir LOC a KLOC y regresar conserva enteros sin ruido binario', () => {
  for (const loc of [1, 1001, 8000, 9999999, 10000000]) {
    assert.equal(convertSize(convertSize(loc, 'LOC', 'KLOC'), 'KLOC', 'LOC'), loc)
  }
  assert.equal(convertSize(1.001, 'KLOC', 'LOC'), 1001)
  assert.equal(convertSize(1.0015, 'KLOC', 'LOC'), 1001.5)
})

test('cada modo usa los coeficientes del modelo básico, no del intermedio', () => {
  for (const mode of Object.keys(MODES) as Mode[]) {
    near(
      estimate({ ...EXAMPLE, mode, size: 1 }).effort,
      { organic: 2.4, semi: 3, embedded: 3.6 }[mode],
    )
  }
})

test('duplicar la tarifa duplica únicamente el costo', () => {
  const base = estimate(EXAMPLE)
  const changed = estimate({ ...EXAMPLE, monthlyRate: EXAMPLE.monthlyRate * 2 })
  near(changed.cost, base.cost * 2)
  assert.equal(changed.effort, base.effort)
  assert.equal(changed.duration, base.duration)
  assert.equal(changed.team, base.team)
})

test('tarifa cero válida para ejercicios sin presupuesto', () => {
  const result = estimate({ ...EXAMPLE, monthlyRate: 0 })
  assert.equal(result.cost, 0)
  assert.ok(result.effort > 0)
})

test('rechaza campos vacíos, negativos, no finitos y valores fuera de rango', () => {
  const invalid: Partial<EstimateInput>[] = [
    { name: '' },
    { name: '   ' },
    { name: 'a'.repeat(101) },
    { size: 0 },
    { size: -1 },
    { size: NaN },
    { size: Infinity },
    { size: 10001 },
    { unit: 'LOC', size: 1.5 },
    { size: 0.0001 },
    { monthlyRate: -1 },
    { monthlyRate: NaN },
    { monthlyRate: Infinity },
    { monthlyRate: 10000001 },
    { mode: 'unknown' as Mode },
    { mode: '__proto__' as Mode },
    { unit: 'unknown' as Unit },
  ]
  for (const patch of invalid)
    assert.throws(() => estimate({ ...EXAMPLE, ...patch }))
})

test('los límites admitidos producen resultados finitos', () => {
  for (const mode of Object.keys(MODES) as Mode[]) {
    for (const size of [0.001, 10000]) {
      const result = estimate({ ...EXAMPLE, mode, size, monthlyRate: 10000000 })
      for (const value of Object.values(result))
        assert.ok(Number.isFinite(value) && value > 0)
    }
  }
})

test('incrementar el tamaño aumenta esfuerzo y duración en los tres modos', () => {
  for (const mode of Object.keys(MODES) as Mode[]) {
    const smaller = estimate({ ...EXAMPLE, mode, size: 8 })
    const larger = estimate({ ...EXAMPLE, mode, size: 9.6 })
    assert.ok(larger.effort > smaller.effort)
    assert.ok(larger.duration > smaller.duration)
  }
})

test('el reporte incluye resultados, unidades, fuente y estado real de validación', () => {
  const report = makeReport(EXAMPLE, estimate(EXAMPLE))
  assert.match(report, /ToDoList colaborativa/)
  assert.match(report, /21\.30 personas-mes/)
  assert.match(report, /7\.99 meses/)
  assert.match(report, /745,630\.69/)
  assert.match(report, /ics\.uci\.edu/)
  assert.match(report, /pendiente de recibir sus ejercicios/)
})
