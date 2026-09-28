import { convertSize, MODES } from '../lib/cocomo'
import type { Mode, Unit } from '../lib/cocomo'

export interface FormValues {
  name: string
  size: string
  unit: Unit
  mode: Mode
  monthlyRate: string
}
interface Props {
  values: FormValues
  onChange: (next: FormValues) => void
  onReset: () => void
}

export default function EstimateForm({ values, onChange, onReset }: Props) {
  return (
    <section className="input-panel panel" aria-labelledby="parameters-title">
      <div className="section-label">
        <span>01 / CONFIGURACIÓN</span>
        <span aria-hidden="true">↗</span>
      </div>
      <h2 id="parameters-title">Define tu proyecto</h2>
      <p className="muted small">
        Modifica los datos. La estimación se actualiza al instante.
      </p>
      <div className="field">
        <label htmlFor="project-name">Nombre del proyecto</label>
        <input
          id="project-name"
          maxLength={100}
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="project-size">Tamaño estimado</label>
        <div className="size-input">
          <input
            id="project-size"
            type="number"
            min={values.unit === 'LOC' ? 1 : 0.001}
            max={values.unit === 'LOC' ? 10000000 : 10000}
            step={values.unit === 'LOC' ? 1 : 0.001}
            value={values.size}
            onChange={(e) => onChange({ ...values, size: e.target.value })}
          />
          <select
            aria-label="Unidad de tamaño"
            value={values.unit}
            onChange={(e) => {
              const unit = e.target.value as Unit
              const size =
                values.size.trim() && Number.isFinite(Number(values.size))
                  ? String(
                      convertSize(Number(values.size), values.unit, unit),
                    )
                  : values.size
              onChange({ ...values, unit, size })
            }}
          >
            <option value="KLOC">KLOC</option>
            <option value="LOC">LOC</option>
          </select>
        </div>
        <p className="field-hint">1 KLOC = 1,000 líneas de código entregado.</p>
      </div>
      <fieldset className="mode-field">
        <legend>Modo de desarrollo</legend>
        {Object.entries(MODES).map(([key, mode]) => (
          <label
            className={`mode-option ${values.mode === key ? 'selected' : ''}`}
            key={key}
          >
            <input
              type="radio"
              name="mode"
              value={key}
              checked={values.mode === key}
              onChange={() => onChange({ ...values, mode: key as Mode })}
            />
            <span>
              <strong>{mode.label}</strong>
              <small>{mode.description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="field">
        <label htmlFor="monthly-rate">
          Costo por persona al mes <span>MXN</span>
        </label>
        <input
          id="monthly-rate"
          type="number"
          min="0"
          max="10000000"
          step="0.01"
          value={values.monthlyRate}
          onChange={(e) => onChange({ ...values, monthlyRate: e.target.value })}
        />
        <p className="field-hint">
          Supuesto de costo laboral, sin gastos adicionales.
        </p>
      </div>
      <button className="reset-button" onClick={onReset}>
        ↺ Restablecer ejemplo
      </button>
    </section>
  )
}
