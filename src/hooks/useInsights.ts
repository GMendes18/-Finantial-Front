import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { InsightsData, ApiResponse } from '@/types'

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: () => api.get<ApiResponse<InsightsData>>('/insights'),
    select: (data) => data.data,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useRefreshInsights() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.get<ApiResponse<InsightsData>>('/insights?refresh=true'),
    onSuccess: (data) => {
      queryClient.setQueryData(['insights'], data)
    },
  })
}
