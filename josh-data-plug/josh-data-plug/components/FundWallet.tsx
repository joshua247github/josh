"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MIN_FUNDING } from "@/lib/constants";
import { formatNaira } from "@/lib/format";
import { useToast } from "./Toast";

const QUICK = [500, 1000, 2000, 5000];

export default function FundWallet() {
  const router = useRouter();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  async function fund(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value < MIN_FUNDING) {
      toast(`Minimum funding is ${formatNaira(MIN_FUNDING)}.`, "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(json.error ?? "Could not start payment.", "error");
        return;
      }
      if (json.authorizationUrl) {
        window.location.href = json.authorizationUrl;
        return;
      }
      toast(json.message ?? "Wallet funded.", "success");
      setAmount("");
      router.refresh();
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={fund} className="space-y-3">
      <div>
        <label htmlFor="fund-amount" className="label">Amount (₦)</label>
        <input
          id="fund-amount"
          inputMode="numeric"
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="e.g. 2000"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setAmount(String(q))}
            className="rounded-full border border-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 hover:border-accent-600 hover:text-accent-700"
          >
            {formatNaira(q)}
          </button>
        ))}
      </div>
      <button type="submit" disabled={busy} className="btn-accent w-full">
        {busy ? "Please wait..." : "Fund with Paystack"}
      </button>
    </form>
  );
}
