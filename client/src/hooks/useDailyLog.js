import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' 
import { getFoodLog, addFoodEntry, deleteFoodEntry, moveFoodEntry, copyMealFromYesterday } from '../api/foods.js' 

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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['summary', variables.date] })
      queryClient.invalidateQueries({ queryKey: ['foodLog', variables.date] })
      queryClient.refetchQueries({ queryKey: ['summary', variables.date] })
      queryClient.refetchQueries({ queryKey: ['foodLog', variables.date] })
    }
  })
}

export function useDeleteFood(date) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFoodEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary', date] })
      queryClient.invalidateQueries({ queryKey: ['foodLog', date] })
      queryClient.refetchQueries({ queryKey: ['summary', date] })
      queryClient.refetchQueries({ queryKey: ['foodLog', date] })
    }
  })
}

export function useMoveFood(date) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, meal }) => moveFoodEntry(id, meal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary', date] })
      queryClient.refetchQueries({ queryKey: ['summary', date] })
    }
  })
}

export function useCopyMeal(date) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ meal }) => copyMealFromYesterday(date, meal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary', date] })
      queryClient.refetchQueries({ queryKey: ['summary', date] })
    }
  })
}