import axiosClient from './axiosClient.js'

export const getFoodLog = async (date) => {
    const response = await axiosClient.get(`/api/foods/${date}`) 
    return response.data 
}

export const addFoodEntry = async (data) => {
    const response = await axiosClient.post('/api/foods', data) 
    return response.data 
}

export const deleteFoodEntry = async (id) => {
    const response = await axiosClient.delete(`/api/foods/${id}`) 
    return response.data 
}

export const searchFoods = async (query) => {
    const response = await axiosClient.get(`/api/search?query=${query}`) 
    return response.data 
}

export const moveFoodEntry = async (id, meal) => {
    const response = await axiosClient.patch(`/api/foods/${id}`, { meal })
    return response.data
}

export const copyMealFromYesterday = async (date, meal) => {
    const response = await axiosClient.post('/api/foods/copy', { date, meal })
    return response.data
}

export const parseFoodWithAI = async (description) => {
    const response = await axiosClient.post('/api/ai/parse-food', { description })
    return response.data
}