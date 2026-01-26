import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Investment, InvestmentFormData, PortfolioSummary, ApiResponse } from '@/types'

export function useInvestments() {
  return useQuery({
    queryKey: ['investments'],
    queryFn: () => api.get<ApiResponse<Investment[]>>('/investments'),
    select: (data) => data.data,
  })
}

export function usePortfolio() {
  return useQuery({
    queryKey: ['investments', 'portfolio'],
    queryFn: () => api.get<ApiResponse<PortfolioSummary>>('/investments/portfolio'),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}

export function useCreateInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InvestmentFormData) =>
      api.post<ApiResponse<Investment>>('/investments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvestmentFormData> }) =>
      api.put<ApiResponse<Investment>>(`/investments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete<ApiResponse<void>>(`/investments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}
