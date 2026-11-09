import type { Metadata } from "next";
import PurchaseForm from "@/components/PurchaseForm";
import { getSession } from "@/lib/auth";
import { NETWORKS } from "@/lib/constants";
import { getPlans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Buy Cheap Data",
  description: "Buy MTN, Airtel, Glo and 9mobile data bundles at cheap prices with instant delivery.",
};

type SP = { network?: string; plan?: string; q?: string };

export default async function DataPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [plans, { user, profile }] = await Promise.all([getPlans(), getSession()]);
  const network = NETWORKS.find((n) => n === sp.network);

  return (
    <div className="container-x py-8">
      <h1 className="mb-1 text-center text-2xl font-extrabold text-brand-900">Buy Data</h1>
      <p className="mb-6 text-center text-sm text-slate-500">Pick a network and plan, then pay from your wallet.</p>
      <PurchaseForm
        service="data"
        plans={plans}
        initialNetwork={network}
        initialPlanId={sp.plan}
        initialQuery={sp.q}
        isLoggedIn={Boolean(user)}
        balance={profile?.wallet_balance ?? 0}
      />
    </div>
  );
}
