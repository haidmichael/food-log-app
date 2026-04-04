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