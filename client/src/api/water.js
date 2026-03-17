import axiosClient from './axiosClient'

export const getWaterLog = async (date) => {
    const response = await axiosClient.get(`/api/foods/${date}`) 
    return response.data 
}

export const addWaterLog = async (data) => {
    const response = await axiosClient.post('/api/water', data) 
    return response.data 
}