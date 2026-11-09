const STYLES: Record<string, string> = {
  success: "bg-brand-100 text-brand-700",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-accent-100 text-accent-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
