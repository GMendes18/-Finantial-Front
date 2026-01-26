import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, X, Zap } from 'lucide-react'
import type { CategorySuggestion as CategorySuggestionType } from '@/types'

interface CategorySuggestionProps {
  suggestion: CategorySuggestionType | null
  isLoading: boolean
  onAccept: () => void
  onDismiss: () => void
  categoryColor?: string
}

export function CategorySuggestion({
  suggestion,
  isLoading,
  onAccept,
  onDismiss,
  categoryColor = 'var(--color-accent)',
}: CategorySuggestionProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-surface-border)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
            </motion.div>
            <span className="text-sm text-[var(--color-text-muted)]">
              Analisando descrição...
            </span>
          </div>
        </motion.div>
      )}

      {!isLoading && suggestion && (
        <motion.div
          key="suggestion"
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="overflow-hidden"
        >
          <div
            className="relative p-3 rounded-lg border-2 transition-all"
            style={{
              borderColor: `${categoryColor}40`,
              backgroundColor: `${categoryColor}08`,
            }}
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-lg opacity-20 blur-xl"
              style={{ backgroundColor: categoryColor }}
            />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ backgroundColor: `${categoryColor}20` }}
                >
                  <Zap className="w-5 h-5" style={{ color: categoryColor }} />
                </motion.div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                      Sugestão automática
                    </span>
                    <ConfidenceBadge confidence={suggestion.confidence} />
                  </div>
                  <p className="font-semibold text-[var(--color-text-primary)] truncate">
                    {suggestion.categoryName}
                  </p>
                  {suggestion.matchedKeyword && (
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Detectado: <span className="text-[var(--color-accent)]">"{suggestion.matchedKeyword}"</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAccept}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-income)] text-white shadow-lg shadow-[var(--color-income)]/30 hover:shadow-[var(--color-income)]/50 transition-shadow"
                >
                  <Check className="w-5 h-5" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDismiss}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-surface-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-surface-border-hover)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  let color = 'var(--color-text-muted)'
  let label = 'Baixa'

  if (confidence >= 80) {
    color = 'var(--color-income)'
    label = 'Alta'
  } else if (confidence >= 60) {
    color = 'var(--color-accent)'
    label = 'Média'
  }

  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      {label} ({confidence}%)
    </span>
  )
}
