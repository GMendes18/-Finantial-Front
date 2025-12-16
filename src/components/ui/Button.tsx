import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'income' | 'expense'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center gap-2
      font-medium font-[family-name:var(--font-display)]
      rounded-lg transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    const variants = {
      primary: `
        bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)]
        text-[var(--color-text-inverse)]
        hover:brightness-110 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]
        active:scale-[0.98]
      `,
      secondary: `
        bg-[var(--color-bg-elevated)]
        text-[var(--color-text-primary)]
        border border-[var(--color-surface-border)]
        hover:bg-[var(--color-bg-hover)]
        hover:border-[var(--color-surface-border-hover)]
      `,
      ghost: `
        text-[var(--color-text-secondary)]
        hover:text-[var(--color-text-primary)]
        hover:bg-[var(--color-bg-tertiary)]
      `,
      danger: `
        bg-[var(--color-expense)]
        text-white
        hover:brightness-110 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]
        active:scale-[0.98]
      `,
      income: `
        bg-gradient-to-r from-[var(--color-income)] to-[var(--color-income-dark)]
        text-white
        hover:brightness-110 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]
        active:scale-[0.98]
      `,
      expense: `
        bg-gradient-to-r from-[var(--color-expense)] to-[var(--color-expense-dark)]
        text-white
        hover:brightness-110 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]
        active:scale-[0.98]
      `,
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
