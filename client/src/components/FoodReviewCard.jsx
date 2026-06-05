import { useState } from 'react'

export default function FoodReviewCard({ food, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [servings, setServings] = useState(1)
  const [baseValues] = useState({
    servingSize: food.servingSize,
    calories:    food.calories,
    protein:     food.protein,
    carbs:       food.carbs,
    fat:         food.fat
  })

  const handleServingsChange = (newServings) => {
    setServings(newServings)
    onUpdate('servingSize', Math.round(baseValues.servingSize * newServings * 10) / 10)
    onUpdate('calories',    Math.round(baseValues.calories    * newServings))
    onUpdate('protein',     Math.round(baseValues.protein     * newServings * 10) / 10)
    onUpdate('carbs',       Math.round(baseValues.carbs       * newServings * 10) / 10)
    onUpdate('fat',         Math.round(baseValues.fat         * newServings * 10) / 10)
  }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      marginBottom: '10px'
    }}>
      {/* Food name row */}
      <div style={{
        padding: '10px 12px',
        background: 'var(--bg-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        {editing ? (
          <input
            value={food.foodName}
            onChange={(e) => onUpdate('foodName', e.target.value)}
            style={{
              flex: 1,
              padding: '4px 8px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: '500',
              marginRight: '8px'
            }}
          />
        ) : (
          <span style={{
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            {food.foodName}
          </span>
        )}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setEditing(prev => !prev)}
            style={{
              background: editing ? 'var(--accent)' : 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 8px',
              cursor: 'pointer',
              fontSize: '11px',
              color: editing ? 'var(--accent-text)' : 'var(--text-muted)'
            }}
          >
            {editing ? 'Done' : '✏️ Edit'}
          </button>
          <button
            onClick={onRemove}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 8px',
              cursor: 'pointer',
              fontSize: '11px',
              color: 'var(--error)'
            }}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Servings multiplier */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap'
        }}>
          Servings:
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => handleServingsChange(Math.max(0.5, Math.round((servings - 0.5) * 10) / 10))}
            style={{
              padding: '5px 10px',
              background: 'var(--bg-secondary)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            −
          </button>
          <input
            type="number"
            value={servings}
            onChange={(e) => handleServingsChange(Math.max(0.5, Number(e.target.value)))}
            onFocus={(e) => e.target.select()}
            min="0.5"
            step="0.5"
            style={{
              width: '45px',
              padding: '5px 4px',
              border: 'none',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: '600',
              textAlign: 'center'
            }}
          />
          <button
            onClick={() => handleServingsChange(Math.round((servings + 0.5) * 10) / 10)}
            style={{
              padding: '5px 10px',
              background: 'var(--bg-secondary)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            +
          </button>
        </div>
        <span style={{
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          {servings === 1 ? '1 serving' : `${servings} servings`}
        </span>
      </div>

      {/* Macros row */}
      <div style={{
        padding: '10px 12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px'
      }}>
        {[
          { label: 'Serving', field: 'servingSize', color: 'var(--text-primary)' },
          { label: 'Cal',     field: 'calories',    color: 'var(--error)' },
          { label: 'Protein', field: 'protein',     color: 'var(--success)' },
          { label: 'Carbs',   field: 'carbs',       color: 'var(--warning)' },
          { label: 'Fat',     field: 'fat',         color: 'var(--purple)' }
        ].map(macro => (
          <div key={macro.field} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '4px'
            }}>
              {macro.label}
            </div>
            {editing ? (
              <input
                type="number"
                value={food[macro.field]}
                onChange={(e) => onUpdate(macro.field, e.target.value)}
                onFocus={(e) => e.target.select()}
                style={{
                  width: '100%',
                  padding: '4px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  color: macro.color,
                  fontSize: '13px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}
              />
            ) : (
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: macro.color
              }}>
                {food[macro.field]}
                {macro.field === 'servingSize' && (
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    marginLeft: '2px'
                  }}>
                    {food.servingUnit}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}