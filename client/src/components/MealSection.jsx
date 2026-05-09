import { useState } from 'react'
import { useDeleteFood, useMoveFood, useCopyMeal } from '../hooks/useDailyLog.js'

const mealEmojis = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎'
}

const mealColors = {
  breakfast: 'var(--warning)',
  lunch: 'var(--success)',
  dinner: 'var(--purple)',
  snack: 'var(--error)'
}

const meals = ['breakfast', 'lunch', 'dinner', 'snack']

export default function MealSection({ meal, entries = [], totals, date, onAddClick }) {
  const deleteFood = useDeleteFood(date)
  const moveFood = useMoveFood(date)
  const copyMeal = useCopyMeal(date)

  const [movingEntry, setMovingEntry] = useState(null)
  const [showCopyConfirm, setShowCopyConfirm] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const isEmpty = entries.length === 0

  const handleMove = (id, newMeal) => {
    moveFood.mutate({ id, meal: newMeal })
    setMovingEntry(null)
  }

  const handleCopy = () => {
    copyMeal.mutate({ meal }, {
      onSuccess: () => {
        setShowCopyConfirm(false)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 800)
      },
      onError: () => {
        setShowCopyConfirm(false)
        setCopySuccess(false)
        setTimeout(() => setCopyError(false), 2000)
      }
    })
  }

  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      marginBottom: '12px'
    }}>
      {/* Meal header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: isEmpty ? 'none' : '1px solid var(--border)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{mealEmojis[meal]}</span>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            textTransform: 'capitalize'
          }}>
            {meal}
          </span>
          {!isEmpty && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {entries.length} item{entries.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Meal totals */}
          {!isEmpty && (
            <div style={{
              display: 'flex',
              gap: '8px',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}>
              <span style={{ fontWeight: '500', color: mealColors[meal] }}>
                {Math.round(totals.calories)} cal
              </span>
              <span>{Math.round(totals.protein * 10) / 10}g protein</span>
              <span>{Math.round(totals.carbs * 10) / 10}g carbs</span>
              <span>{Math.round(totals.fat * 10) / 10}g fat</span>
            </div>
          )}

          {/* Copy from yesterday button */}
          <button
            onClick={() => !copySuccess && !copyError && setShowCopyConfirm(true)}
            title="Copy from yesterday"
            style={{
              background: copySuccess 
                ? 'var(--success)' 
                : copyError 
                  ? 'rgba(226,75,74,0.1)' 
                  : 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              cursor: 'pointer',
              color: copySuccess 
                ? 'white' 
                : copyError 
                  ? 'var(--error)' 
                  : 'var(--text-muted)',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            {copySuccess 
              ? '✓ Copied!' 
              : copyError 
                ? '✗ Nothing to copy' 
                : <>📋 <span className="icon-label">Copy</span></>
            }
          </button>
        </div>
      </div>

      {/* Copy from yesterday confirmation */}
      {showCopyConfirm && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            Copy yesterday's {meal} to today?
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              disabled={copyMeal.isPending}
              style={{
                padding: '5px 12px',
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {copyMeal.isPending ? 'Copying...' : 'Yes, copy'}
            </button>
            <button
              onClick={() => setShowCopyConfirm(false)}
              style={{
                padding: '5px 12px',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Food entries */}
      {entries.map(entry => (
        <div
          key={entry.id}
          style={{
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
          }}>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '2px'
              }}>
                {entry.foodName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {entry.servingSize}{entry.servingUnit} · {entry.calories} cal · {entry.protein}g protein · {entry.carbs}g carbs · {entry.fat}g fat
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* Move button */}
              <button
                onClick={() => setMovingEntry(movingEntry === entry.id ? null : entry.id)}
                title="Move to another meal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: movingEntry === entry.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '14px',
                  padding: '4px'
                }}
              >
                ↕ <span className='icon-label'>Move Food</span>
              </button>

              {/* Delete button */}
              <button
                onClick={() => deleteFood.mutate(entry.id)}
                disabled={deleteFood.isPending}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '16px',
                  padding: '4px'
                }}
              >
                🗑
              </button>
            </div>
          </div>

          {/* Move meal picker — shows inline when ↕ clicked */}
          {movingEntry === entry.id && (
            <div style={{
              padding: '8px 16px 12px',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border)'
            }}>
              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginBottom: '8px'
              }}>
                Move to:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {meals.filter(m => m !== meal).map(m => (
                  <button
                    key={m}
                    onClick={() => handleMove(entry.id, m)}
                    disabled={moveFood.isPending}
                    style={{
                      padding: '5px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {mealEmojis[m]} {m}
                  </button>
                ))}
                <button
                  onClick={() => setMovingEntry(null)}
                  style={{
                    padding: '5px 12px',
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add food button */}
      <button
        onClick={() => onAddClick(meal)}
        style={{
          width: '100%',
          padding: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '12px',
          textAlign: 'center',
          borderTop: isEmpty ? 'none' : '1px solid var(--border)'
        }}
      >
        + Add {meal}
      </button>
    </div>
  )
}