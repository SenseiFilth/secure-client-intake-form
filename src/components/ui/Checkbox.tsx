import { cn } from "@/lib/utils";
import { type ReactNode, InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string | ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="flex items-start gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center mt-0.5 shrink-0">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className={cn(
                "h-5 w-5 rounded border-2 appearance-none cursor-pointer",
                "transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                error
                  ? "border-red-400 checked:bg-red-500 checked:border-red-500"
                  : "border-slate-300 checked:bg-brand-600 checked:border-brand-600 group-hover:border-brand-400",
                className
              )}
              {...props}
            />
            {/* Custom checkmark — rendered via CSS when checked */}
            <svg
              className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path d="M2 6l3 3 5-5" />
            </svg>
          </div>
          <span className="text-sm text-slate-700 leading-snug">{label}</span>
        </label>
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-1.5 text-xs text-red-600 flex items-center gap-1 ml-8"
          >
            <svg
              className="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
