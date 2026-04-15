import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSavedMeals, createSavedMeal, deleteSavedMeal, logSavedMeal } from '../api/savedMeals.js'

export function useSavedMeals() {
    return useQuery({
        queryKey: ['savedMeals'], 
        queryFn: getSavedMeals
    })
}

export function useCreateSavedMeal() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createSavedMeal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savedMeals']})
        }
    })
}

export function useDeleteSavedMeal() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteSavedMeal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savedMeals']})
        }
    })
}

export function useLogSavedMeal(date) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: logSavedMeal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summary', date]})
            queryClient.refetchQueries({ queryKey: ['summary', date]})
        }
    })
}