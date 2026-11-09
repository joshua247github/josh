"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizePhone } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./Toast";

export default function ProfileForm({
  userId,
  fullName,
  phone,
  email,
}: {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(fullName);
  const [tel, setTel] = useState(phone);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = tel ? normalizePhone(tel) : "";
    if (tel && !cleaned) {
      toast("Enter a valid Nigerian phone number.", "error");
      return;
    }
    setBusy(true);
    // RLS lets users update only their own row; a DB trigger blocks role/balance changes.
    const { error } = await createClient()
      .from("profiles")
      .update({ full_name: name.trim(), phone: cleaned || null })
      .eq("id", userId);
    setBusy(false);
    if (error) {
      toast("Could not save your profile.", "error");
      return;
    }
    toast("Profile updated.", "success");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div>
        <label className="label" htmlFor="p-email">Email</label>
        <input id="p-email" className="input bg-slate-50" value={email} disabled readOnly />
      </div>
      <div>
        <label className="label" htmlFor="p-name">Full name</label>
        <input id="p-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="p-phone">Phone</label>
        <input id="p-phone" className="input" value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" />
      </div>
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
