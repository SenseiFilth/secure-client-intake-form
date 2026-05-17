"use client";

import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "Something went wrong while submitting your request.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="animate-slide-up rounded-xl bg-red-50 border border-red-200 p-6">
      <div className="flex gap-4">
        {/* Icon */}
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-5 w-5 text-red-600"
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
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            Submission Failed
          </h3>
          <p className="text-sm text-red-700 mb-4">{message}</p>
          <p className="text-xs text-red-600 mb-4">
            Your information has not been lost. Please try again — if the
            problem continues, contact us directly.
          </p>
          <Button variant="danger" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
