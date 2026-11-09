import type { Metadata } from "next";
import Link from "next/link";
import PurchaseForm from "@/components/PurchaseForm";
import { getSession } from "@/lib/auth";
import { BILL_PROVIDERS, type Service } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pay Bills",
  description: "Pay cable TV, electricity and buy WAEC, NECO and JAMB pins.",
};

const TABS: { type: keyof typeof BILL_PROVIDERS; label: string }[] = [
  { type: "cable", label: "Cable TV" },
  { type: "electricity", label: "Electricity" },
  { type: "exam", label: "Exam Pins" },
];

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const type = (TABS.find((t) => t.type === sp.type)?.type ?? "cable") as keyof typeof BILL_PROVIDERS;
  const { user, profile } = await getSession();

  return (
    <div className="container-x py-8">
      <h1 className="mb-4 text-center text-2xl font-extrabold text-brand-900">Pay Bills</h1>

      <nav aria-label="Bill type" className="mx-auto mb-6 flex max-w-lg gap-2">
        {TABS.map((t) => (
          <Link
            key={t.type}
            href={`/bills?type=${t.type}`}
            aria-current={t.type === type ? "page" : undefined}
            className={`flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold ${
              t.type === type
                ? "bg-accent-600 text-white"
                : "border border-brand-100 bg-white text-brand-700 hover:bg-accent-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <PurchaseForm
        key={type}
        service={type as Service}
        providers={BILL_PROVIDERS[type]}
        isLoggedIn={Boolean(user)}
        balance={profile?.wallet_balance ?? 0}
      />
    </div>
  );
}
