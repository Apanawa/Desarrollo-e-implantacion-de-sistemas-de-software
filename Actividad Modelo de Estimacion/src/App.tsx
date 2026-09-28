import { useState } from 'react'
import EstimateForm from './components/EstimateForm'
import type { FormValues } from './components/EstimateForm'
import Results from './components/Results'
import { Validation, WorkedExample } from './components/Learning'
import { estimate, EXAMPLE, makeReport, SOURCE_URL } from './lib/cocomo'
import type { Estimate, EstimateInput } from './lib/cocomo'

type Page = 'estimate' | 'example' | 'validation'
const initialValues = (input: EstimateInput): FormValues => ({
  ...input,
  size: String(input.size),
  monthlyRate: String(input.monthlyRate),
})

export default function App() {
  const [page, setPage] = useState<Page>('estimate')
  const [values, setValues] = useState<FormValues>(initialValues(EXAMPLE))
  const [notice, setNotice] = useState('')
  const input: EstimateInput = {
    ...values,
    size: values.size.trim() ? Number(values.size) : NaN,
    monthlyRate: values.monthlyRate.trim() ? Number(values.monthlyRate) : NaN,
  }
  let result: Estimate | null = null
  let error = ''
  try {
    result = estimate(input)
  } catch (caught) {
    error =
      caught instanceof Error
        ? caught.message
        : 'Revisa los datos del proyecto.'
  }

  function load(input: EstimateInput) {
    setValues(initialValues(input))
    setPage('estimate')
    setNotice('Ejemplo cargado. Puedes modificar sus supuestos.')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function download() {
    if (!result) return
    const url = URL.createObjectURL(
      new Blob([makeReport(input, result)], {
        type: 'text/markdown;charset=utf-8',
      }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'estimacion-cocomo.md'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Reporte Markdown generado.')
  }
  const titles = {
    estimate: (
      <>
        Dale dimensión a tu
        <br />
        <em>próximo proyecto.</em>
      </>
    ),
    example: (
      <>
        Una idea, una estimación.
        <br />
        <em>Un caso paso a paso.</em>
      </>
    ),
    validation: (
      <>
        Las cifras también
        <br />
        <em>se comprueban.</em>
      </>
    ),
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <a className="brand" href="./" aria-label="Estima, inicio">
          <span className="brand-mark" aria-hidden="true">
            ▥
          </span>
          estima<span>.</span>
        </a>
        <div className="sidebar-label">ESPACIO DE TRABAJO</div>
        <nav aria-label="Navegación principal">
          {(
            [
              { id: 'estimate', icon: '◫', label: 'Estimador' },
              { id: 'example', icon: '▤', label: 'Ejemplo resuelto' },
              { id: 'validation', icon: '✓', label: 'Validación' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={page === item.id ? 'nav-item active' : 'nav-item'}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => {
                setPage(item.id)
                setNotice('')
              }}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
              <span className="nav-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="tiny-label">EL MÉTODO</span>
          <h2>COCOMO 81</h2>
          <p>Modelo básico para estimar el trabajo detrás del software.</p>
          <span className="method-pill">3 modos de desarrollo</span>
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" /> Herramienta académica
          <span>Desarrollo de software · 2026</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            ACTIVIDAD <span>/</span> MODELO DE ESTIMACIÓN
          </div>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            Referencia del modelo ↗
          </a>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <p className="eyebrow">PLANEA CON FUNDAMENTO</p>
              <h1>{titles[page]}</h1>
              <p className="intro">
                Convierte el tamaño de tu software en esfuerzo, tiempo y
                recursos.
              </p>
            </div>
            {page === 'estimate' && (
              <button
                className="export-button"
                onClick={download}
                disabled={!result}
              >
                ↓ Descargar reporte
              </button>
            )}
          </div>
          <div className="notice" role="status">
            {notice}
          </div>
          {page === 'estimate' && (
            <div className="estimator-layout">
              <EstimateForm
                values={values}
                onChange={(next) => {
                  setValues(next)
                  setNotice('')
                }}
                onReset={() => load(EXAMPLE)}
              />
              {result ? (
                <Results input={input} result={result} />
              ) : (
                <section className="invalid-result panel" role="alert">
                  <span aria-hidden="true">!</span>
                  <h2>Revisa los datos del proyecto</h2>
                  <p>{error}</p>
                  <p className="muted">
                    Los resultados aparecerán cuando los datos sean válidos.
                  </p>
                </section>
              )}
            </div>
          )}
          {page === 'example' && <WorkedExample onLoad={load} />}
          {page === 'validation' && <Validation onLoad={load} />}
          <footer>
            <span>ESTIMA / COCOMO 81 BÁSICO</span>
            <p>
              Una estimación orienta la planeación. Su precisión depende de los
              supuestos del proyecto.
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
