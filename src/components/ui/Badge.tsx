import { cn } from '@/lib/utils'
import type { CategoryType } from '@/types'

interface BadgeProps {
  type: CategoryType
  children: React.ReactNode
  className?: string
}

export function Badge({ type, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`,
        type === 'INCOME'
          ? 'bg-[var(--color-income)]/10 text-[var(--color-income)]'
          : 'bg-[var(--color-expense)]/10 text-[var(--color-expense)]',
        className
      )}
    >
      {children}
    </span>
  )
}
