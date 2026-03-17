import axiosClient from './axiosClient'

export const getMacroGoals = async () => {
    const response = await axiosClient.get('/api/macros') 
    return response.data 
}

export const setMacroGoals = async (data) => {
    const response = await axiosClient.post('/api/macros', data) 
    return response.data 
}