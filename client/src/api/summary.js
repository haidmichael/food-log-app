import axiosClient from './axiosClient'

export const getDailySummary = async (date) => {
    const response = await axiosClient.get(`/api/foods/${date}`) 
    return response.data 
}