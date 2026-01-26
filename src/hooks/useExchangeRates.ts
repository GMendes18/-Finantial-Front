import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ExchangeWidgetData, ApiResponse } from '@/types'

interface ExchangeFilters {
  base?: string
  symbols?: string
}

export function useExchangeWidget(filters: ExchangeFilters = {}) {
  const params = {
    base: filters.base || 'BRL',
    symbols: filters.symbols || 'USD,EUR,GBP',
  }

  return useQuery({
    queryKey: ['exchange', 'widget', params],
    queryFn: () => api.get<ApiResponse<ExchangeWidgetData>>('/exchange/widget', params),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}
