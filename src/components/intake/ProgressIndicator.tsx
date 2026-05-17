"use client";

import { cn } from "@/lib/utils";
import { STEP_TITLES } from "@/lib/schemas/intake-schema";

interface ProgressIndicatorProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  const progressPercent = Math.round(((currentStep) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full">
      {/* Step labels — visible on md+ screens */}
      <div className="hidden md:flex items-center justify-between mb-3">
        {STEP_TITLES.map((title, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={title} className="flex flex-col items-center gap-1 flex-1">
              {/* Circle */}
              <div
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold",
                  "transition-all duration-300 border-2",
                  isCompleted
                    ? "bg-brand-600 border-brand-600 text-white"
                    : isCurrent
                    ? "bg-white border-brand-600 text-brand-700"
                    : "bg-white border-slate-300 text-slate-400"
                )}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium text-center leading-tight max-w-[80px]",
                  isCurrent
                    ? "text-brand-700"
                    : isCompleted
                    ? "text-brand-600"
                    : "text-slate-400"
                )}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-1.5 w-full rounded-full bg-slate-200">
          <div
            className="h-1.5 rounded-full bg-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Step ${currentStep + 1} of ${totalSteps}: ${STEP_TITLES[currentStep]}`}
          />
        </div>
      </div>

      {/* Mobile: show current step text */}
      <div className="md:hidden mt-2 flex items-center justify-between">
        <p className="text-sm font-medium text-brand-700">
          {STEP_TITLES[currentStep]}
        </p>
        <p className="text-xs text-slate-500">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
