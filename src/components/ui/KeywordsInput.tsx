import { useState, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Sparkles } from 'lucide-react'

interface KeywordsInputProps {
  value: string[]
  onChange: (keywords: string[]) => void
  placeholder?: string
  label?: string
  maxKeywords?: number
}

export function KeywordsInput({
  value = [],
  onChange,
  placeholder = 'Digite e pressione Enter...',
  label,
  maxKeywords = 20,
}: KeywordsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim().toLowerCase()
    if (trimmed && !value.includes(trimmed) && value.length < maxKeywords) {
      onChange([...value, trimmed])
      setInputValue('')
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    onChange(value.filter((k) => k !== keywordToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeKeyword(value[value.length - 1])
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          {label}
        </label>
      )}

      <div className="min-h-[80px] p-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-surface-border)] focus-within:border-[var(--color-accent)] transition-colors">
        {/* Keywords chips */}
        <div className="flex flex-wrap gap-2 mb-2">
          <AnimatePresence mode="popLayout">
            {value.map((keyword) => (
              <motion.span
                key={keyword}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/50 transition-colors"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[var(--color-accent)]/30 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        {value.length < maxKeywords && (
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
            />
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        {value.length}/{maxKeywords} palavras-chave
        {value.length === 0 && ' - Adicione termos para categorização automática'}
      </p>
    </div>
  )
}
