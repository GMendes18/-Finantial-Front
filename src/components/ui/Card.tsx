import { forwardRef, type HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'income' | 'expense' | 'accent'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const glowVariants = {
      default: '',
      income: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]',
      expense: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]',
      accent: 'hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]',
    }

    const borderVariants = {
      default: 'border-[var(--color-surface-border)]',
      income: 'border-[var(--color-income)]/20',
      expense: 'border-[var(--color-expense)]/20',
      accent: 'border-[var(--color-accent)]/20',
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          `rounded-xl p-6
          bg-[var(--color-surface)]
          backdrop-blur-xl
          border
          transition-all duration-300`,
          borderVariants[variant],
          hover && `cursor-pointer hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-surface-border-hover)] ${glowVariants[variant]}`,
          className
        )}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

export { Card }
