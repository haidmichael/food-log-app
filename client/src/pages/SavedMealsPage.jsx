import { useState } from 'react' 
import { useNavigate } from 'react-router-dom' 
import { useSavedMeals, useDeleteSavedMeal, useLogSavedMeal } from '../hooks/useSavedMeals.js'

const mealEmojis = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎'
}

export default function SavedMealsPage() {
    const { data: savedMeals, isLoading } = useSavedMeals()
    const deleteMeal = useDeleteSavedMeal()
    const navigate = useNavigate() 

    const [loggingMeal, setLoggingMeal] = useState(null)

    const today = new Date().toISOString().split('T')[0]
    const logMeal = useLogSavedMeal(today)

    const handleLog = (savedMeal, mealTime) => {
        console.log('logging meal:', savedMeal.id, 'to:', mealTime)
        logMeal.mutate({
            id: savedMeal.id,
            date: today,
            meal: mealTime
        }, {
            onSuccess: (data) => {
                console.log('log success:', data)
                setLoggingMeal(null)
                navigate('/dashboard')
            }, 
            onError: (error) => {
                console.log('log error: ', error)
            }
        })
    }

    const getMealTotals = (items) => {
        return items.reduce((totals, item) => ({
            calories: totals.calories + item.calories,
            protein: totals.protein + item.protein,
            carbs: totals.carbs + item.carbs,
            fat: totals.fat + item.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
    }

    if (isLoading) return (
        <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)'
        }}>
            Loading...
        </div>
    )

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                    }}>
                        Saved Meals
                    </h2>
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)'
                    }}>
                        Your reusable meal template
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/saved-meals/new')}
                    style={{
                        padding: '8px 16px',
                        background: 'var(--accent)',
                        color: 'var(--accent-text)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}
                >
                    + New Meal
                </button>
            </div>

            {/* Empty State */}
            {savedMeals?.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-muted)'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🍽️</div>
                    <div style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
                        No saved meals yet
                    </div>
                    <div style={{ fontSize: '13px', marginBottom: '16px' }}>
                        Create a meal template to quickly log your favorite meals
                    </div>
                    <button
                        onClick={() => navigate('/saved-meals/new')}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--accent)',
                            color: 'var(--accent-text)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}
                    >
                        Create your first meal
                    </button>
                </div>
            )}

            {/* Saved Meal List */}
            {savedMeals?.map(savedMeal => {
                const totals = getMealTotals(savedMeal.items)
                const isLogging = loggingMeal === savedMeal.id 

                return (
                    <div
                        key={savedMeal.id}
                        style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                            marginBottom: '12px'
                        }}
                    >
                        {/* Meal Header */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <div>
                            <div style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                marginBottom: '4px'
                            }}>
                                {savedMeal.name}
                            </div>
                            {savedMeal.description && (
                                <div style={{
                                    fontSize: '12px',
                                    color: 'var(--text-muted)',
                                    marginBottom: '6px'
                                }}>
                                    {savedMeal.description}
                                </div>
                            )}
                            {/* Macro totals */}
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                fontSize: '12px',
                                color: 'var(--text-muted)'
                            }}>
                                <span style={{ color: 'var(--error)', fontWeight: '500' }}>
                                    {Math.round(totals.calories)} cal
                                </span>
                                <span>{Math.round(totals.protein * 10) / 10}g protein</span>
                                <span>{Math.round(totals.carbs * 10) / 10}g carbs</span>
                                <span>{Math.round(totals.fat * 10) / 10}g fat</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setLoggingMeal(isLogging ? null : savedMeal.id)}
                                style={{
                                    padding: '6px 12px',
                                    background: isLogging ? 'var(--bg-secondary)' : 'var(--accent)',
                                    color: isLogging ? 'var(--text-secondary)' : 'var(--accent-text)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                {isLogging ? 'Cancel' : 'Log'}
                            </button>
                            <button
                                onClick={() => deleteMeal.mutate(savedMeal.id)}
                                style={{
                                    padding: '6px 10px',
                                    background: 'none',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                    
                    {/* Meal time selector - shows when logging */}
                    {isLogging && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'var(--bg-secondary)',
                                borderBottom: '1px solid var(--border)'
                            }}>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                marginBottom: '8px'
                            }}>
                                Log to which meal?
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['breakfast', 'lunch', 'dinner', 'snack'].map(mealTime => (
                                    <button
                                        key={mealTime}
                                        onClick={() => handleLog(savedMeal, mealTime)}
                                        disabled={logMeal.isPending}
                                        style={{
                                            padding: '6px 14px',
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
                                    {mealEmojis[mealTime]} {mealTime}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Food Item List */}
                    {savedMeal.items.map(item => (
                    <div
                        key={item.id}
                        style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                        }}
                    >
                        <div>
                            <div style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                marginBottom: '2px'
                            }}>
                                
                                {item.foodName}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)'
                            }}>
                            {item.servingSize}{item.servingUnit} · {item.calories} cal · {item.protein}g protein · {item.carbs}g carbs · {item.fat}g fat
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
                )
            })}

            {/* Log meal picker modal */}
            {loggingMeal && (
                <div
                onClick={() => setLoggingMeal(null)}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.3)',
                    zIndex: 100
                }}
                />
            )}
        </div>
    )
}