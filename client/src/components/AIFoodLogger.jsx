import { useState } from 'react'
import { useAIFoodLog } from '../hooks/useAIFoodLog.js'
import { useQueryClient } from '@tanstack/react-query'
import FoodReviewCard from './FoodReviewCard.jsx'

const mealEmojis = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎'
}

export default function AIFoodLogger({ date, onClose }) {
  const queryClient = useQueryClient()
  const [selectedMeal, setSelectedMeal] = useState('breakfast')

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['summary', date] })
    queryClient.refetchQueries({ queryKey: ['summary', date] })
    onClose()
  }

  const {
    step, description, setDescription,
    parsedFoods, error,
    parse, updateFood, removeFood, confirmAll, reset
  } = useAIFoodLog(date, onSuccess)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)'
        }}>
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              🤖 Log with ChompAI
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '2px'
            }}>
              Describe what you ate in plain English
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '20px',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(226,75,74,0.1)',
              border: '1px solid var(--error)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--error)',
              fontSize: '13px',
              marginBottom: '12px'
            }}>
              {error}
            </div>
          )}

          {/* Step: typing or loading */}
          {(step === 'idle' || step === 'typing' || step === 'loading') && (
            <div>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                }}
                placeholder="e.g. 2 scrambled eggs, 2 stipes of bacon, and a black coffee"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  marginBottom: '12px',
                  fontFamily: 'inherit'
                }}
              />

              {/* Meal selector */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '8px'
                }}>
                  Log to:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => (
                    <button
                      key={meal}
                      onClick={() => setSelectedMeal(meal)}
                      style={{
                        padding: '6px 12px',
                        background: selectedMeal === meal
                          ? 'var(--accent)'
                          : 'var(--bg-secondary)',
                        color: selectedMeal === meal
                          ? 'var(--accent-text)'
                          : 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {mealEmojis[meal]} {meal}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={parse}
                disabled={step === 'loading' || description.trim().length < 2}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: description.trim().length < 2
                    ? 'var(--bg-secondary)'
                    : 'var(--accent)',
                  color: description.trim().length < 2
                    ? 'var(--text-muted)'
                    : 'var(--accent-text)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: step === 'loading' || description.trim().length < 2
                    ? 'not-allowed'
                    : 'pointer'
                }}
              >
                {step === 'loading' ? '🤖 Searching your food...' : '🤖 Search with ChompAI'}
              </button>
            </div>
          )}

          {/* Step: review */}
          {(step === 'review' || step === 'confirming') && (
            <div>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '12px'
              }}>
                Review and edit before logging to{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {mealEmojis[selectedMeal]} {selectedMeal}
                </strong>
              </div>

              {parsedFoods.map(food => (
                <FoodReviewCard
                  key={food.tempId}
                  food={food}
                  onUpdate={(field, value) => updateFood(food.tempId, field, value)}
                  onRemove={() => removeFood(food.tempId)}
                />
              ))}

              {parsedFoods.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}>
                  All entries removed. Go back and try again.
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px'
              }}>
                <button
                  onClick={reset}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                >
                  ← Try again
                </button>
                <button
                  onClick={() => confirmAll(selectedMeal)}
                  disabled={step === 'confirming' || parsedFoods.length === 0}
                  style={{
                    flex: 2,
                    padding: '10px',
                    background: parsedFoods.length === 0
                      ? 'var(--bg-secondary)'
                      : 'var(--accent)',
                    color: parsedFoods.length === 0
                      ? 'var(--text-muted)'
                      : 'var(--accent-text)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: step === 'confirming' || parsedFoods.length === 0
                      ? 'not-allowed'
                      : 'pointer'
                  }}
                >
                  {step === 'confirming'
                    ? 'Logging...'
                    : `✓ Log ${parsedFoods.length} item${parsedFoods.length !== 1 ? 's' : ''} to ${selectedMeal}`
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
