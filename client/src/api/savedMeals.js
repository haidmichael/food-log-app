import axiosClient from './axiosClient.js'

export const getSavedMeals = async () => {
    const response = await axiosClient.get('/api/saved-meals')
    return response.data
}

export const createSavedMeal = async (data) => {
    const response = await axiosClient.post('/api/saved-meals', data)
    return response.data
}

export const saveLoggedMealAsTemplate = async ({ date, meal, name, description }) => {
    const response = await axiosClient.post('/api/foods/save-as-meal', {date, meal, name, description })
    return response.data
}

export const deleteSavedMeal = async (id) => {
    const response = await axiosClient.delete(`/api/saved-meals/${id}`)
    return response.data
}

export const logSavedMeal = async ({ id, date, meal }) => {
    const response = await axiosClient.post(`/api/saved-meals/${id}/log`, { date, meal })
    return response.data
}