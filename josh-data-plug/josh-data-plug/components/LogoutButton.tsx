"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
    setBusy(false);
  }

  return (
    <button onClick={logout} disabled={busy} className="btn-outline">
      {busy ? "..." : "Logout"}
    </button>
  );
}
