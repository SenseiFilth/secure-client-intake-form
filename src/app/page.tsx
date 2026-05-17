import { IntakeForm } from "@/components/intake/IntakeForm";

export default function HomePage() {
  return (
    <main className="min-h-screen py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="text-center mb-8">
          {/* Logo / brand mark */}
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-md">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {/* Heart with pulse line — care/health motif */}
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Brightpath Home Care
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Client Intake Request
          </h1>
          <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
            Complete this short form to start the conversation. One of our care
            coordinators will follow up within 1–2 business days.
          </p>

          {/* Demo badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-medium text-violet-700">
              Portfolio Demo — No real data collected
            </span>
          </div>
        </header>

        {/* Form card */}
        <div className="rounded-2xl bg-white shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
          <IntakeForm />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            🔒 This form is secured with HTTPS. All communications are
            confidential.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Built by{" "}
            <a
              href="https://github.com/yourusername/secure-client-intake-form"
              className="text-brand-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Alex Brown
            </a>{" "}
            · Portfolio project · Not a real service
          </p>
        </footer>
      </div>
    </main>
  );
}
