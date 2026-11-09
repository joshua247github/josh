"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x py-16 text-center">
      <p className="text-4xl" aria-hidden>⚠️</p>
      <h1 className="mt-3 text-xl font-extrabold text-brand-900">Something went wrong</h1>
      <p className="mt-1 text-sm text-slate-500">Please try again. If it keeps happening, message us on WhatsApp.</p>
      <button onClick={reset} className="btn-primary mt-5">
        Try again
      </button>
    </div>
  );
}
