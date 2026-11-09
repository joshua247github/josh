"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { normalizePhone } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./Toast";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawNext = params.get("next") ?? "/dashboard";
  // Only allow same-site relative redirects.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const supabase = createClient();
    setBusy(true);
    try {
      if (mode === "signup") {
        const fullName = String(form.get("full_name") ?? "").trim();
        const phone = normalizePhone(String(form.get("phone") ?? ""));
        if (!fullName) return setError("Please enter your full name.");
        if (!phone) return setError("Enter a valid Nigerian phone number.");

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } },
        });
        if (error) return setError(error.message);

        if (!data.session) {
          toast("Account created. Check your email to confirm, then log in.", "success");
          router.push("/login");
          return;
        }
        toast("Welcome to JOSH DATA PLUG!", "success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setError("Incorrect email or password.");
        toast("Logged in.", "success");
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto w-full max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-extrabold text-brand-900">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>

      {mode === "signup" && (
        <>
          <div>
            <label htmlFor="full_name" className="label">Full name</label>
            <input id="full_name" name="full_name" required className="input" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="phone" className="label">Phone number</label>
            <input id="phone" name="phone" required inputMode="tel" className="input" placeholder="08012345678" autoComplete="tel" />
          </div>
        </>
      )}

      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="input"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full py-3">
        {busy ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>New here? <Link href="/signup" className="font-semibold text-accent-600">Create an account</Link></>
        ) : (
          <>Already registered? <Link href="/login" className="font-semibold text-accent-600">Log in</Link></>
        )}
      </p>
    </form>
  );
}
