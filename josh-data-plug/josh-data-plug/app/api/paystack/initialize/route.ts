import { NextResponse } from "next/server";
import { BRAND, MIN_FUNDING } from "@/lib/constants";
import { makeReference } from "@/lib/format";
import { initializeTransaction, mockFundingAllowed, paystackConfigured } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount < MIN_FUNDING || amount > 1_000_000) {
    return NextResponse.json(
      { error: `Enter an amount from ₦${MIN_FUNDING} to ₦1,000,000.` },
      { status: 400 },
    );
  }

  if (!paystackConfigured() && !mockFundingAllowed()) {
    return NextResponse.json({ error: "Wallet funding is not available right now." }, { status: 503 });
  }

  const admin = createAdminClient();
  const reference = makeReference("FND");

  const { error: insertError } = await admin.from("transactions").insert({
    user_id: user.id,
    type: "funding",
    amount,
    status: "pending",
    reference,
  });
  if (insertError) {
    console.error("funding insert failed", insertError);
    return NextResponse.json({ error: "Could not start payment." }, { status: 500 });
  }

  // TEST-MODE PLACEHOLDER: no Paystack key and not production -> credit instantly.
  if (!paystackConfigured()) {
    const { error } = await admin.rpc("credit_wallet", { p_reference: reference, p_paid_amount: amount });
    if (error) return NextResponse.json({ error: "Mock funding failed." }, { status: 500 });
    return NextResponse.json({ mock: true, message: `Test mode: ₦${amount} added (no real payment).` });
  }

  try {
    const { authorizationUrl } = await initializeTransaction({
      email: user.email,
      amountNaira: amount,
      reference,
      callbackUrl: `${BRAND.siteUrl}/dashboard?funded=${reference}`,
    });
    return NextResponse.json({ authorizationUrl, reference });
  } catch (err) {
    console.error("paystack initialize failed", err);
    await admin.from("transactions").update({ status: "failed" }).eq("reference", reference);
    return NextResponse.json({ error: "Could not reach Paystack. Try again." }, { status: 502 });
  }
}
