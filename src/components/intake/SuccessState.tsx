"use client";

import { Button } from "@/components/ui/Button";

interface SuccessStateProps {
  onStartOver: () => void;
  submitterName?: string;
}

export function SuccessState({ onStartOver, submitterName }: SuccessStateProps) {
  return (
    <div className="animate-slide-up text-center py-8 px-4">
      {/* Icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 ring-8 ring-teal-100">
        <svg
          className="h-10 w-10 text-teal-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Request Received!
      </h2>
      <p className="text-slate-600 mb-1 max-w-md mx-auto">
        {submitterName ? (
          <>
            Thank you, <strong>{submitterName}</strong>. Your intake request has been submitted successfully.
          </>
        ) : (
          "Your intake request has been submitted successfully."
        )}
      </p>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
        A member of our team will review your information and reach out within
        1–2 business days to discuss next steps.
      </p>

      {/* Reference number — fake for demo */}
      <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 mb-8">
        <svg
          className="h-4 w-4 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm text-slate-600">
          Reference:{" "}
          <span className="font-mono font-medium text-slate-900">
            {generateReferenceNumber()}
          </span>
        </span>
      </div>

      {/* Demo notice */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-8 max-w-md mx-auto">
        <p className="text-xs text-amber-700 font-medium">
          🧪 Demo Mode — No data was stored or transmitted. This is a portfolio demonstration only.
        </p>
      </div>

      <Button variant="secondary" onClick={onStartOver}>
        Start a new request
      </Button>
    </div>
  );
}

/** Generates a fake reference number for demo realism. */
function generateReferenceNumber(): string {
  const prefix = "CIF";
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}-${year}-${rand}`;
}
