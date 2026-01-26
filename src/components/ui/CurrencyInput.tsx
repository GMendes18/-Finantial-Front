import { forwardRef } from "react";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  label?: string;
  error?: string;
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, className, value, onValueChange, placeholder = "R$ 0,00", disabled }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <NumericFormat
          getInputRef={ref}
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          value={value}
          onValueChange={(values) => {
            onValueChange?.(values.floatValue);
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            `w-full px-4 py-2.5 rounded-lg
            bg-[var(--color-bg-secondary)]
            border border-[var(--color-surface-border)]
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            focus:outline-none focus:border-[var(--color-accent)]
            transition-colors text-lg font-semibold tabular-nums`,
            error && "border-[var(--color-expense)] focus:border-[var(--color-expense)]",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        />
        {error && (
          <p className="text-sm text-[var(--color-expense)]">{error}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
