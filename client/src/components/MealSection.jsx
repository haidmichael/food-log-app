import { useState } from 'react'
import { useDeleteFood, useCopyMeal, useUpdateFood } from '../hooks/useDailyLog.js'
import { useSaveAsMeal } from '../hooks/useSavedMeals.js'

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
  const updateFood = useUpdateFood(date)
  const copyMeal = useCopyMeal(date)
  const saveAsMeal = useSaveAsMeal()

  const [movingEntry, setMovingEntry] = useState(null)
  const [showCopyConfirm, setShowCopyConfirm] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [editServings, setEditServings] = useState(1)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const isEmpty = entries.length === 0

  const handleMove = (id, newMeal) => {
    updateFood.mutate({ id, meal: newMeal })
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

  const handleEditStart = (entry) => {
  setEditingEntry(entry.id)
  setEditServings(1)
  setEditValues({
    foodName:    entry.foodName,
    servingSize: entry.servingSize,
    servingUnit: entry.servingUnit,
    calories:    entry.calories,
    protein:     entry.protein,
    carbs:       entry.carbs,
    fat:         entry.fat
  })
}

const handleEditSave = (id) => {
  updateFood.mutate({
    id,
    foodName:    editValues.foodName,
    servingSize: Number(editValues.servingSize),
    servingUnit: editValues.servingUnit,
    calories:    Number(editValues.calories),
    protein:     Number(editValues.protein),
    carbs:       Number(editValues.carbs),
    fat:         Number(editValues.fat)
  }, {
    onSuccess: () => setEditingEntry(null)
  })
}

const handleEditCancel = () => {
  setEditingEntry(null)
  setEditValues({})
}

const handleServingsChange = (newServings) => {
  const ratio = newServings / editServings
  setEditServings(newServings)
  setEditValues(prev => ({
    ...prev,
    servingSize: Math.round(prev.servingSize * ratio * 10) / 10,
    calories: Math.round(prev.calories * ratio),
    protein: Math.round(prev.protein * ratio * 10) / 10,
    carbs: Math.round(prev.carbs * ratio * 10) / 10,
    fat: Math.round(prev.fat * ratio * 10) / 10,
  }))
}

const handleSaveAsMeal = () => {
  if (!saveName.trim()) return 
  saveAsMeal.mutate({
    date,
    meal,
    name: saveName,
    description: saveDescription
  }, {
    onSuccess: () => {
      setShowSaveModal(false)
      setSaveName('')
      setSaveDescription('')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    },
    onError: (() => {
      setSaveError(true)
      setTimeout(() => setSaveError(false), 2000)
    })
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

        {/* Save as template button */}
        {!isEmpty && (
          <button
            onClick={() => {
              setSaveName(`My ${meal.charAt(0).toUpperCase() + meal.slice(1)}`)
              setShowSaveModal(true)
            }}
            title="Save as meal template"
            style={{
              background: saveSuccess
                ? 'var(--success)'
                : saveError
                  ? 'rgba(226,75,74,0.1)'
                  : 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              cursor: 'pointer',
              color: saveSuccess
                ? 'white'
                : saveError
                  ? 'var(--error)'
                  : 'var(--text-muted)',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            {saveSuccess
              ? '✓ Saved!'
              : saveError
                ? '✗ Failed'
                : <>💾 <span className="icon-label">Save as Meal</span></>
            }
          </button>
        )}
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

      {/* Save as template modal */}
      {showSaveModal && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-primary)',
            fontWeight: '500',
            marginBottom: '10px'
          }}>
            Save {meal} as a meal template
          </div>

          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Meal's name"
            onFocus={(e) => e.target.select()}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              boxSizing: 'border-box',
              marginBottom: '8px'
            }}
          />

          <input
            type="text"
            value={saveDescription}
            onChange={(e) => setSaveDescription(e.target.value)}
            placeholder="Description (optional)"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              boxSizing: 'border-box',
              marginBottom: '10px'
            }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setShowSaveModal(false)
                setSaveName('')
                setSaveDescription('')
              }}
              style={{
                flex: 1,
                padding: '7px',
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
            <button
              onClick={handleSaveAsMeal}
              disabled={!saveName.trim() || saveAsMeal.isPending}
              style={{
                flex: 2,
                padding: '7px',
                background: !saveName.trim()
                  ? 'var(--bg-secondary)'
                  : 'var(--accent)',
                color: !saveName.trim()
                  ? 'var(--text-muted)'
                  : 'var(--accent-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: '500',
                cursor: !saveName.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {saveAsMeal.isPending ? 'Saving...' : '💾 Save template'}
            </button>
          </div>
        </div>
      )}

      {/* Food entries */}
      {entries.map(entry => (
      <div
        key={entry.id}
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Normal view */}
        {editingEntry !== entry.id && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px'
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

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* Edit button */}
              <button
                onClick={() => handleEditStart(entry)}
                title="Edit entry"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  padding: '4px'
                }}
              >
                ✏️ <span className="icon-label">Edit</span>
              </button>

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
                ↕ <span className="icon-label">Move Food</span>
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
        )}

        {/* Edit view */}
        {editingEntry === entry.id && (
          <div style={{ padding: '12px 16px' }}>
            {/* Food name */}
            <input
              value={editValues.foodName}
              onChange={(e) => setEditValues(prev => ({ ...prev, foodName: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '10px',
                boxSizing: 'border-box'
              }}
            />

            {/* Servings multiplier */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px'
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
                  onClick={() => handleServingsChange(Math.max(0.5, Math.round((editServings - 0.5) * 10) / 10))}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--bg-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={editServings}
                  onChange={(e) => handleServingsChange(Math.max(0.5, Number(e.target.value)))}
                  onFocus={(e) => e.target.select()}
                  min="0.5"
                  step="0.5"
                  style={{
                    width: '50px',
                    padding: '6px 4px',
                    border: 'none',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                />
                <button
                  onClick={() => handleServingsChange(Math.round((editServings + 0.5) * 10) / 10)}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--bg-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '16px',
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
                {editServings === 1 ? '1 serving' : `${editServings} servings`}
              </span>
            </div>

            {/* Macro fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginBottom: '10px'
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
                  <input
                    type="number"
                    value={editValues[macro.field]}
                    onChange={(e) => setEditValues(prev => ({
                      ...prev,
                      [macro.field]: e.target.value
                    }))}
                    onFocus={(e) => e.target.select()}
                    style={{
                      width: '100%',
                      padding: '6px 4px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input)',
                      color: macro.color,
                      fontSize: '13px',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Save / Cancel */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleEditCancel}
                style={{
                  flex: 1,
                  padding: '7px',
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
              <button
                onClick={() => handleEditSave(entry.id)}
                disabled={updateFood.isPending}
                style={{
                  flex: 2,
                  padding: '7px',
                  background: 'var(--accent)',
                  color: 'var(--accent-text)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {updateFood.isPending ? 'Saving...' : '✓ Save changes'}
              </button>
            </div>
          </div>
        )}

        {/* Move meal picker */}
        {movingEntry === entry.id && editingEntry !== entry.id && (
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
                  disabled={updateFood.isPending}
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