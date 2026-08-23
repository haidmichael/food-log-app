import { useState, useEffect } from 'react' 
import { searchFoods } from '../api/foods.js'
import { useAddFood } from '../hooks/useDailyLog.js'
import { searchCommunityFoods, incrementCommunityFoodUseCount } from '../api/communityFoods.js'

const OZ_TO_G = 28.3495

function calculateMacros(food, userServingSize, userServingUnit, servings = 1) {
    const userGrams = userServingUnit === 'oz' 
    ? userServingSize * OZ_TO_G 
    : userServingSize
    
    const baseGrams = food.servingSize === 'oz' 
    ? (food.servingSize || 100) * OZ_TO_G
    : (food.servingSize || 100)
    
    const ratio = (userGrams / baseGrams) * servings

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
    const [searchWarning, setSearchWarning] = useState(null)
    const [selectedMeal, setSelectedMeal] = useState(defaultMeal)
    const [selectedFood, setSelectedFood] = useState(null)
    const [servingSize, setServingSize] = useState(100)
    const [servings, setServings] = useState(1)
    const [servingUnit, setServingUnit] = useState(
        () => localStorage.getItem('preferredUnit') || 'g'
    )

    const addFood = useAddFood()

    useEffect(() => {
        if (!searchWarning) return
        const timeout = setTimeout(() => setSearchWarning(null), 4000)
        return () => clearTimeout(timeout)
    }, [searchWarning])

    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            setSearchWarning(null)
            return
        }

            const timeout = setTimeout(async () => {
                setSearching(true)
                try {
                    const [communityResult, usdaResult] = await Promise.allSettled([
                        searchCommunityFoods(query),
                        searchFoods(query)
                    ])

                    if (communityResult.status === 'rejected') {
                        console.error('Community food search failed:', communityResult.reason)
                    }
                    if (usdaResult.status === 'rejected') {
                        console.error('USDA food search failed:', usdaResult.reason)
                    }

                    if (communityResult.status === 'rejected' && usdaResult.status === 'rejected') {
                        setSearchWarning('Food search is temporarily unavailable. Please try again.')
                    } else if (communityResult.status === 'rejected') {
                        setSearchWarning('Community food search is temporarily unavailable — showing USDA results only.')
                    } else if (usdaResult.status === 'rejected') {
                        setSearchWarning('USDA food search is temporarily unavailable — showing community results only.')
                    } else {
                        setSearchWarning(null)
                    }

                    const communityResults = communityResult.status === 'fulfilled'
                        ? (communityResult.value.foods || []).map(food => ({
                            ...food,
                            isCommunity: true,
                            fdcId: food.id,
                            name: food.name,
                            brand: food.brand || null
                        }))
                        : []

                    const usdaResults = usdaResult.status === 'fulfilled'
                        ? (usdaResult.value.foods || []).map(food => ({
                            ...food,
                            isCommunity: false
                        }))
                        : []

                    const combined = [
                        ...(Array.isArray(communityResults) ? communityResults : []),
                        ...(Array.isArray(usdaResults) ? usdaResults : [])
                    ]

                    setResults(combined)
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
        setServings(1)
        // Default to the foods actual serving size
        if (servingUnit === 'oz') {
            setServingSize(Math.round(((food.servingSize || 100) / OZ_TO_G) * 10) / 10)
        } else {
            setServingSize(food.servingSize || 100)
        }
        setQuery('')
        setResults([])
    }

    const handleConfirm = () => {
        if(!selectedFood) return
        const macros = calculateMacros(selectedFood, servingSize, servingUnit, servings)

        if (selectedFood.isCommunity) {
            incrementCommunityFoodUseCount(selectedFood.id).catch(console.error)
        }

        addFood.mutate({
            date,
            meal: selectedMeal,
            foodName: selectedFood.name,
            servingSize: servingSize * servings,
            servingUnit,
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat
        })
        onClose()
    }

    const preview = selectedFood && servingSize > 0 ? calculateMacros(selectedFood, servingSize, servingUnit, servings) : null
    
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

                {/* Partial search failure notice */}
                {searchWarning && (
                    <div style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        color: 'var(--warning)',
                        background: 'rgba(226,175,74,0.1)',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        ⚠️ {searchWarning}
                    </div>
                )}

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
                                onFocus={(e) => e.target.select()}
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

                            {/* Serving input */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '8px'
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    color: 'var(--text-muted)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    Servings:
                                </span>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    overflow: 'hidden'
                                }}>
                                    <button
                                        onClick={() => setServings(prev => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10))}
                                        style={{
                                            padding: '8px 12px',
                                            background: 'var(--bg-secondary)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-primary)',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={servings}
                                        onChange={(e) => setServings(Math.max(0.5, Number(e.target.value)))}
                                        onFocus={(e) => e.target.select()}
                                        min="0.5"
                                        step="0.5"
                                        style={{
                                            width: '50px',
                                            padding: '8px 4px',
                                            border: 'none',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            textAlign: 'center'
                                        }}
                                    />
                                    <button
                                        onClick={() => setServings(prev => Math.round((prev + 0.5) * 10) / 10)}
                                        style={{
                                            padding: '8px 12px',
                                            background: 'var(--bg-secondary)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-primary)',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                                <span style={{
                                        fontSize: '12px',
                                        color: 'var(--text-muted)'
                                }}>
                                    {servings === 1 ? '1 serving' : `${servings} servings`}
                                </span>
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

                    {Array.isArray(results) && results.map(food => (
                    <div
                        key={food.fdcId || food.id}
                        style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: selectedFood?.fdcId === (food.fdcId || food.id)
                            ? 'var(--bg-secondary)'
                            : 'transparent'
                        }}
                    >
                        <div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            marginBottom: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            {food.name}
                            {food.isCommunity && (
                            <span style={{
                                fontSize: '10px',
                                background: 'rgba(29,158,117,0.15)',
                                color: 'var(--success)',
                                padding: '1px 6px',
                                borderRadius: '10px',
                                fontWeight: '600'
                            }}>
                                ⭐ Community
                            </span>
                            )}
                        </div>
                        {food.brand && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {food.brand}
                            </div>
                        )}
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {food.calories} cal · {food.protein}g protein · {food.carbs}g carbs · {food.fat}g fat
                            <span style={{ marginLeft: '4px' }}>
                            {food.isCommunity
                                ? `per ${food.servingSize}${food.servingUnit}`
                                : food.householdServing
                                ? `per ${food.householdServing}`
                                : 'per 100g'
                            }
                            </span>
                        </div>
                        </div>
                        <button
                        onClick={() => handleSelectFood(food)}
                        style={{
                            padding: '6px 12px',
                            background: selectedFood?.fdcId === (food.fdcId || food.id)
                            ? 'var(--bg-secondary)'
                            : 'var(--accent)',
                            color: selectedFood?.fdcId === (food.fdcId || food.id)
                            ? 'var(--text-secondary)'
                            : 'var(--accent-text)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                        >
                        {selectedFood?.fdcId === (food.fdcId || food.id) ? 'Selected' : 'Select'}
                        </button>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    )
}