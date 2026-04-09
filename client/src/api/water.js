import axiosClient from './axiosClient.js'

export const getWaterLog = async (date) => {
    const response = await axiosClient.get(`/api/water/${date}`) 
    return response.data 
}

export const addWaterEntry = async (data) => {
    const response = await axiosClient.post('/api/water', data) 
    return response.data 
}