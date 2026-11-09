export default function Loading() {
  return (
    <div className="container-x py-16" role="status" aria-label="Loading">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-accent-600" />
      <p className="mt-3 text-center text-sm text-slate-500">Loading...</p>
    </div>
  );
}
