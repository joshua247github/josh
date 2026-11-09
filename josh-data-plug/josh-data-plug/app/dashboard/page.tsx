import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import FundWallet from "@/components/FundWallet";
import ProfileForm from "@/components/ProfileForm";
import StatusBadge from "@/components/StatusBadge";
import { getSession } from "@/lib/auth";
import { formatDate, formatNaira } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order, Transaction } from "@/lib/types";

export const metadata: Metadata = { title: "My Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/login?next=/dashboard");

  const supabase = await createClient();
  const [{ data: orders }, { data: txs }] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <div className="container-x space-y-6 py-8">
      {/* Wallet */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 p-6 text-white shadow-card">
        <p className="text-sm text-white/80">Hi {profile?.full_name ?? "there"} 👋</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-white/70">Wallet balance</p>
        <p className="text-4xl font-extrabold">{formatNaira(profile?.wallet_balance ?? 0)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/data" className="btn bg-white text-brand-700 hover:bg-accent-50">Buy data</Link>
          <Link href="/airtime" className="btn bg-white/20 text-white hover:bg-white/30">Buy airtime</Link>
          <Link href="/bills" className="btn bg-white/20 text-white hover:bg-white/30">Pay bills</Link>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section id="fund" className="card scroll-mt-24 p-5">
          <h2 className="mb-3 text-lg font-extrabold text-brand-900">Fund wallet</h2>
          <FundWallet />
        </section>

        <section id="profile" className="card scroll-mt-24 p-5">
          <h2 className="mb-3 text-lg font-extrabold text-brand-900">Profile</h2>
          <ProfileForm
            userId={user.id}
            email={user.email ?? ""}
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? ""}
          />
        </section>
      </div>

      {/* Orders */}
      <section id="orders" className="card scroll-mt-24 p-5">
        <h2 className="mb-3 text-lg font-extrabold text-brand-900">Recent orders</h2>
        {!orders || orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet. Your purchases will show here.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(orders as Order[]).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold capitalize">{o.network} {o.service}</p>
                  <p className="text-xs text-slate-500">{o.phone_number} · {formatDate(o.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatNaira(o.amount)}</p>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Transactions */}
      <section id="transactions" className="card scroll-mt-24 p-5">
        <h2 className="mb-3 text-lg font-extrabold text-brand-900">Transaction history</h2>
        {!txs || txs.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(txs as Transaction[]).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold capitalize">{t.type}</p>
                  <p className="text-xs text-slate-500">{t.reference} · {formatDate(t.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.type === "purchase" ? "text-slate-800" : "text-brand-700"}`}>
                    {t.type === "purchase" ? "−" : "+"}{formatNaira(t.amount)}
                  </p>
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
