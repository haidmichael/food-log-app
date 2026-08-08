import axiosClient from './axiosClient.js'

export const searchCommunityFoods = async (query) => {
    const response = await axiosClient.get(`/api/community-foods/search?query=${query}`)
    return response.data
}

export const saveCommunityFood = async (food) => {
    const response = await axiosClient.post('/api/community-foods/', food)
    return response.data
}

export const incrementCommunityFoodUseCount = async (id) => {
    const response = await axiosClient.patch(`/api/community-foods/${id}/use`)
    return response.data
}