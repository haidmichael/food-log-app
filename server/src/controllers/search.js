export const searchFoods = async (req, res) => {
    try {
        const { query } = req.query

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 charecters' })
        }

        const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${process.env.USDA_API_KEY}`
        )

        if (!response.ok) {
            throw new Error('USDA API request failed')
        }
        
        const data = await response.json()
        // console.log('USDA first result: ', JSON.stringify(data.foods[0], null, 2))
        
        const foods = data.foods.map(food => ({
            fdcId: food.fdcId, 
            name: food.description, 
            brand: food.brandOwner || null,
            servingSize: food.servingSize || 100,
            servingUnit: food.servingUnit || 'g',
            householdServing: food.householdServingFullText || null,
            calories: getNutrient(food.foodNutrients, 1008), 
            protein:  getNutrient(food.foodNutrients, 1003),
            carbs: getNutrient(food.foodNutrients, 1005),
            fat: getNutrient(food.foodNutrients, 1004)
        }))

        res.json({ foods })
        
    } catch (err) {
        console.error(err) 
        res.status(500).json({ error: 'Food search failed' })
    }
}

//##### Helper function to extract nutrient value by nutrient ID #####
function getNutrient(nutrients, nutrientId) {
    const nutrient = nutrients.find(n => n.nutrientId === nutrientId)
    return nutrient ? Math.round(nutrient.value * 10) / 10 : 0
}