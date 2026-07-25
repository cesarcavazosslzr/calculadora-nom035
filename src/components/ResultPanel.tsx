import { motion } from 'framer-motion'
import { LEGAL } from '../lib/constants'
import type { CalculatorInput, FullResult } from '../lib/engine'
import { tierLabel } from '../lib/engine'
import { formatMxn } from '../lib/format'
import { AnimatedAmount } from './AnimatedAmount'

interface Props {
  input: CalculatorInput
  result: FullResult
}

export function ResultPanel({ input, result }: Props) {
  const { piso, probable, techo } = result
  const max = Math.max(techo.total, 1)
  const probablePct = Math.min(100, (probable.total / max) * 100)
  const hasLines = probable.centers.some((c) => c.lines.length > 0)

  return (
    <aside className="results">
      <motion.div
        className="panel result-hero"
        layout
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        <p className="label">Exposición que evitas al cumplir</p>
        <p className="amount">
          <AnimatedAmount value={probable.total} />
        </p>
        <p className="caption">
          Escenario <strong>probable</strong> — el número defendible. Cumplir reduce esta
          contingencia a ~0.
        </p>

        <div className="range-block">
          <div className="range-track" aria-hidden>
            <div className="range-fill" style={{ width: '100%', opacity: 0.55 }} />
            <div className="range-marker" style={{ left: `${probablePct}%` }} />
          </div>
          <div className="range-labels">
            <div>
              Piso
              <strong>{formatMxn(piso.total)}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              Techo legal
              <strong>{formatMxn(techo.total)}</strong>
            </div>
          </div>
        </div>

        <div className="scenario-grid">
          <div className="scenario-chip">
            <small>Piso</small>
            <b>{formatMxn(piso.total)}</b>
          </div>
          <div className="scenario-chip featured">
            <small>Probable</small>
            <b>{formatMxn(probable.total)}</b>
          </div>
          <div className="scenario-chip">
            <small>Techo</small>
            <b>{formatMxn(techo.total)}</b>
          </div>
        </div>

        <div className="actions-bar">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              const { downloadReport } = await import('../lib/pdf')
              downloadReport(input, result)
            }}
            disabled={!hasLines}
          >
            Descargar PDF
          </button>
          <a
            className="btn btn-ghost"
            href="https://audantra.com"
            target="_blank"
            rel="noreferrer"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.18)' }}
          >
            Cumplir con Audantra →
          </a>
        </div>
      </motion.div>

      <div className="panel breakdown">
        <h3>Desglose auditable</h3>
        <p className="sub">
          Cada peso con fórmula y fundamento · {LEGAL.formula} / {LEGAL.range}
        </p>

        {!hasLines && (
          <div className="empty-state">
            Marca al menos un numeral incumplido para ver el desglose.
          </div>
        )}

        {probable.centers.map((center) => (
          <div key={center.center.id} style={{ marginBottom: 8 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 14 }}>
                {center.center.name}
              </strong>
              <span className="tier-pill">{tierLabel(center.tier)}</span>
            </div>

            {center.lines.map((line) => (
              <div className="line" key={`${center.center.id}-${line.numeral}`}>
                <div className="num">{line.numeral}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{line.title}</div>
                  <p className="meta">
                    {line.formula}
                    <br />
                    {line.legalBasis}
                  </p>
                </div>
                <div className="amt">{formatMxn(line.amount)}</div>
              </div>
            ))}

            {center.reincidenciaApplied && (
              <p className="meta" style={{ color: 'var(--amber-tx)', fontWeight: 600 }}>
                Reincidencia ×2 aplicada en este escenario · {LEGAL.reincidencia}
              </p>
            )}

            <div className="line" style={{ borderTop: '1px solid var(--line)' }}>
              <div />
              <div style={{ fontWeight: 700 }}>Subtotal centro</div>
              <div className="amt">{formatMxn(center.withReincidencia)}</div>
            </div>
          </div>
        ))}

        <div className="legal-strip">
          <span>UMA, no salario mínimo</span>
          <span>Por trabajador afectado</span>
          <span>Infracciones independientes</span>
        </div>
      </div>

      <div className="panel roi-box">
        <div className="roi-row">
          <span>Costo estimado de cumplir (Audantra)</span>
          <strong>{formatMxn(input.audantraCost)}</strong>
        </div>
        <div className="roi-row">
          <span>Exposición probable evitada</span>
          <strong>{formatMxn(probable.total)}</strong>
        </div>
        {probable.roiMultiple !== null && probable.total > 0 && (
          <div className="roi-highlight">
            Cumplir multiplica ~{probable.roiMultiple.toFixed(1)}× el valor de la inversión en
            compliance frente a la contingencia probable.
          </div>
        )}
        {probable.indirectTotal > 0 && (
          <div className="roi-row" style={{ marginTop: 6, color: 'var(--ink-muted)' }}>
            <span>Costos asociados (aparte del cálculo legal)</span>
            <strong>{formatMxn(probable.indirectTotal)}</strong>
          </div>
        )}
      </div>

      <div className="disclaimer">
        <strong>Disclaimer.</strong> Estimación con fines informativos; no constituye asesoría
        legal. El monto real lo determina la autoridad conforme a los criterios del Art. 992 LFT
        (intencionalidad, gravedad, daños, capacidad económica y reincidencia). UMA vigente
        parametrizable — actualizar cada febrero.
      </div>
    </aside>
  )
}
