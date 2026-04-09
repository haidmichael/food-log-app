export default function MacroCard({ label, consumed, goal, color }) { 
    const percentage = goal ? Math.min((consumed / goal) * 100, 100) : 0
    const isOver = goal && consumed > goal 
    const remaining = goal ? goal - consumed : null

    return(
        <div style={{
            background: 'var(--bg-primary )',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', 
            padding: '12px',
            overflow: 'hidden',
        }}>
            <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                {label}
            </div>
            <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isOver ? 'var(--error)' : 'var(--text-primary)',
                marginBottom: '2px'
            }}>
                {consumed}
            </div>

            <div style={{
                fontSize: '11px', 
                color: 'var(--text-muted)', 
                marginBottom: '6px',
            }}>
                of {goal || '-'}
            </div>

            {/* Progress bar */}
            <div style={{
                height: '4px',
                background: 'var(--border)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '6px'
            }}>
                <div style={{
                    height: '100%', 
                    width: `${percentage}%`,
                    background: isOver ? 'var(--error)' : color, 
                    transition: 'width 0.3s ease',
                }} />
            </div>
            {goal && (
                <div style={{
                    fontSize: '11px',
                    color: isOver ? 'var(--error)' : 'var(--text-muted)',
                    fontWeight: isOver ? '500' : '400'
                }}>
                    {isOver
                        ? `${Math.abs(remaining)} over goal`
                        : `${remaining} remaining`
                    }
                </div>
            )}
        </div>
    )
}