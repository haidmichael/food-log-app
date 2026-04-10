import { useDeleteFood } from '../hooks/useDailyLog.js'

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

export default function MealSection({ meal, entries = [], totals, date, onAddClick}) {
    const deleteFood = useDeleteFood(date)

    const isEmpty = entries.length === 0

    return (
        <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '12px'
        }}>
            {/* Meal Header */}
            <div style={{
                display: 'flex', 
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: isEmpty ? 'none' : '1px solid var(--border)',
                background: 'var(--bg-secondary)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{ fontSize: '16px'}}>{mealEmojis[meal]}</span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        textTransform: 'capitalize'
                    }}>
                        {meal}
                    </span>
                    {!isEmpty && (
                        <span style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)'
                        }}>
                            {entries.length} item{entries.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Meal Totals */}
                {!isEmpty && (
                    <div style={{
                        display: 'flex', 
                        gap: '8px',
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                    }}>
                        <span style={{
                            fontWeight: '500',
                            color: mealColors[meal]
                        }}>
                            {Math.round(totals.calories)} cal
                        </span>
                        <span>{Math.round(totals.protein)}g protein</span>
                        <span>{Math.round(totals.carbs)}g carbs</span>
                        <span>{Math.round(totals.fat)}g fat</span>
                    </div>
                )}
            </div>

            {/* Food Entries */}
            {entries.map(entry => (
                <div 
                    key={entry.id}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border)'
                    }}
                >
                    <div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            marginBottom: '2px'
                        }}>
                            {entry.foodName}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)'
                        }}>
                            {entry.calories} cal · {entry.protein}g protein · {entry.carbs}g carbs · {entry.fat}g fat
                        </div>
                    </div>
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
            ))}

            {/* Add Food Button */}
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