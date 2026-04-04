import axiosClient from './axiosClient.js'

export const getDailySummary = async (date) => {
  const response = await axiosClient.get(`/api/summary/${date}`)
  return response.data
}