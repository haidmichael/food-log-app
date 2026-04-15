import { useState, useEffect } from 'react' 
import { searchFoods } from '../api/foods.js'
import {useAddFood } from '../hooks/useDailyLog.js'

const OZ_TO_G = 28.3495

function calculateMacros(food, userServingSize, userServingUnit) {
    const userGrams = userServingUnit === 'oz' ? userServingSize * OZ_TO_G : userServingSize
    const baseGrams = food.servingSize || 100
    const ratio = userGrams / baseGrams

    return {
        calories: Math.round(food.calories * ratio),
        protein: Math.round(food.protein * ratio * 10) / 10,
        carbs: Math.round(food.carbs * ratio * 10) / 10, 
        fat: Math.round(food.fat * ratio * 10) / 10
    }
}

export default function FoodSearch({ date, onClose, defaultMeal = 'snack' }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [selectedMeal, setSelectedMeal] = useState(defaultMeal)
    const [selectedFood, setSelectedFood] = useState(null)
    const [servingSize, setServingSize] = useState(100)
    const [servingUnit, setServingUnit] = useState(
        () => localStorage.getItem('preferredUnit') || 'g'
    )

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

    const handleUnitChange = (unit) => {
        setServingUnit(unit)
        localStorage.setItem('preferredUnit', unit)
        // Convert current serving size when switching units
        if (unit === 'oz') {
            setServingSize(prev => Math.round((prev / OZ_TO_G) * 10) / 10)
        } else {
            setServingSize(prev => Math.round((prev / OZ_TO_G)))
        }
    }

    const handleSelectFood = (food) => {
        setSelectedFood(food)
        // Default to the foods actual serving size
        if (servingUnit === 'oz') {
            setServingSize(Math.round((food.servingSize / OZ_TO_G) * 10) / 10)
        } else {
            setServingSize(food.servingSize || 100)
        }
        setQuery('')
        setResults([])
    }

    const handleConfirm = () => {
        if(!selectedFood) return
        const macros = calculateMacros(selectedFood, servingSize, servingUnit)

        addFood.mutate({
            date,
            meal: selectedMeal,
            foodName: selectedFood.name,
            servingSize,
            servingUnit,
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat
        })
        onClose()
    }

    const preview = selectedFood && servingSize > 0 ? calculateMacros(selectedFood, servingSize, servingUnit) : null
    
    const meals = ['breakfast', 'lunch', 'dinner', 'snack']

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
                {/* Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)'
                }}>
                    {/* Meal Selector */}
                    <div style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '10px',
                        flexWrap: 'wrap'
                    }}>
                        {meals.map(meal => (
                            <button
                                key={meal}
                                onClick={() => setSelectedMeal(meal)}
                                style={{
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    background: selectedMeal === meal ? 'var(--accent)' : 'var(--bg-secondary)',
                                    color: selectedMeal === meal ? 'var(--accent-text)' : 'var(--text-secondary)',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {meal}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <input 
                            autoFocus
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setSelectedFood(null)
                            }}
                            placeholder={`Search foods for ${selectedMeal}`}
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
                </div>

                {/* Serving size panel - shows when food is selected */}
                {selectedFood && (
                    <div style={{
                        padding: '16px', 
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-secondary)'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            marginBottom: '4px'
                        }}>
                            {selectedFood.name}
                        </div>
                        {selectedFood.brand && (
                            <div style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                marginBottom: '12px'
                            }}>
                                {selectedFood.brand}
                            </div>
                        )}

                        {/* Serving Input + Unit Toggle */}
                        <div style={{
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px'
                        }}>
                            <input 
                                type="number"
                                value={servingSize}
                                onChange={(e) => setServingSize(Number(e.target.value))}
                                min="0"
                                step="0.1"
                                style={{
                                    width: '90px',
                                    padding: '8px',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                }}
                            />

                            {/* Unit Toggle */}
                            <div style={{
                                display: 'flex',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden'
                            }}>
                                {['g', 'oz'].map(unit => (
                                    <button
                                        key={unit}
                                        onClick={() => handleUnitChange(unit)}
                                        style={{
                                            padding: '8px 14px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            border: 'none',
                                            cursor: 'pointer',
                                            background: servingUnit === unit
                                                ? 'var(--accent)'
                                                : 'var(--bg-secondary)',
                                            color: servingUnit === unit
                                                ? 'var(--accent-text)'
                                                : 'var(--text-secondary)'
                                        }}
                                    >
                                        {unit}
                                    </button>
                                ))}
                            </div>

                            <span style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)'
                            }}>
                                serving
                            </span>
                        </div>

                        {/* Serving hint */}
                        {selectedFood.householdServing && (
                        <div style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            marginBottom: '8px'
                        }}>
                            1 serving = {selectedFood.householdServing} ({selectedFood.servingSize}{selectedFood.servingSizeUnit})
                        </div>
                        )}

                        {/* Live Macro Preview */}
                        {preview && (
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                padding: '10px',
                                background: 'var(--bg-primary)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                marginBottom: '12px'
                            }}>
                                <div style={{ textAlign: 'center', flex: 1}}>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: 'var(--error)'
                                    }}>
                                        {preview.calories}
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: 'var(--text-muted)'
                                    }}>
                                        cal
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', flex: 1}}>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: 'var(--success)'
                                    }}>
                                        {preview.protein}g 
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: 'var(--text-muted)'
                                    }}>
                                        protein
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', flex: 1}}>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: 'var(--warning)'
                                    }}>
                                        {preview.carbs}g
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: 'var(--text-muted)'
                                    }}>
                                        carbs
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', flex: 1}}>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: 'var(--purple)'
                                    }}>
                                        {preview.fat}g 
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: 'var(--text-muted)'
                                    }}>
                                        fat
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirm}
                            disabled={addFood.isPending || !servingSize}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: 'var(--accent)',
                                color: 'var(--accent-text)',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                        {addFood.isPending
                            ? 'Adding...'
                            : `Add to ${selectedMeal}`
                        }
                        </button>
                    </div>
                )}

                {/* Results */}
                <div style={{maxHeight: '350px', overflowY: 'auto' }}>
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
                    {!searching && results.length === 0 && query.length >= 2 && !selectedFood &&(
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
                                background: selectedFood?.fdcId === food.fdcId
                                ? 'var(--bg-secondary)'
                                : 'transparent'
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
                                {food.brand && (
                                    <div style={{
                                        fontSize: '11px', 
                                        color: 'var(--text-muted)'
                                    }}>
                                        {food.brand}
                                    </div>
                                )}
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {food.calories} cal · {food.protein}g protein · {food.carbs}g carbs · {food.fat}g fat
                                    <span style={{ marginLeft: '4px' }}>
                                        {food.householdServing ? `per ${food.householdServing}` : 'per 100g'}
                                    </span>
                                </div>
                        </div>
                        <button 
                            onClick={() => handleSelectFood(food)}
                            style={{
                            padding: '6px 12px',
                            background: selectedFood?.fdcId === food.fdcId
                                ? 'var(--bg-secondary)'
                                : 'var(--accent)',
                            color: selectedFood?.fdcId === food.fdcId
                                ? 'var(--text-secondary)'
                                : 'var(--accent-text)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                            }}
                        >
                            {selectedFood?.fdcId === food.fdcId ? 'Slected' : 'Select'}
                        </button>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    )
}