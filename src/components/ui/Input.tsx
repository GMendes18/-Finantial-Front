import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              `w-full px-4 py-2.5 rounded-lg
              bg-[var(--color-bg-secondary)]
              border border-[var(--color-surface-border)]
              text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-muted)]
              transition-all duration-200
              focus:outline-none focus:border-[var(--color-accent)]
              focus:ring-2 focus:ring-[var(--color-accent)]/20
              disabled:opacity-50 disabled:cursor-not-allowed`,
              icon && 'pl-10',
              error && 'border-[var(--color-expense)] focus:border-[var(--color-expense)] focus:ring-[var(--color-expense)]/20',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-[var(--color-expense)]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
