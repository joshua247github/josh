"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MAX_AMOUNT, MIN_AMOUNT, NETWORKS, type Service } from "@/lib/constants";
import { formatNaira, normalizePhone } from "@/lib/format";
import type { Plan } from "@/lib/types";
import { useToast } from "./Toast";

type Props = {
  service: Service;
  plans?: Plan[]; // data only
  providers?: string[]; // airtime / bills
  initialNetwork?: string;
  initialPlanId?: string;
  initialQuery?: string;
  isLoggedIn: boolean;
  balance: number;
};

const FIELD_LABEL: Record<Service, string> = {
  data: "Phone number",
  airtime: "Phone number",
  cable: "Smartcard / IUC number",
  electricity: "Meter number",
  exam: "Phone number (pin is sent here)",
};

export default function PurchaseForm({
  service,
  plans = [],
  providers = [],
  initialNetwork,
  initialPlanId,
  initialQuery,
  isLoggedIn,
  balance,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const initialPlan = plans.find((p) => p.id === initialPlanId);
  const [network, setNetwork] = useState<string>(
    initialPlan?.network ?? initialNetwork ?? (service === "data" ? "MTN" : providers[0] ?? "MTN"),
  );
  const [planId, setPlanId] = useState<string>(initialPlan?.id ?? "");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visiblePlans = useMemo(() => {
    const q = (initialQuery ?? "").toLowerCase();
    return plans.filter(
      (p) => p.network === network && (!q || `${p.size} ${p.name}`.toLowerCase().includes(q)),
    );
  }, [plans, network, initialQuery]);

  const selectedPlan = plans.find((p) => p.id === planId);
  const price = service === "data" ? selectedPlan?.price ?? 0 : Number(amount) || 0;
  const options = service === "data" ? [...NETWORKS] : service === "airtime" ? [...NETWORKS] : providers;
  const short = isLoggedIn && price > 0 && balance < price;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isLoggedIn) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    const isPhone = service === "data" || service === "airtime" || service === "exam";
    const cleaned = isPhone ? normalizePhone(number) : number.trim();
    if (!cleaned) {
      setError(isPhone ? "Enter a valid Nigerian phone number." : "Enter a valid number.");
      return;
    }
    if (service === "data" && !selectedPlan) {
      setError("Please choose a data plan.");
      return;
    }
    if (service !== "data" && (price < MIN_AMOUNT || price > MAX_AMOUNT)) {
      setError(`Amount must be between ${formatNaira(MIN_AMOUNT)} and ${formatNaira(MAX_AMOUNT)}.`);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          network,
          planId: service === "data" ? planId : undefined,
          number: cleaned,
          amount: service === "data" ? undefined : price,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.push("/login?next=" + encodeURIComponent(window.location.pathname));
        return;
      }
      if (!res.ok) {
        const msg = json.error ?? "Something went wrong. Please try again.";
        setError(msg);
        toast(msg, "error");
        return;
      }
      toast(json.message ?? "Purchase successful!", "success");
      setNumber("");
      setAmount("");
      router.refresh();
    } catch {
      const msg = "Network error. Check your connection and try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mx-auto w-full max-w-lg space-y-4 p-5" noValidate>
      <div>
        <label htmlFor="network" className="label">
          {service === "data" || service === "airtime" ? "Network" : "Provider"}
        </label>
        <select
          id="network"
          className="input"
          value={network}
          onChange={(e) => {
            setNetwork(e.target.value);
            setPlanId("");
          }}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {service === "data" && (
        <fieldset>
          <legend className="label">Choose a plan</legend>
          {visiblePlans.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
              No plans available for {network} right now.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {visiblePlans.map((p) => (
                <label
                  key={p.id}
                  className={`cursor-pointer rounded-xl border p-3 text-sm transition ${
                    planId === p.id
                      ? "border-accent-600 bg-accent-50 ring-2 ring-accent-100"
                      : "border-slate-200 hover:border-brand-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={p.id}
                    checked={planId === p.id}
                    onChange={() => setPlanId(p.id)}
                    className="sr-only"
                  />
                  <span className="block text-base font-extrabold text-brand-900">{p.size}</span>
                  <span className="block text-xs text-slate-500">{p.validity}</span>
                  <span className="mt-1 block font-bold text-accent-600">{formatNaira(p.price)}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      )}

      {service !== "data" && (
        <div>
          <label htmlFor="amount" className="label">Amount (₦)</label>
          <input
            id="amount"
            inputMode="numeric"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="e.g. 1000"
          />
        </div>
      )}

      <div>
        <label htmlFor="number" className="label">{FIELD_LABEL[service]}</label>
        <input
          id="number"
          inputMode="numeric"
          className="input"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder={service === "cable" || service === "electricity" ? "Enter number" : "08012345678"}
          autoComplete="tel"
        />
      </div>

      <div className="rounded-xl bg-brand-50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Order summary</span>
          <span className="font-semibold">
            {service === "data" && selectedPlan ? `${network} ${selectedPlan.size}` : network}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-base font-extrabold text-brand-900">
          <span>Total</span>
          <span>{formatNaira(price)}</span>
        </div>
        {isLoggedIn && (
          <p className="mt-1 text-xs text-slate-500">Wallet balance: {formatNaira(balance)}</p>
        )}
      </div>

      {short && (
        <p role="alert" className="text-sm text-red-600">
          Your wallet is low.{" "}
          <Link href="/dashboard#fund" className="font-semibold underline">Fund wallet</Link>
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy || short} className="btn-primary w-full py-3 text-base">
        {busy ? "Processing..." : isLoggedIn ? "Pay from wallet" : "Login to continue"}
      </button>
    </form>
  );
}
