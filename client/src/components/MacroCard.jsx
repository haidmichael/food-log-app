export default function MacroCard({ label, consumed, goal, color }) { 
    const percentage = goal ? Math.min((consumed / goal) * 100, 100) : 0
    const isOver = goal && consumed > goal 

    return(
        <div style={{
            background: 'var(--bg-primary )',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', 
            padding: '12px'
        }}>
            <div style={{
                fontSize: '11px', 
                color: 'var(--text-muted)', 
                marginBottom: '4xp', 
                textTransform: 'uppercase', 
                letterSpacing: '0.0em'
            }}>
                {label}
            </div>

            <div style={{
                fontSize: '11px', 
                color: 'var(--text-muted)', 
                marginBottom: '8xp',
            }}>
                of {goal || '-'}
            </div>

            {/* Progress bar */}
            <div style={{
                height: '100%', 
                width: `${percentage}%`,
                background: isOver ? 'var(--error)' : color, 
                transition: 'width 0.3s ease'
            }}>
            </div>
        </div>
    )
}