import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' 
import { getMacroGoals, setMacroGoals } from '../api/macros.js' 

export function useMacroGoals() {
    return useQuery({
        queryKey: ['macroGoals'], 
        queryFn: getMacroGoals,
        retry: false
    })
}

export function useSetMacroGoals() {
    const queryClient = useQueryClient() 
    return useMutation({
        mutationFn: setMacroGoals, 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['macroGoals'] })
            queryClient.invalidateQueries({ queryKey: ['summary'] })
        }
    })
}