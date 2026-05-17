import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, showCount, maxLength, className, value, ...props }, ref) => {
    const currentLength =
      typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          className={cn(
            "w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900",
            "bg-white placeholder:text-slate-400 resize-y min-h-[100px]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
            error
              ? "border-red-400 focus:ring-red-400 focus:border-red-400"
              : "border-slate-300 hover:border-slate-400",
            "disabled:cursor-not-allowed disabled:bg-slate-50",
            className
          )}
          {...props}
        />
        <div className="flex items-start justify-between mt-1.5 gap-2">
          {error ? (
            <p
              id={`${props.id}-error`}
              role="alert"
              className="text-xs text-red-600 flex items-center gap-1"
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
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <span
              className={cn(
                "text-xs shrink-0",
                currentLength >= maxLength ? "text-red-500" : "text-slate-400"
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
