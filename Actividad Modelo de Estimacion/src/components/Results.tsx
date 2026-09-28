import { estimate, format, money, MODES } from '../lib/cocomo'
import type { Estimate, EstimateInput } from '../lib/cocomo'

export default function Results({
  input,
  result,
}: {
  input: EstimateInput
  result: Estimate
}) {
  const mode = MODES[input.mode]
  const scenarios = [0.8, 1, 1.2].map((factor) => {
    const size = Math.min(10000, Math.max(0.001, result.kloc * factor))
    return { factor, size, result: estimate({ ...input, size, unit: 'KLOC' }) }
  })
  return (
    <div className="results-stack">
      <section className="hero-result" aria-labelledby="effort-title">
        <div className="section-label">
          <span>02 / TU ESTIMACIÓN</span>
          <span className="live-tag">
            <i /> EN VIVO
          </span>
        </div>
        <h2 id="effort-title">Esfuerzo de desarrollo</h2>
        <div className="effort-value">
          {format(result.effort)}
          <span>personas-mes</span>
        </div>
        <div className="hero-bottom">
          <span>{input.name}</span>
          <span>
            {format(result.kloc, 3)} KLOC · {mode.label}
          </span>
        </div>
        <svg className="hero-art" viewBox="0 0 240 160" aria-hidden="true">
          <path d="M0 150H240M0 110H240M0 70H240M0 30H240M40 0V160M90 0V160M140 0V160M190 0V160" />
          <path className="curve" d="M5 145C70 145 145 120 225 15" />
          <circle cx="155" cy="89" r="6" />
        </svg>
      </section>
      <div className="metrics" aria-label="Resultados de la estimación">
        <article className="metric">
          <span className="metric-icon" aria-hidden="true">
            ◷
          </span>
          <p>Duración estimada</p>
          <strong>
            {format(result.duration)} <small>meses</small>
          </strong>
          <span>
            T = 2.5 × E<sup>{mode.d}</sup>
          </span>
        </article>
        <article className="metric">
          <span className="metric-icon" aria-hidden="true">
            ♧
          </span>
          <p>Equipo promedio</p>
          <strong>
            {format(result.team)} <small>personas</small>
          </strong>
          <span>Equivalentes de tiempo completo</span>
        </article>
        <article className="metric cost-metric">
          <span className="metric-icon" aria-hidden="true">
            ＄
          </span>
          <p>Costo de trabajo</p>
          <strong>{money(result.cost)}</strong>
          <span>MXN · esfuerzo × costo mensual</span>
        </article>
      </div>
      <section className="panel calculation">
        <div className="section-label">
          <span>EL CÁLCULO, PASO A PASO</span>
          <span className="badge">COCOMO 81</span>
        </div>
        <h2>De los datos a la estimación</h2>
        <ol className="formula-list">
          <li>
            <span>Esfuerzo</span>
            <code>
              {mode.a} × {format(result.kloc, 3)}
              <sup>{mode.b}</sup> = <b>{format(result.effort)} PM</b>
            </code>
          </li>
          <li>
            <span>Duración</span>
            <code>
              2.5 × {format(result.effort)}
              <sup>{mode.d}</sup> = <b>{format(result.duration)} meses</b>
            </code>
          </li>
          <li>
            <span>Equipo</span>
            <code>
              {format(result.effort)} / {format(result.duration)} ={' '}
              <b>{format(result.team)} personas</b>
            </code>
          </li>
          <li>
            <span>Productividad</span>
            <code>
              {format(result.kloc * 1000, 0)} / {format(result.effort)} ={' '}
              <b>{format(result.productivity)} LOC/PM</b>
            </code>
          </li>
        </ol>
        <p className="field-hint">
          PM = persona-mes. Las operaciones usan precisión completa; los valores
          visibles están redondeados. El equipo promedio no equivale a una
          plantilla fija.
        </p>
      </section>
      <section className="panel sensitivity">
        <div className="section-label">
          <span>EXPLORA LOS SUPUESTOS</span>
          <span aria-hidden="true">±</span>
        </div>
        <h2>¿Y si cambia el tamaño?</h2>
        <p className="muted small">
          Compara tres escenarios. No es un intervalo estadístico de confianza.
        </p>
        <div className="scenario-chart">
          {scenarios.map((s) => (
            <div
              className={`scenario ${s.factor === 1 ? 'baseline' : ''}`}
              key={s.factor}
            >
              <div className="bar-track">
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(8, (s.result.effort / scenarios[2].result.effort) * 100)}%`,
                  }}
                >
                  <span>{format(s.result.effort)} PM</span>
                </div>
              </div>
              <strong>
                {s.factor === 1
                  ? 'Base'
                  : s.factor < 1
                    ? '−20% de tamaño'
                    : '+20% de tamaño'}
              </strong>
              <small>
                {format(s.size, 3)} KLOC · {format(s.result.duration)} meses
              </small>
            </div>
          ))}
        </div>
        <p className="field-hint">
          Los escenarios se limitan al rango admitido de 0.001 a 10,000 KLOC.
        </p>
      </section>
    </div>
  )
}
