import { useEffect, useState } from 'react' 
import { useNavigate } from 'react-router-dom' 
import { useCreateSavedMeal } from '../hooks/useSavedMeals.js'
import { searchFoods } from '../api/foods.js' 

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

export default function CreateSavedMealPage() {
    const navigate = useNavigate()
    const createMeal = useCreateSavedMeal()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [items, setItems] = useState([])

    // ***** Food Search *****
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [selectedFood, setSelectedFood] = useState(null)
    const [servingSize, setServingSize] = useState(100)
    const [servingUnit, setServingUnit] = useState(
        () => localStorage.getItem('preferredUnit') || 'g'
    )

    useEffect(() => {
        if (query.length < 2) return setResults([])
            const timeout = setTimeout(async () => {
                setSearching(true)
                try {
                    const data = await searchFoods(query)
                    setResults(data.foods)
                } catch (err) {
                    console.error(err)
                } finally {
                    setSearching(false)
                }
            }, 400)
            return () => clearTimeout(timeout)
    }, [query])

    const handleUnitChange = (unit) => {
        setServingUnit(unit)
        localStorage.setItem('preferredUnit', unit)
        if (unit === 'oz') {
            setServingSize(prev => Math.round((prev / OZ_TO_G) * 10) / 10)
        } else {
            setServingSize(prev => Math.round(prev * OZ_TO_G))
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

    const handleAddItem = () => {
        if (!selectedFood) return 
        const macros = calculateMacros(selectedFood, servingSize, servingUnit)
        setItems(prev => [...prev, {
            foodName: selectedFood.name,
            servingSize, 
            servingUnit,
            ...macros
        }])
        setSelectedFood(null)
        servingSize(100)
    }

    const handleRemoveItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        if (!name.trim() || items.length === 0) return
        createMeal.mutate({ name, description, items }, {
            onSuccess: () => navigate('/saved-meals')
        })
    }

    const preview = selectedFood  && servingSize > 0
        ? calculateMacros(selectedFood, servingSize, servingUnit) : null

    const totalMacros = items.reduce((totals, item) => ({
        calories: totals.calories + item.calories,
        protein: totals.protein + item.protein,
        carbs: totals.carbs + item.carbs,
        fat: totals.fat + item.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
        }}>
            <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)'
            }}>
            Create Saved Meal
            </h2>
            <button
            onClick={() => navigate('/saved-meals')}
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
            Cancel
            </button>
        </div>

        {/* Meal name + description */}
        <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '16px'
        }}>
            <div style={{ marginBottom: '12px' }}>
            <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
            }}>
                Meal name
            </label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Morning Oats"
                style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box'
                }}
            />
            </div>
            <div>
            <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
            }}>
                Description (optional)
            </label>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. My go-to post workout breakfast"
                style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box'
                }}
            />
            </div>
        </div>

        {/* Added items */}
        {items.length > 0 && (
            <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '16px'
            }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-primary)'
                }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
                <span style={{
                fontSize: '12px',
                color: 'var(--text-muted)'
                }}>
                {Math.round(totalMacros.calories)} cal total
                </span>
            </div>

            {items.map((item, index) => (
                <div
                key={index}
                style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                >
                <div>
                    <div style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '2px'
                    }}>
                    {item.foodName}
                    </div>
                    <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                    }}>
                    {item.servingSize}{item.servingUnit} · {item.calories} cal · {item.protein}g protein · {item.carbs}g carbs · {item.fat}g fat
                    </div>
                </div>
                <button
                    onClick={() => handleRemoveItem(index)}
                    style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '16px'
                    }}
                >
                    🗑
                </button>
                </div>
            ))}
            </div>
        )}

        {/* Food search */}
        <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '16px'
        }}>
            <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--text-primary)'
            }}>
            Add food
            </div>

            <div style={{ padding: '16px' }}>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                setQuery(e.target.value)
                setSelectedFood(null)
                }}
                placeholder="Search foods..."
                style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box',
                marginBottom: '12px'
                }}
            />

            {/* Search results */}
            {searching && (
                <div style={{
                textAlign: 'center',
                padding: '12px',
                color: 'var(--text-muted)',
                fontSize: '13px'
                }}>
                Searching...
                </div>
            )}

            {results.map(food => (
                <div
                key={food.fdcId}
                style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginBottom: '8px',
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
                    <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                    }}>
                    {food.calories} cal per 100g
                    </div>
                </div>
                <button
                    onClick={() => handleSelectFood(food)}
                    style={{
                    padding: '5px 10px',
                    background: selectedFood?.fdcId === food.fdcId
                        ? 'var(--bg-secondary)'
                        : 'var(--accent)',
                    color: selectedFood?.fdcId === food.fdcId
                        ? 'var(--text-secondary)'
                        : 'var(--accent-text)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '12px'
                    }}
                >
                    {selectedFood?.fdcId === food.fdcId ? 'Selected' : 'Select'}
                </button>
                </div>
            ))}

            {/* Serving size panel */}
            {selectedFood && (
                <div style={{
                padding: '14px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                marginTop: '12px'
                }}>
                <div style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '12px'
                }}>
                    {selectedFood.name}
                </div>

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
                </div>

                {/* Serving Hints */}
                {selectedFood.householdServing &&(
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginBottom: '8px'
                    }}>
                        1 serving = {selectedFood.householdServing} ({selectedFood.servingSize}{selectedFood.servingSizeUnit})
                    </div>
                )}

                {/* Live preview */}
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
                    {[
                        { label: 'cal',     value: preview.calories, color: 'var(--error)' },
                        { label: 'protein', value: `${preview.protein}g`, color: 'var(--success)' },
                        { label: 'carbs',   value: `${preview.carbs}g`,   color: 'var(--warning)' },
                        { label: 'fat',     value: `${preview.fat}g`,     color: 'var(--purple)' }
                    ].map(macro => (
                        <div key={macro.label} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: macro.color
                        }}>
                            {macro.value}
                        </div>
                        <div style={{
                            fontSize: '10px',
                            color: 'var(--text-muted)'
                        }}>
                            {macro.label}
                        </div>
                        </div>
                    ))}
                    </div>
                )}

                <button
                    onClick={handleAddItem}
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
                    Add to meal
                </button>
                </div>
            )}
            </div>
        </div>

        {/* Save button */}
        <button
            onClick={handleSave}
            disabled={!name.trim() || items.length === 0 || createMeal.isPending}
            style={{
            width: '100%',
            padding: '12px',
            background: !name.trim() || items.length === 0
                ? 'var(--bg-secondary)'
                : 'var(--accent)',
            color: !name.trim() || items.length === 0
                ? 'var(--text-muted)'
                : 'var(--accent-text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: !name.trim() || items.length === 0 ? 'not-allowed' : 'pointer'
            }}
        >
            {createMeal.isPending ? 'Saving...' : 'Save Meal'}
        </button>
    </div>
  )
}