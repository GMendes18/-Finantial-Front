import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              `w-full px-4 py-2.5 pr-10 rounded-lg
              appearance-none cursor-pointer
              bg-[var(--color-bg-secondary)]
              border border-[var(--color-surface-border)]
              text-[var(--color-text-primary)]
              transition-all duration-200
              focus:outline-none focus:border-[var(--color-accent)]
              focus:ring-2 focus:ring-[var(--color-accent)]/20
              disabled:opacity-50 disabled:cursor-not-allowed`,
              error && 'border-[var(--color-expense)]',
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
        </div>
        {error && (
          <p className="text-sm text-[var(--color-expense)]">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
