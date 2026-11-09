"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Simple smart search: "mtn 2gb" -> /data?network=MTN&q=2gb ; "airtime" -> /airtime ... */
export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim().toLowerCase();
    if (!q) return;
    if (q.includes("airtime")) return router.push("/airtime");
    if (/(dstv|gotv|startimes|cable)/.test(q)) return router.push("/bills?type=cable");
    if (/(electric|light|meter|ikeja|eko)/.test(q)) return router.push("/bills?type=electricity");
    if (/(waec|neco|jamb|exam|pin)/.test(q)) return router.push("/bills?type=exam");

    const net = ["mtn", "airtel", "glo", "9mobile"].find((n) => q.includes(n));
    const params = new URLSearchParams();
    if (net) params.set("network", net === "mtn" ? "MTN" : net === "airtel" ? "Airtel" : net === "glo" ? "Glo" : "9mobile");
    const rest = q.replace(net ?? "", "").replace("data", "").trim();
    if (rest) params.set("q", rest);
    router.push(`/data?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} role="search" className="flex w-full gap-2">
      <label htmlFor="site-search" className="sr-only">
        Search data plans, airtime and bills
      </label>
      <input
        id="site-search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search e.g. MTN 2GB, airtime, DSTV"
        className="input rounded-full"
      />
      <button type="submit" className="btn-accent rounded-full px-5">
        Search
      </button>
    </form>
  );
}
