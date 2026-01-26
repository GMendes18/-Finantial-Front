import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, Euro, PoundSterling } from 'lucide-react'
import { useExchangeWidget } from '@/hooks/useExchangeRates'
import { Card } from '@/components/ui'

// Currency icons mapping
const currencyIcons: Record<string, React.ElementType> = {
  USD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
}

// Currency names
const currencyNames: Record<string, string> = {
  USD: 'Dólar',
  EUR: 'Euro',
  GBP: 'Libra',
}

// Mini sparkline component
function Sparkline({ data, trend }: { data: number[]; trend: 'up' | 'down' }) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60
    const y = 20 - ((value - min) / range) * 18
    return `${x},${y}`
  }).join(' ')

  const color = trend === 'up' ? 'var(--color-income)' : 'var(--color-expense)'

  return (
    <svg width="60" height="24" viewBox="0 0 60 24" className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-${trend}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Area under the line */}
      <polygon
        fill={`url(#sparkline-${trend})`}
        points={`0,24 ${points} 60,24`}
        opacity="0.5"
      />
    </svg>
  )
}

export function ExchangeWidget() {
  const { data, isLoading, isError, refetch, isFetching } = useExchangeWidget()

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            Cotações
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-border)]" />
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-[var(--color-surface-border)] rounded" />
                    <div className="h-3 w-12 bg-[var(--color-surface-border)] rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-[var(--color-surface-border)] rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            Cotações
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-muted)]">
          <p className="mb-2">Erro ao carregar cotações</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            Cotações
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            Base: {data?.base} • {data?.date}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => refetch()}
          className="p-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-surface-border)] transition-colors"
          title="Atualizar cotações"
        >
          <RefreshCw
            className={`w-4 h-4 text-[var(--color-text-muted)] ${isFetching ? 'animate-spin' : ''}`}
          />
        </motion.button>
      </div>

      <div className="space-y-2">
        {data?.currencies.map((currency, index) => {
          const Icon = currencyIcons[currency.symbol] || DollarSign
          const name = currencyNames[currency.symbol] || currency.symbol
          const TrendIcon = currency.trend === 'up' ? TrendingUp : TrendingDown
          const trendColor = currency.trend === 'up' ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'

          return (
            <motion.div
              key={currency.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-tertiary)]/50 hover:bg-[var(--color-bg-tertiary)] transition-all cursor-default"
            >
              <div className="flex items-center gap-3">
                {/* Currency Icon */}
                <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--color-accent)]" />
                </div>

                {/* Currency Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {currency.symbol}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${trendColor}`}>
                      {currency.variation >= 0 ? '+' : ''}{currency.variation.toFixed(2)}%
                    </span>
                    <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                  </div>
                </div>
              </div>

              {/* Sparkline + Value */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:block opacity-60 group-hover:opacity-100 transition-opacity">
                  <Sparkline data={currency.sparkline} trend={currency.trend} />
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg tabular-nums text-[var(--color-text-primary)]">
                    {currency.inverseRate.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">
                    1 {currency.symbol} = R$ {currency.inverseRate.toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--color-surface-border)]">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center">
          Dados via Frankfurter API • Atualização a cada 30 min
        </p>
      </div>
    </Card>
  )
}
