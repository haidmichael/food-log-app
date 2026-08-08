import { useState } from "react"
import { parseFoodWithAI } from '../api/foods.js'
import { addFoodEntry } from "../api/foods.js"
import { saveCommunityFood } from '../api/communityFoods.js'

export function useAIFoodLog(date, onSuccess) {
    const [step, setStep] = useState('idle')
    const [description, setDescription] = useState('')
    const [parsedFoods, setParsedFoods] = useState([])
    const [error, setError] = useState(null)

    const parse = async () => {
        if (!description.trim()) return
        setStep('loading')
        setError(null)
        try {
            const data = await parseFoodWithAI(description)
            setParsedFoods(data.foods.map((food, i) => ({
                ...food,
                tempId: i,
                editing: false
            })))
            setStep('review')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to find food. Try again')
            setStep('typing')
        }
    }

    const updateFood = (tempId, field, value) => {
        setParsedFoods(prev => prev.map(food => 
            food.tempId === tempId ? { ...food, [field]: value } : food
        ))
    }

    const removeFood = (tempId) => {
        setParsedFoods(prev => prev.filter(food => food.tempId !== tempId))
    }

    // const confirmAll = async (meal) => {
    //     setStep('confirming')
    //     try {
    //         await Promise.all(parsedFoods.map(food => 
    //             addFoodEntry({
    //                 date, 
    //                 meal,
    //                 foodName: food.foodName,
    //                 servingSize: Number(food.servingSize),
    //                 servingUnit: food.servingUnit,
    //                 calories: Number(food.calories),
    //                 protein: Number(food.protein),
    //                 carbs: Number(food.carbs),
    //                 fat: Number(food.fat)
    //             })
    //         ))
    //         setStep('done')
    //         onSuccess()
    //         reset()
    //     } catch (err) {
    //         setError('Failed to log some foods. Please try again.')
    //         setStep('review')
    //     }
    // }

    const confirmAll = async (meal) => {
        setStep('confirming')
        try {
            await Promise.all(parsedFoods.map(async food => {
            // Log to FoodLog
            await addFoodEntry({
                date,
                meal,
                foodName:    food.foodName,
                servingSize: Number(food.servingSize),
                servingUnit: food.servingUnit,
                calories:    Number(food.calories),
                protein:     Number(food.protein),
                carbs:       Number(food.carbs),
                fat:         Number(food.fat)
            })

            // Also save to community foods
            await saveCommunityFood({
                name:        food.foodName,
                brand:       null,
                servingSize: Number(food.servingSize),
                servingUnit: food.servingUnit,
                calories:    Number(food.calories),
                protein:     Number(food.protein),
                carbs:       Number(food.carbs),
                fat:         Number(food.fat),
                source:      'ai_verified'
            }).catch(err => console.error('Community food save failed:', err))
            }))

            setStep('done')
            onSuccess()
            reset()
        } catch (err) {
            console.error('confrimAll error:', err)
            setError('Failed to log some foods. Please try again.')
            setStep('review')
        }
    }

    const reset = () => {
        setStep('idle')
        setDescription('')
        setParsedFoods([])
        setError(null)
    }

    return {
        step, description, setDescription, parsedFoods, error, parse, updateFood, removeFood, confirmAll, reset
    }
}