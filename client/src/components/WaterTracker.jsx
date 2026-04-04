import { useAddWater } from '../hooks/useWaterLog.js' 

export default function WaterTracker({ date, total = 0, goal = 64}) {
    const addWater = useAddWater() 

    const handleAdd = (amount) => {
        addWater.mutate({ date, amount, unit: 'oz' })
    }

    const precentage = Math.min((total / goal) * 100, 100)

    return (
        <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px'
        }}>
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '10px'
            }}>
                <div>
                    <span style={{
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: 'var(--text-primary)'
                    }}>
                        💧 {total} oz
                    </span>
                    <span style={{
                        fontSize: '12px', 
                        color: 'var(--text-muted)', 
                        marginLeft: '6px'
                    }}>
                        of {goal} oz
                    </span>
                </div>

                {/* Quick add buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                    {[8, 16].map(amount =>(
                        <button
                            key={amount} 
                            onClick={() => handleAdd(amount)}
                            disabled={addWater.isPending}
                            style={{
                                padding: '5px 10px', 
                                fontSize: '12px', 
                                background: 'var(--bg-secondary)', 
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)', 
                                cursor: 'pointer', 
                                color: 'var(--text-secondary)'
                            }}
                        >
                        +{amount}oz
                        </button>
                    ))}
                </div>
            </div> 

            {/* Progress Bar */}
            <div style={{
                height: '6px', 
                background: 'var(--border)', 
                borderRadius: '3px', 
                overflow: 'hidden' 
            }}>
                <div style={{
                    height: '100%', 
                    width: `${precentage}%`,
                    background: '#378ADD', 
                    borderRadius: '3px', 
                    transition: 'width 0.3s ease' 
                }} />
            </div>
        </div>
    )
}