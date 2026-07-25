import { PROBABLE_UMA_MAX, PROBABLE_UMA_MIN, UMA_VIGENCIA } from './lib/constants'
import { useCalculator } from './hooks/useCalculator'
import { CenterEditor } from './components/CenterEditor'
import { ResultPanel } from './components/ResultPanel'
import { formatMxn } from './lib/format'
import audantraLogo from './assets/audantra-logo.png'

export default function App() {
  const calc = useCalculator()
  const { input, result } = calc

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="https://audantra.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Audantra — Legal tech · NOM-035"
        >
          <img
            className="brand-logo"
            src={audantraLogo}
            alt=""
            width={160}
            height={35}
          />
          <span className="brand-sub" aria-hidden="true">
            Legal tech · NOM-035
          </span>
        </a>
        <div className="topbar-actions">
          <a className="btn btn-ghost btn-sm" href="https://audantra.com" target="_blank" rel="noreferrer">
            audantra.com
          </a>
          <a className="btn btn-primary btn-sm" href="https://audantra.com" target="_blank" rel="noreferrer">
            Diagnóstico gratis
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">
          <i />
          Calculadora de sanciones evitadas · Art. 992 / 994-V LFT
        </div>
        <h1>
          Audantra mide tu <em>exposición</em> NOM-035
        </h1>
        <p className="hero-lede">
          Cuantifica la contingencia que evitas al cumplir — con tres escenarios, desglose por
          numeral y fundamento legal. Sin números inflados: encabezamos con el escenario
          probable.
        </p>
      </section>

      <div className="layout">
        <div className="inputs">
          <div className="panel">
            <section className="section">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Paso 1</p>
                  <h2>Parámetros legales</h2>
                  <p className="hint">UMA y factor del escenario probable</p>
                </div>
              </div>

              <div className="grid-2">
                <div className="field">
                  <div className="field-row">
                    <label htmlFor="uma">UMA diaria vigente</label>
                    <span className="value">${input.uma.toFixed(2)}</span>
                  </div>
                  <input
                    id="uma"
                    type="number"
                    step="0.01"
                    min={1}
                    value={input.uma}
                    onChange={(e) => calc.updateUma(Number(e.target.value) || 0)}
                  />
                  <p className="hint" style={{ margin: 0 }}>
                    Vigencia: {UMA_VIGENCIA}. Actualizar cada febrero.
                  </p>
                </div>

                <div className="field">
                  <div className="field-row">
                    <label htmlFor="factor">Factor probable (UMA)</label>
                    <span className="value">{input.probableFactor.toLocaleString('es-MX')}</span>
                  </div>
                  <input
                    id="factor"
                    className="slider"
                    type="range"
                    min={PROBABLE_UMA_MIN}
                    max={PROBABLE_UMA_MAX}
                    step={50}
                    value={input.probableFactor}
                    onChange={(e) => calc.updateProbableFactor(Number(e.target.value))}
                  />
                  <p className="hint" style={{ margin: 0 }}>
                    Rango defendible: {PROBABLE_UMA_MIN.toLocaleString('es-MX')}–
                    {PROBABLE_UMA_MAX.toLocaleString('es-MX')} UMA
                  </p>
                </div>
              </div>

              <div className="toggle" style={{ marginTop: 8 }}>
                <div>
                  <span>¿Reincidencia? (duplica en escenario probable)</span>
                  <p className="hint" style={{ margin: '2px 0 0' }}>
                    El techo legal siempre aplica ×2. El piso, nunca.
                  </p>
                </div>
                <label className="switch" aria-label="Activar reincidencia">
                  <input
                    type="checkbox"
                    checked={input.reincidencia}
                    onChange={(e) => calc.updateReincidencia(e.target.checked)}
                    aria-label="Reincidencia"
                  />
                  <span className="track" />
                </label>
              </div>
            </section>

            <section className="section">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Paso 2</p>
                  <h2>Centros de trabajo</h2>
                  <p className="hint">
                    Cada centro se sanciona por separado. El tamaño precarga los numerales
                    aplicables.
                  </p>
                </div>
                <button type="button" className="btn btn-soft btn-sm" onClick={calc.addCenter}>
                  + Centro
                </button>
              </div>

              {input.centers.map((center) => (
                <CenterEditor
                  key={center.id}
                  center={center}
                  canRemove={input.centers.length > 1}
                  onUpdate={(patch) => calc.updateCenter(center.id, patch)}
                  onToggle={(n) => calc.toggleBreach(center.id, n)}
                  onNature={(n, nature) => calc.setNatureOverride(center.id, n, nature)}
                  onRemove={() => calc.removeCenter(center.id)}
                  onSelectAll={() => calc.selectAllBreaches(center.id)}
                  onClear={() => calc.clearBreaches(center.id)}
                />
              ))}
            </section>

            <section className="section">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Paso 3 · opcional</p>
                  <h2>Costos asociados</h2>
                  <p className="hint">
                    Se muestran aparte. Nunca se suman al número legal principal.
                  </p>
                </div>
              </div>
              <p className="indirect-note">
                Estimaciones internas de impacto operativo — no son sanciones LFT.
              </p>
              <div className="grid-2">
                {(
                  [
                    ['suspension', 'Paro / suspensión'],
                    ['legal', 'Honorarios legales'],
                    ['remediation', 'Remediación urgente'],
                    ['turnover', 'Rotación / ausentismo'],
                  ] as const
                ).map(([key, label]) => (
                  <div className="field" key={key}>
                    <label htmlFor={key}>{label}</label>
                    <input
                      id={key}
                      type="number"
                      min={0}
                      step={1000}
                      value={input.indirectCosts[key] || ''}
                      placeholder="0"
                      onChange={(e) =>
                        calc.updateIndirect(key, Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="section">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Comparativo</p>
                  <h2>Costo de cumplir con Audantra</h2>
                  <p className="hint">
                    Editable — úsalo para contrastar inversión vs. exposición evitada.
                  </p>
                </div>
              </div>
              <div className="field">
                <div className="field-row">
                  <label htmlFor="audantra">Inversión anual estimada</label>
                  <span className="value">{formatMxn(input.audantraCost)}</span>
                </div>
                <input
                  id="audantra"
                  type="number"
                  min={0}
                  step={1000}
                  value={input.audantraCost}
                  onChange={(e) =>
                    calc.updateAudantraCost(Math.max(0, Number(e.target.value) || 0))
                  }
                />
              </div>
            </section>
          </div>
        </div>

        <ResultPanel input={input} result={result} />
      </div>

      <footer className="footer">
        <span>
          © {new Date().getFullYear()} Audantra · Estimación informativa basada en UMA, Art. 992
          y 994-V LFT, NOM-035-STPS-2018
        </span>
        <a href="https://audantra.com" target="_blank" rel="noreferrer">
          audantra.com
        </a>
      </footer>
    </div>
  )
}
