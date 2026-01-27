import { motion } from 'framer-motion'
import {
  Sparkles,
  AlertCircle,
  Lightbulb,
  Trophy,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { useInsights, useRefreshInsights } from '@/hooks/useInsights'
import { Card } from '@/components/ui'
import type { Insight } from '@/types'

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  'alert-circle': AlertCircle,
  lightbulb: Lightbulb,
  trophy: Trophy,
  'trending-up': TrendingUp,
}

// Type colors and backgrounds
const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
  alert: {
    bg: 'bg-[var(--color-expense)]/10',
    text: 'text-[var(--color-expense)]',
    border: 'border-[var(--color-expense)]/20',
  },
  tip: {
    bg: 'bg-[var(--color-accent)]/10',
    text: 'text-[var(--color-accent)]',
    border: 'border-[var(--color-accent)]/20',
  },
  achievement: {
    bg: 'bg-[var(--color-income)]/10',
    text: 'text-[var(--color-income)]',
    border: 'border-[var(--color-income)]/20',
  },
  trend: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'border-purple-500/20',
  },
}

export function InsightsWidget() {
  const { data, isLoading, isError } = useInsights()
  const refreshMutation = useRefreshInsights()

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              Insights do Mês
            </h3>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-border)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-[var(--color-surface-border)] rounded" />
                    <div className="h-3 w-full bg-[var(--color-surface-border)] rounded" />
                  </div>
                </div>
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
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              Insights do Mês
            </h3>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-muted)]">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p>Erro ao carregar insights</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
          </motion.div>
          <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
            Insights do Mês
          </h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="p-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-surface-border)] transition-colors disabled:opacity-50"
          title="Gerar novos insights"
        >
          <RefreshCw
            className={`w-4 h-4 text-[var(--color-text-muted)] ${refreshMutation.isPending ? 'animate-spin' : ''}`}
          />
        </motion.button>
      </div>

      <div className="space-y-3 flex-1">
        {data?.insights.map((insight, index) => (
          <InsightCard key={insight.id} insight={insight} index={index} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--color-surface-border)]">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center">
          Gerado em {new Date(data?.generatedAt || '').toLocaleString('pt-BR')}
        </p>
      </div>
    </Card>
  )
}

interface InsightCardProps {
  insight: Insight
  index: number
}

function InsightCard({ insight, index }: InsightCardProps) {
  const Icon = iconMap[insight.icon] || Lightbulb
  const styles = typeStyles[insight.type] || typeStyles.tip

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-xl border ${styles.bg} ${styles.border}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${styles.bg}`}>
          <Icon className={`w-4 h-4 ${styles.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--color-text-primary)] text-sm">
            {insight.title}
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
