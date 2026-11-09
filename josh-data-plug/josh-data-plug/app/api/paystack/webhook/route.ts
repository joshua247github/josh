import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Paystack webhook. In the Paystack dashboard (Settings -> API Keys & Webhooks)
 * set the webhook URL to: https://YOUR-DOMAIN/api/paystack/webhook
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; amount?: number; status?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.event !== "charge.success" || event.data?.status !== "success") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const reference = event.data.reference;
  const paidNaira = Number(event.data.amount) / 100; // Paystack sends kobo
  if (!reference || !Number.isFinite(paidNaira)) {
    return NextResponse.json({ error: "Missing reference or amount" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: credited, error } = await admin.rpc("credit_wallet", {
    p_reference: reference,
    p_paid_amount: paidNaira,
  });

  if (error) {
    // Unknown reference / amount mismatch: acknowledge so Paystack stops retrying.
    if (error.message.includes("TRANSACTION_NOT_FOUND") || error.message.includes("AMOUNT_MISMATCH")) {
      console.warn("webhook ignored", reference, error.message);
      return NextResponse.json({ ok: true, ignored: true });
    }
    console.error("credit_wallet failed", reference, error);
    return NextResponse.json({ error: "Temporary error" }, { status: 500 }); // Paystack retries
  }

  return NextResponse.json({ ok: true, credited: Boolean(credited) });
}
