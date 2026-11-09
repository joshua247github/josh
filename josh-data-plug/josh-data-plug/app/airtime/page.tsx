import type { Metadata } from "next";
import PurchaseForm from "@/components/PurchaseForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Buy Airtime",
  description: "Top up MTN, Airtel, Glo and 9mobile airtime instantly.",
};

export default async function AirtimePage() {
  const { user, profile } = await getSession();

  return (
    <div className="container-x py-8">
      <h1 className="mb-1 text-center text-2xl font-extrabold text-brand-900">Buy Airtime</h1>
      <p className="mb-6 text-center text-sm text-slate-500">Instant top-up for any Nigerian network.</p>
      <PurchaseForm
        service="airtime"
        isLoggedIn={Boolean(user)}
        balance={profile?.wallet_balance ?? 0}
      />
    </div>
  );
}
