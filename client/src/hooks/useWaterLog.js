import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWaterLog, addWaterEntry } from '../api/water.js'

export function useWaterLog(date) {
    return useQuery({
        queryKey: ['waterLog', date], 
        queryFn: () => getWaterLog(date), 
        enabled: !!date
    })
}

export function useAddWater() {
    const queryClient = useQueryClient() 
    return useMutation({
        mutationFn: addWaterEntry, 
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['waterLog', variables.date]})
            queryClient.invalidateQueries({ queryKey: ['summary', variables.date]})
        }
    })
}