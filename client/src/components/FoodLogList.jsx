import { useDeleteFood } from '../hooks/useDailyLog.js' 

export default function FoodLogList({ entries = [], date, onAddClick }) {
    const deleteFood = useDeleteFood(date)

    return (
        <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
        }}>
            {entries.length === 0 ? (
                <div style={{
                    padding: '24px', 
                    textAlign: 'center', 
                    color: 'var(--text-muted)', 
                    fontSize: '14px'
                }}>
                    No Food logged yet today
                </div>
            ) : (
                entries.map(entry => (
                    <div 
                        key={entry.id}
                        style={{
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center', 
                            padding: '12px 16px', 
                            borderBottom: '1px solid var(--border)',
                        }}
                    >
                        <div>
                            <div style={{
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: 'var(--text-primary)',
                                marginBottom: '2px'
                            }}>
                                {entry.foodName}
                            </div>
                            <div style={{
                                fontSize: '12px', 
                                color: 'var(--text-muted)'
                            }}>
                                {entry.calories} cal · {entry.protein}p · {entry.carbs}c · {entry.fat}f
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
                            🗑️
                        </button>
                    </div>
                ))
            )}

            {/* Add food button */}
            <button 
                onClick={onAddClick}
                style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: 'none',
                borderTop: entries.length > 0 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                textAlign: 'center'
                }}
            >
                + Search and add food
            </button>
        </div>
    )
}