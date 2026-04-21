import { useQuery } from '@tanstack/react-query'
import { getDailySummary } from '../api/summary.js'

export function useSummary(date) {
    return useQuery({
        queryKey: ['summary', date], 
        queryFn: () => getDailySummary(date),
        enabled: !!date, 
        retry: false
    })
}