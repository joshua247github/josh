import crypto from "node:crypto";

const PAYSTACK_API = "https://api.paystack.co";

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

/** Mock funding is only ever allowed outside production. */
export function mockFundingAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && !paystackConfigured();
}

export async function initializeTransaction(args: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
}): Promise<{ authorizationUrl: string }> {
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: args.email,
      amount: Math.round(args.amountNaira * 100), // kobo
      reference: args.reference,
      callback_url: args.callbackUrl,
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) {
    throw new Error(json?.message ?? "Paystack initialize failed");
  }
  return { authorizationUrl: json.data.authorization_url as string };
}

/** Verify the x-paystack-signature header against the raw request body. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
