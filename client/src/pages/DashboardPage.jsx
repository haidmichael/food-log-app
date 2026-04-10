import { useState } from 'react'
import { useSummary } from '../hooks/useSummary.js'
import MacroCard from '../components/MacroCard.jsx'
import WaterTracker from '../components/WaterTracker.jsx'
import MealSection from '../components/MealSection.jsx'
import FoodSearch from '../components/FoodSearch.jsx'

function getToday() {
    return new Date().toISOString().split('T')[0]
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
        weekday: 'short', 
        month: 'short', 
        day: 'numeric'
    })
}

export default function DashboardPage() {
    const [date, setDate] = useState(getToday())
    const [activeMeal, setActiveMeal] = useState(null) 
    const { data: summary, isLoading, isError } = useSummary(date) 

    const changeDate = (days) => {
        const current = new Date(date + 'T00:00:00')
        current.setDate(current.getDate() + days)
        setDate(current.toISOString().split('T')[0])
    }

    const isToday = date === getToday() 

    if (isLoading) return (
        <div style={{
            textAlign: 'center', 
            padding: '3rem',
            color: 'var(--text-muted)'
        }}>
            Loading...
        </div>
    )

        if (isError) return (
        <div style={{
            textAlign: 'center', 
            padding: '3rem',
            color: 'var(--text-muted)'
        }}>
            Failed to load. Please try again.
        </div>
    )

    const { goals, consumed, meals, mealTotals, water } = summary || {} 

    return (
        <div>
            {/* Date navigation */}
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <button
                    onClick={() => changeDate(-1)}
                    style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        fontSize: '13px'
                    }}
                >
                    ← Prev
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '15px', 
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                    }}>
                        {isToday ? 'Today' : formatDate(date)}
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                    }}>
                        {date}
                    </div>
                </div>

                <button
                    onClick={() => changeDate(1)}
                    disabled={isToday}
                    style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 12px',
                        cursor: isToday ? 'not-allowed' : 'pointer',
                        color: isToday ? 'var(--text-muted)' : 'var(--text-secondary)',
                        fontSize: '13px',
                        opacity: isToday ? 0.4 : 1
                    }}
                >
                    Next →
                </button>
            </div>

            {/* Macro cards */}
            <div style={{
                fontSize: '11px',
                fontWeight: '500',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05',
                marginBottom: '8px'
            }}>
                Macros
            </div>

            {!goals && (
                <div style={{
                    padding: '12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    textAlign: 'center'
                }}>
                    No macro goals set yet -{' '}
                    <a href="/goals" style={{ color: 'var(--text-primary)', fontWeight: '500'}}>
                        set your goals
                    </a>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginBottom: '1.5rem'
            }}>
                <MacroCard
                    label='Calories'
                    consumed={consumed?.calories || 0}
                    goal={goals?.calories}
                    color='var(--error)'
                />
                <MacroCard
                    label='Protein'
                    consumed={consumed?.protein || 0}
                    goal={goals?.protein}
                    color='var(--success)'
                />
                <MacroCard
                    label='Carbs'
                    consumed={consumed?.carbs || 0}
                    goal={goals?.carbs}
                    color='var(--error)'
                />
                <MacroCard
                    label='Fat'
                    consumed={consumed?.fat || 0}
                    goal={goals?.fat}
                    color='var(--purple)'
                />
            </div>

            {/* Water tracker */}
            <div style={{
                fontSize: '11px',
                fontWeight: '500',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px'
            }}>
                Water
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <WaterTracker
                    date={date}
                    total={water?.total || 0}
                    entries={water?.entries || []}
                />
            </div>

            {/* Food log */}
            {/* Meal Section */}
            <div style={{
                fontSize: '11px',
                fontWeight: '500',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px'
            }}>
                Today's Food 
            </div>

            {[ 'breakfast', 'lunch', 'dinner', 'snack' ].map(meal => (
                <MealSection
                    key={meal}
                    meal={meal}
                    entries={meals?.[meal] || []}
                    totals={mealTotals?.[meal] || {calories: 0, protein: 0, carbs: 0, fat: 0 }}
                    date={date}
                    onAddClick={() => setActiveMeal(meal)}
                />
            ))}

            {/* Food search modal */}
            {activeMeal && (
                <FoodSearch
                    date={date}
                    onClose={() => setActiveMeal(false)}
                />
            )}
        </div>
    )
}