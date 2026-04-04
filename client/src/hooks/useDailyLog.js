import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' 
import { getFoodLog, addFoodEntry, deleteFoodEntry } from '../api/foods.js' 

export function useFoodLog(date) {
    return useQuery({
        queryKey: ['foodLog', date], 
        queryFn: () => getFoodLog(date),
        enabled: !!date 
    })
}

export function useAddFood() {
    const queryClient = useQueryClient() 
    return useMutation({
        mutationFn: addFoodEntry, 
        onSuccess: (_, variables) => {
            console.log('onSuccess fired, date:', variables.date)
            queryClient.invalidateQueries({ queryKey: ['foodLog', variables.date]})
            queryClient.invalidateQueries({ queryKey: ['summary', variables.date]})
        },
        onError: (error) => {
            console.log('mutation error:', error)
        }
    })
}

export function useDeleteFood(date) {
    const queryClient = useQueryClient() 
    return useMutation({
        mutationFn: deleteFoodEntry, 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['foodLog', date]})
            queryClient.invalidateQueries({ queryKey: ['summary', date]})
        }
    })
}