import { useState, useEffect } from 'react' 
import { useNavigate } from 'react-router-dom' 
import { useMacroGoals, useSetMacroGoals } from '../hooks/useMacroGoals.js' 

export default function GoalsPage () {
    const { data: goals, isLoading } = useMacroGoals() 
    const setGoals = useSetMacroGoals() 
    const navigate = useNavigate() 

    const [form, setForm] = useState({
        calories: '', 
        protein: '', 
        carbs: '', 
        fat: '' 
    })

    const [saved, setSaved] = useState(false)

    // ***** Pre-filled form if goals already exist *****
    useEffect(() => {
        if (goals) {
            setForm({
                calories: goals.calories, 
                protein: goals.protein, 
                carbs: goals.carbs, 
                fat: goals.fat
            })
        }
    }, [goals])

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev, 
            [e.target.name]: Number(e.target.value)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault() 
        setSaved(false)

        setGoals.mutate(form, {
            onSuccess: () => {
                setSaved(true)
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            }
        })
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
        <div style={{
            maxWidth: '480', 
            margin: '0 auto'
        }}>
            <h2 style={{
                fontSize: '18px', 
                fontWeight: '600',
                color: 'var(--text-primary)', 
                marginBottom: '8px'
            }}>
                Daily Macro Goals
            </h2>
            <p style={{
                fontSize: '13px', 
                color: 'var(--text-muted)', 
                marginBottom: '1.5ream'
            }}>
                Set your daily nutrition targets. These will be used to track your progress
            </p>

            {saved && (
                <div style={{
                    padding: '12px', 
                    background: 'rgba(29, 158, 117, 0.1)',
                    border: '1px solid var(--success)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    color: 'var(--success)',
                    marginBottom: '1rem', 
                    textAlign: 'center'
                }}>
                    ✓ Goals saved! Redirecting to dashboard...
                </div>
            )}

            {setGoals.isError && (
                <div style={{
                    padding: '12px', 
                    background: 'rgba(226, 75, 74,.01)',
                    border: '1px solid var(--error)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    color: 'var(--error)',
                    marginBottom: '1rem'
                }}>
                    Failed to save goals. Please try again.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {[
                    { name: 'calories', label: 'Calories', unit: 'kcal', color: 'var(--error)' },
                    { name: 'protein', label: 'Protein', unit: 'g', color: 'var(--success)' },
                    { name: 'carbs', label: 'Carbs', unit: 'g', color: 'var(--warning)' },
                    { name: 'fat', label: 'Fat', unit: 'g', color: 'var(--purple)'}
                ].map(field => (
                    <div 
                        key={field.name}
                        style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px', 
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                    >
                        {/* Color Indicator */}
                        <div style={{
                            width: '4px',
                            height: '40px',
                            background: field.color,
                            borderRadius: '2px',
                            flexShrink: 0
                        }}/>
                        <div style={{flex: 1}}> 
                            <label style={{
                                display: 'block', 
                                fontSize: '13px',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                marginBottom: '6px'
                            }}>
                                {field.label}
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    type='number'
                                    name={field.name} 
                                    value={form[field.name]}
                                    onChange={handleChange}
                                    min='0'
                                    required
                                    style={{
                                        width: '120px',
                                        padding: '8px 10px',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px'
                                    }}
                                />
                                <span style={{
                                    fontSize: '13px',
                                    color: 'var(--text-muted)'
                                }}>
                                    {field.unit}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                <button 
                    type='submit'
                    disabled={setGoals.isPending}
                    style={{
                        width: '100%', 
                        padding: '12px',
                        background: 'var(--accent)',
                        color: 'var(--accent-text)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: setGoals.isPending ? 'not-allowed' : 'pointer',
                        opacity: setGoals.isPending ? 0.7 : 1,
                        marginTop: '8px'
                    }}
                >
                    {setGoals.isPending ? 'Saving...' : 'Save Goals'}
                </button>
            </form>
        </div>
    )
}