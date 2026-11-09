import { NextResponse } from "next/server";
import { BILL_PROVIDERS, MAX_AMOUNT, MIN_AMOUNT, NETWORKS, type Service } from "@/lib/constants";
import { makeReference, normalizePhone } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getVendor } from "@/lib/vendor";

export const runtime = "nodejs";

const SERVICES: Service[] = ["data", "airtime", "cable", "electricity", "exam"];

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Please log in to continue.", 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.");
  }

  const service = body.service as Service;
  if (!SERVICES.includes(service)) return fail("Unknown service.");

  const rawNumber = String(body.number ?? "").trim();
  const usesPhone = service === "data" || service === "airtime" || service === "exam";
  const number = usesPhone ? normalizePhone(rawNumber) : rawNumber.replace(/\s/g, "");
  if (!number || (!usesPhone && !/^\d{6,20}$/.test(number))) {
    return fail(usesPhone ? "Enter a valid Nigerian phone number." : "Enter a valid number.");
  }

  const admin = createAdminClient();

  // The price ALWAYS comes from the database for data plans, never from the browser.
  let amount = 0;
  let network: string = String(body.network ?? "");
  let planId: string | null = null;
  let planName: string | null = null;
  let planSize: string | null = null;

  if (service === "data") {
    const { data: plan } = await admin
      .from("plans")
      .select("id, network, name, size, price, active")
      .eq("id", String(body.planId ?? ""))
      .maybeSingle();
    if (!plan || !plan.active) return fail("That plan is not available.");
    amount = Number(plan.price);
    network = plan.network;
    planId = plan.id;
    planName = plan.name;
    planSize = plan.size;
  } else {
    amount = Math.round(Number(body.amount));
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return fail(`Amount must be between ₦${MIN_AMOUNT} and ₦${MAX_AMOUNT.toLocaleString("en-NG")}.`);
    }
    const allowed =
      service === "airtime" ? (NETWORKS as readonly string[]) : BILL_PROVIDERS[service];
    if (!allowed.includes(network)) return fail("Choose a valid provider.");
  }

  // 1) Atomically debit wallet + create order.
  const reference = makeReference("JDP");
  const { error: placeError } = await admin.rpc("place_order", {
    p_user: user.id,
    p_plan: planId,
    p_service: service,
    p_network: network,
    p_phone: number,
    p_amount: amount,
    p_reference: reference,
  });
  if (placeError) {
    if (placeError.message.includes("INSUFFICIENT_FUNDS")) {
      return fail("Insufficient wallet balance. Please fund your wallet.", 402);
    }
    console.error("place_order failed", placeError);
    return fail("Could not place your order. Please try again.", 500);
  }

  // 2) Call the vendor. Any failure refunds the wallet.
  let success = false;
  let message = "";
  let raw: unknown = null;
  try {
    const result = await getVendor().purchase({
      reference,
      service,
      network,
      phone: number,
      amount,
      planName,
      planSize,
    });
    success = result.success;
    message = result.message;
    raw = result.raw ?? null;
  } catch (err) {
    message = "Vendor error";
    raw = { error: String(err) };
  }

  // 3) Finalize (marks success, or refunds exactly once).
  const { error: finalizeError } = await admin.rpc("finalize_order", {
    p_reference: reference,
    p_success: success,
    p_vendor_response: { message, raw },
  });
  if (finalizeError) {
    console.error("finalize_order failed", reference, finalizeError);
    return fail("Your order is being processed. Contact support if your balance looks wrong.", 500);
  }

  if (!success) {
    return fail("The provider could not complete this order. Your wallet has been refunded.", 502);
  }
  return NextResponse.json({ ok: true, reference, message: "Purchase successful!" });
}
