import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { getSession } from "@/lib/auth";
import { NETWORKS } from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Announcement, Order, Plan, Profile, Transaction } from "@/lib/types";
import {
  addAnnouncement,
  deletePlan,
  resolveOrder,
  savePlan,
  toggleAnnouncement,
} from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function PlanFields({ plan }: { plan?: Plan }) {
  return (
    <>
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <select name="network" defaultValue={plan?.network ?? "MTN"} className="input !w-auto" aria-label="Network">
        {NETWORKS.map((n) => <option key={n}>{n}</option>)}
      </select>
      <input name="name" defaultValue={plan?.name} placeholder="Plan name" className="input !w-44" aria-label="Plan name" required />
      <input name="size" defaultValue={plan?.size} placeholder="1GB" className="input !w-20" aria-label="Size" required />
      <input name="validity" defaultValue={plan?.validity} placeholder="30 days" className="input !w-24" aria-label="Validity" required />
      <input name="price" type="number" step="0.01" min="1" defaultValue={plan?.price} placeholder="Price" className="input !w-24" aria-label="Price" required />
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" name="active" defaultChecked={plan?.active ?? true} /> Active
      </label>
    </>
  );
}

export default async function AdminPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/login?next=/admin");
  if (profile?.role !== "admin") redirect("/");

  const db = createAdminClient();
  const [plans, users, orders, txs, notes] = await Promise.all([
    db.from("plans").select("*").order("network").order("price"),
    db.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("announcements").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  const totalWallets = ((users.data ?? []) as Profile[]).reduce((s, u) => s + Number(u.wallet_balance), 0);

  return (
    <div className="container-x space-y-8 py-8">
      <h1 className="text-2xl font-extrabold text-brand-900">Admin panel</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Users", String(users.data?.length ?? 0)],
          ["Wallet total", formatNaira(totalWallets)],
          ["Plans", String(plans.data?.length ?? 0)],
          ["Orders (latest 50)", String(orders.data?.length ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-extrabold text-accent-700">{value}</p>
          </div>
        ))}
      </div>

      {/* Announcements */}
      <section className="card p-5">
        <h2 className="mb-3 text-lg font-extrabold text-brand-900">Announcement banner</h2>
        <form action={addAnnouncement} className="flex gap-2">
          <input name="message" required placeholder="e.g. Free 100MB on every 2GB purchase today!" className="input" aria-label="Announcement message" />
          <button className="btn-accent shrink-0">Publish</button>
        </form>
        <ul className="mt-3 space-y-1 text-sm">
          {((notes.data ?? []) as Announcement[]).map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2">
              <span className={a.active ? "font-semibold text-brand-700" : "text-slate-400"}>{a.message}</span>
              <form action={toggleAnnouncement}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="active" value={String(a.active)} />
                <button className="text-xs font-semibold text-accent-600 hover:underline">
                  {a.active ? "Turn off" : "Turn on"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      {/* Plans */}
      <section className="card p-5">
        <h2 className="mb-3 text-lg font-extrabold text-brand-900">Plans & prices</h2>
        <form action={savePlan} className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-brand-50 p-3">
          <span className="text-sm font-semibold">Add plan</span>
          <PlanFields />
          <button className="btn-primary">Add</button>
        </form>
        <div className="space-y-2">
          {((plans.data ?? []) as Plan[]).map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
              <form action={savePlan} className="flex flex-wrap items-center gap-2">
                <PlanFields plan={p} />
                <button className="btn-outline px-3 py-1.5">Save</button>
              </form>
              <form action={deletePlan}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* Orders */}
      <section className="card overflow-x-auto p-5">
        <h2 className="mb-3 text-lg font-extrabold text-brand-900">Orders</h2>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr><th className="py-2">Date</th><th>Service</th><th>Number</th><th>Amount</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {((orders.data ?? []) as Order[]).map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="py-2">{formatDate(o.created_at)}</td>
                <td className="capitalize">{o.network} {o.service}</td>
                <td>{o.phone_number}</td>
                <td>{formatNaira(o.amount)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>
                  {o.status === "pending" && (
                    <form action={resolveOrder} className="flex gap-2">
                      <input type="hidden" name="reference" value={o.reference} />
                      <button name="outcome" value="success" className="text-xs font-semibold text-brand-700 hover:underline">Mark success</button>
                      <button name="outcome" value="refund" className="text-xs font-semibold text-red-600 hover:underline">Refund</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Users */}
      <section className="card overflow-x-auto p-5">
        <h2 className="mb-3 text-lg font-extrabold text-brand-900">Users</h2>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr><th className="py-2">Name</th><th>Phone</th><th>Role</th><th>Balance</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {((users.data ?? []) as Profile[]).map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="py-2">{u.full_name ?? "-"}</td>
                <td>{u.phone ?? "-"}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>{formatNaira(u.wallet_balance)}</td>
                <td>{u.created_at ? formatDate(u.created_at) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Transactions */}
      <section className="card overflow-x-auto p-5">
        <h2 className="mb-3 text-lg font-extrabold text-brand-900">Transactions</h2>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr><th className="py-2">Date</th><th>Type</th><th>Reference</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {((txs.data ?? []) as Transaction[]).map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="py-2">{formatDate(t.created_at)}</td>
                <td className="capitalize">{t.type}</td>
                <td className="font-mono text-xs">{t.reference}</td>
                <td>{formatNaira(t.amount)}</td>
                <td><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
