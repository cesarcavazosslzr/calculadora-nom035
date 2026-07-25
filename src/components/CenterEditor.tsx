import { NUMERALS, type Nature, type NumeralId } from '../lib/constants'
import {
  applicableNumerals,
  getTier,
  tierLabel,
  type CenterInput,
} from '../lib/engine'

interface Props {
  center: CenterInput
  canRemove: boolean
  onUpdate: (patch: Partial<CenterInput>) => void
  onToggle: (numeral: NumeralId) => void
  onNature: (numeral: NumeralId, nature: Nature | null) => void
  onRemove: () => void
  onSelectAll: () => void
  onClear: () => void
}

function natureLabel(n: Nature): string {
  if (n === 'center') return 'De centro'
  if (n === 'exposed') return 'Expuestos'
  return 'Por trabajador'
}

export function CenterEditor({
  center,
  canRemove,
  onUpdate,
  onToggle,
  onNature,
  onRemove,
  onSelectAll,
  onClear,
}: Props) {
  const tier = getTier(center.workers)
  const applicable = applicableNumerals(tier)

  return (
    <div className="center-block">
      <div className="center-head">
        <div>
          <h3>
            <input
              type="text"
              value={center.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              aria-label="Nombre del centro"
              style={{
                border: 'none',
                background: 'transparent',
                font: 'inherit',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                padding: 0,
                width: '100%',
                maxWidth: 220,
              }}
            />
          </h3>
          <span className="tier-pill" style={{ marginTop: 6 }}>
            Tier {tierLabel(tier)} · {applicable.length} numerales aplicables
          </span>
        </div>
        {canRemove && (
          <button type="button" className="btn btn-sm btn-danger" onClick={onRemove}>
            Quitar
          </button>
        )}
      </div>

      <div className="grid-2">
        <div className="field">
          <div className="field-row">
            <label htmlFor={`workers-${center.id}`}>Trabajadores</label>
            <span className="value">{center.workers}</span>
          </div>
          <input
            id={`workers-${center.id}`}
            className="slider"
            type="range"
            min={1}
            max={500}
            value={center.workers}
            onChange={(e) => onUpdate({ workers: Number(e.target.value) })}
          />
          <input
            type="number"
            min={1}
            max={50000}
            value={center.workers}
            onChange={(e) =>
              onUpdate({ workers: Math.max(1, Number(e.target.value) || 1) })
            }
            aria-label="Número exacto de trabajadores"
          />
        </div>

        <div className="field">
          <div className="field-row">
            <label htmlFor={`exposed-${center.id}`}>Expuestos a ATS</label>
            <span className="value">{center.exposedWorkers}</span>
          </div>
          <input
            id={`exposed-${center.id}`}
            className="slider"
            type="range"
            min={0}
            max={center.workers}
            value={Math.min(center.exposedWorkers, center.workers)}
            onChange={(e) => onUpdate({ exposedWorkers: Number(e.target.value) })}
          />
          <p className="hint" style={{ margin: 0 }}>
            Aplica a numerales 5.5 y 5.6
          </p>
        </div>
      </div>

      <div className="chip-row">
        <button type="button" className="btn btn-sm btn-soft" onClick={onSelectAll}>
          Marcar todos
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onClear}>
          Limpiar
        </button>
      </div>

      <div className="numeral-list">
        {applicable.map((def) => {
          const on = center.breached.includes(def.id)
          const nature = center.natureOverrides[def.id] ?? def.nature
          const full = NUMERALS.find((n) => n.id === def.id)!
          return (
            <div key={def.id}>
              <button
                type="button"
                className={`numeral ${on ? 'on' : ''}`}
                onClick={() => onToggle(def.id)}
                aria-pressed={on}
              >
                <span className="check" aria-hidden>
                  ✓
                </span>
                <span>
                  <span className="code">Numeral {def.id}</span>
                  <div className="title">{def.title}</div>
                  <p className="desc">{def.description}</p>
                </span>
                <span className="tag">{natureLabel(nature)}</span>
              </button>
              {on && full.natureToggleable && (
                <div className="nature-toggle" style={{ marginLeft: 48, marginBottom: 4 }}>
                  <button
                    type="button"
                    className={nature === 'center' ? 'on' : ''}
                    onClick={() => onNature(def.id, 'center')}
                  >
                    De centro
                  </button>
                  <button
                    type="button"
                    className={nature === 'worker' ? 'on' : ''}
                    onClick={() => onNature(def.id, 'worker')}
                  >
                    Por trabajador
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
