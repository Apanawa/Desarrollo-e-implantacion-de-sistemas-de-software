import {
  EXAMPLE,
  REFERENCE,
  estimate,
  format,
  money,
  MODES,
  SOURCE_URL,
} from '../lib/cocomo'
import type { EstimateInput } from '../lib/cocomo'

export function WorkedExample({
  onLoad,
}: {
  onLoad: (input: EstimateInput) => void
}) {
  const result = estimate(EXAMPLE)
  return (
    <div className="learning-layout">
      <section className="panel lesson">
        <p className="eyebrow">CASO PRÁCTICO / PROYECTO HIPOTÉTICO</p>
        <h2>Una ToDoList para trabajar en equipo.</h2>
        <p>
          Aplicación web para administrar tareas, proyectos, responsables y
          fechas de entrega. El tamaño es un supuesto académico, no una medición
          del proyecto existente.
        </p>
        <h3>1. Delimitar el alcance</h3>
        <p>
          Incluye acceso de usuarios, espacios de trabajo, tareas, filtros,
          reportes y persistencia. Se supone un equipo familiarizado con la
          tecnología y requisitos estables: modo <strong>orgánico</strong>.
        </p>
        <h3>2. Estimar el tamaño</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>LOC estimadas</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Interfaz y navegación', 2000],
                ['API de tareas y proyectos', 2500],
                ['Autenticación y permisos', 1000],
                ['Persistencia y acceso a datos', 1000],
                ['Filtros y reportes', 1500],
              ].map(([name, size]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{Number(size).toLocaleString('es-MX')}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>Total</td>
                <td>8,000 LOC = 8 KLOC</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3>3. Aplicar COCOMO básico</h3>
        <p className="equation">
          E = 2.4 × 8<sup>1.05</sup> = {format(result.effort)} personas-mes
        </p>
        <p className="equation">
          T = 2.5 × E<sup>0.38</sup> = {format(result.duration)} meses
        </p>
        <p className="equation">
          P = E / T = {format(result.team)} personas equivalentes
        </p>
        <h3>4. Estimar el costo</h3>
        <p>
          Con un costo supuesto de $35,000 MXN por persona-mes:{' '}
          <strong>{money(result.cost)} MXN</strong>. Es costo laboral;
          infraestructura, impuestos y contingencias se presupuestan aparte.
        </p>
        <h3>5. Interpretar el resultado</h3>
        <p>
          El modelo sugiere aproximadamente 8 meses y un equipo promedio de 2.67
          personas equivalentes. Un punto de partida de planeación sería cerca
          de 3 personas; redondear el equipo no garantiza el plazo ni
          redistribuye automáticamente las tareas.
        </p>
        <button className="primary" onClick={() => onLoad(EXAMPLE)}>
          Explorar este proyecto <span>↗</span>
        </button>
      </section>
      <aside className="lesson-aside">
        <p className="eyebrow">RESULTADO DEL CASO</p>
        <strong>{format(result.effort)}</strong>
        <p>personas-mes</p>
        <hr />
        <p>
          Una persona-mes representa el trabajo de una persona a tiempo completo
          durante un mes.
        </p>
        <p>
          COCOMO básico es una aproximación inicial. El tamaño supuesto y la
          elección del modo afectan el resultado.
        </p>
      </aside>
    </div>
  )
}

export function Validation({
  onLoad,
}: {
  onLoad: (input: EstimateInput) => void
}) {
  const reference = estimate(REFERENCE)
  const controls = [
    {
      input: { ...EXAMPLE, size: 10 },
      expectedEffort: 26.928442903,
      expectedDuration: 8.738165793,
    },
    {
      input: REFERENCE,
      expectedEffort: 145.508790385,
      expectedDuration: 14.287335376,
    },
    {
      input: { ...EXAMPLE, mode: 'embedded' as const, size: 100 },
      expectedEffort: 904.279115343,
      expectedDuration: 22.077851553,
    },
  ]
  return (
    <div className="validation-layout">
      <section className="class-status">
        <span className="status-dot" />
        <div>
          <h2>Material de tu clase: pendiente</h2>
          <p>
            Para comprobar los ejercicios exactos hace falta el PDF o sus
            enunciados. Los casos siguientes son referencias externas y
            controles numéricos; no se presentan como ejercicios de tu clase.
          </p>
        </div>
      </section>
      <section className="panel lesson">
        <p className="eyebrow">REFERENCIA ACADÉMICA EXTERNA</p>
        <h2>32 KLOC · modo semiacoplado</h2>
        <p>
          El ejemplo de la diapositiva 16 de{' '}
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            INF 111, University of California, Irvine ↗
          </a>{' '}
          presenta un proyecto de 32,000 instrucciones de código. Su solución
          aproximada es 146 personas-mes y 14 meses.
        </p>
        <div className="reference-results">
          <div>
            <span>Esfuerzo calculado</span>
            <strong>
              {format(reference.effort)} <small>PM</small>
            </strong>
          </div>
          <div>
            <span>Duración calculada</span>
            <strong>
              {format(reference.duration)} <small>meses</small>
            </strong>
          </div>
          <div>
            <span>Comparación</span>
            <strong className="pass">Coincide</strong>
          </div>
        </div>
        <p className="muted small">
          Al redondear al entero más cercano: 146 PM y 14 meses. La aplicación
          conserva precisión completa durante las operaciones; las
          aproximaciones de productividad y personal de la diapositiva usan
          redondeos intermedios.
        </p>
        <button className="primary" onClick={() => onLoad(REFERENCE)}>
          Cargar ejercicio de referencia <span>↗</span>
        </button>
      </section>
      <section className="panel lesson">
        <p className="eyebrow">COMPROBACIÓN NUMÉRICA</p>
        <h2>Tres modos, tres casos de control</h2>
        <p className="muted small">
          Valores esperados calculados por separado con aritmética decimal de 40
          dígitos. Tolerancia absoluta: 0.000001.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Modo / KLOC</th>
                <th>Esfuerzo esperado</th>
                <th>Esfuerzo obtenido</th>
                <th>Meses esperados</th>
                <th>Meses obtenidos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {controls.map((control) => {
                const actual = estimate(control.input)
                const passed =
                  Math.abs(actual.effort - control.expectedEffort) < 0.000001 &&
                  Math.abs(actual.duration - control.expectedDuration) <
                    0.000001
                return (
                  <tr key={control.input.mode}>
                    <td>
                      {MODES[control.input.mode].label} / {control.input.size}
                    </td>
                    <td>{format(control.expectedEffort, 6)}</td>
                    <td>{format(actual.effort, 6)}</td>
                    <td>{format(control.expectedDuration, 6)}</td>
                    <td>{format(actual.duration, 6)}</td>
                    <td>
                      <span className={passed ? 'pass' : 'fail'}>
                        {passed ? 'Correcto' : 'Revisar'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel lesson">
        <h2>Coeficientes del modelo básico</h2>
        <p>
          E = a × KLOC<sup>b</sup> &nbsp; · &nbsp; T = c × E<sup>d</sup>
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Modo</th>
                <th>a</th>
                <th>b</th>
                <th>c</th>
                <th>d</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(MODES).map((mode) => (
                <tr key={mode.label}>
                  <td>{mode.label}</td>
                  <td>{mode.a}</td>
                  <td>{mode.b}</td>
                  <td>{mode.c}</td>
                  <td>{mode.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="field-hint">
          COCOMO 81 básico. No se aplica un factor EAF ni los coeficientes del
          modelo intermedio o COCOMO II.
        </p>
      </section>
    </div>
  )
}
