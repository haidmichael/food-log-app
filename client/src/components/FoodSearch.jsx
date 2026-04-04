import { useState, useEffect } from 'react' 
import { searchFoods } from '../api/foods.js'
import {useAddFood } from '../hooks/useDailyLog.js'

export default function FoodSearch({ date, onClose }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const addFood = useAddFood() 

    useEffect(() => {
        if (query.length < 2) return setResults([])

            const timeout = setTimeout(async () => {
                setSearching(true) 
                try {
                    const data = await searchFoods(query) 
                    setResults(data.foods) 
                } catch (err) {
                    console.log(err) 
                } finally {
                    setSearching(false)
                }
            }, 400)

            return () => clearTimeout(timeout)
    }, [query])

    const handleAdd = (food) => {
        addFood.mutate({
            date, 
            foodName: food.name, 
            calories: food.calories, 
            protein: food.protein, 
            carbs: food.carbs, 
            fat: food.fat 
        })
        onClose() 
    }

    return (
        <div style={{
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'center', 
            paddingTop: '80px', 
            zIndex: 200
        }}>
            <div style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                width: '100%',
                maxWidth: '500px',
                margin: '0 1rem',
                overflow: 'hidden'
            }}>
                {/* Search Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                }}>
                    <input 
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder='Search foods...'
                        style={{
                            padding: '10px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                        }}
                    />
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            fontSize: '13px'
                        }}
                    >

                        Cancel
                    </button>
                </div>

                {/* Results */}
                <div style={{maxHeight: '400px', overflowY: 'auto' }}>
                    {searching && (
                        <div style={{
                            padding: '20px', 
                            textAlign: 'center', 
                            color: 'var(--text-muted)',
                            fontSize: '13px'
                        }}>
                            Searching... 
                        </div>
                    )}
                    {!searching && results.length === 0 && query.length >= 2 && (
                        <div style={{
                            padding: '20px', 
                            textAlign: 'center', 
                            color: 'var(--text-muted)',
                            fontSize: '13px'
                        }}>
                            No results found 
                        </div>
                    )}

                    {results.map(food => (
                        <div 
                            key={food.fdcId}
                            style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <div>
                                <div style={{
                                    fontSize: '13px', 
                                    fontWeight: '500', 
                                    color: 'var(--text-primary)', 
                                    marginBottom: '2px'
                                }}>
                                    {food.name}
                                </div>
                                <div style={{
                                    fontSize: '11px', 
                                    color: 'var(--text-muted)'
                                }}>
                                    {food.calories} cal · {food.protein}p · {food.carbs}c · {food.fat}f
                                </div>
                        </div>
                        <button 
                            onClick={() => handleAdd(food)}
                            disabled={addFood.isPending}
                            style={{
                                padding: '6px 12px',
                                background: 'var(--accent)',
                                color: 'var(--accent-text)',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}
                        >
                            Add
                        </button>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    )
}