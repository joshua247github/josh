"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { NETWORKS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

/** Every action re-checks the admin role on the server. Never trust the page. */
async function requireAdmin() {
  const { user, profile } = await getSession();
  if (!user || profile?.role !== "admin") throw new Error("Forbidden");
  return createAdminClient();
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/data");
}

export async function savePlan(formData: FormData) {
  const db = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const network = String(formData.get("network") ?? "");
  const price = Number(formData.get("price"));
  const row = {
    network,
    name: String(formData.get("name") ?? "").trim(),
    size: String(formData.get("size") ?? "").trim(),
    validity: String(formData.get("validity") ?? "").trim(),
    price,
    active: formData.get("active") === "on",
  };
  if (!(NETWORKS as readonly string[]).includes(network)) throw new Error("Invalid network");
  if (!row.name || !row.size || !row.validity || !Number.isFinite(price) || price <= 0) {
    throw new Error("Fill in all plan fields with a positive price");
  }

  const { error } = id
    ? await db.from("plans").update(row).eq("id", id)
    : await db.from("plans").insert(row);
  if (error) throw new Error(error.message);
  refresh();
}

export async function deletePlan(formData: FormData) {
  const db = await requireAdmin();
  const { error } = await db.from("plans").delete().eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}

/** Only pending orders can be resolved; refunds go through the same safe DB function. */
export async function resolveOrder(formData: FormData) {
  const db = await requireAdmin();
  const reference = String(formData.get("reference"));
  const outcome = String(formData.get("outcome"));
  if (outcome !== "success" && outcome !== "refund") throw new Error("Invalid outcome");
  const { error } = await db.rpc("finalize_order", {
    p_reference: reference,
    p_success: outcome === "success",
    p_vendor_response: { message: `Resolved manually by admin (${outcome})` },
  });
  if (error) throw new Error(error.message);
  refresh();
}

export async function addAnnouncement(formData: FormData) {
  const db = await requireAdmin();
  const message = String(formData.get("message") ?? "").trim();
  if (!message) throw new Error("Message required");
  // Only one banner is shown, so make the new one the active one.
  await db.from("announcements").update({ active: false }).eq("active", true);
  const { error } = await db.from("announcements").insert({ message, active: true });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function toggleAnnouncement(formData: FormData) {
  const db = await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  const { error } = await db.from("announcements").update({ active: !active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
