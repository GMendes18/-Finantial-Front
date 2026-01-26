import { forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import "react-datepicker/dist/react-datepicker.css";

// Registrar locale português
registerLocale("pt-BR", ptBR);

interface DatePickerInputProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (date: string) => void;
  className?: string;
  placeholder?: string;
}

const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  ({ label, error, value, onChange, className, placeholder = "Selecione a data" }, ref) => {
    const selectedDate = value ? new Date(value + "T00:00:00") : null;

    const handleChange = (date: Date | null) => {
      if (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        onChange?.(`${year}-${month}-${day}`);
      } else {
        onChange?.("");
      }
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          <DatePicker
            ref={ref as any}
            selected={selectedDate}
            onChange={handleChange}
            locale="pt-BR"
            dateFormat="dd/MM/yyyy"
            placeholderText={placeholder}
            showPopperArrow={false}
            popperPlacement="bottom-start"
            className={cn(
              `w-full px-4 py-2.5 pl-11 rounded-lg
              bg-[var(--color-bg-secondary)]
              border border-[var(--color-surface-border)]
              text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-muted)]
              focus:outline-none focus:border-[var(--color-accent)]
              transition-colors cursor-pointer`,
              error && "border-[var(--color-expense)] focus:border-[var(--color-expense)]",
              className
            )}
            wrapperClassName="w-full"
            calendarClassName="!bg-[var(--color-bg-secondary)] !border-[var(--color-surface-border)] !rounded-xl shadow-xl"
            dayClassName={() =>
              "!text-[var(--color-text-primary)] hover:!bg-[var(--color-bg-tertiary)] !rounded-lg"
            }
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
        </div>
        {error && (
          <p className="text-sm text-[var(--color-expense)]">{error}</p>
        )}
      </div>
    );
  }
);

DatePickerInput.displayName = "DatePickerInput";

export { DatePickerInput };
