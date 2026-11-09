import Link from "next/link";
import { formatNaira } from "@/lib/format";
import type { Plan } from "@/lib/types";

const NETWORK_STYLE: Record<string, string> = {
  MTN: "bg-yellow-100 text-yellow-800",
  Airtel: "bg-red-100 text-red-700",
  Glo: "bg-brand-100 text-brand-700",
  "9mobile": "bg-emerald-100 text-emerald-800",
};

export default function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article className="card flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-accent-500">
      <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${NETWORK_STYLE[plan.network] ?? "bg-slate-100"}`}>
        {plan.network}
      </span>
      <p className="mt-3 text-2xl font-extrabold text-brand-900">{plan.size}</p>
      <p className="text-xs text-slate-500">Valid for {plan.validity}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-lg font-bold text-accent-600">{formatNaira(plan.price)}</p>
        <Link
          href={`/data?plan=${plan.id}`}
          className="btn-primary px-3 py-1.5"
          aria-label={`Buy ${plan.network} ${plan.size} for ${formatNaira(plan.price)}`}
        >
          Buy
        </Link>
      </div>
    </article>
  );
}
