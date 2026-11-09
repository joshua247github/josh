/**
 * Data / airtime / bills provider abstraction.
 *
 * The app only talks to `getVendor()`. Today it returns a MOCK that always
 * succeeds (so you can test the whole flow). To go live, implement the
 * `VtpassVendor` methods below (or write your own class for another reseller),
 * set VENDOR_NAME=vtpass and fill VENDOR_* env vars.
 */
import type { Service } from "./constants";

export type VendorRequest = {
  reference: string;
  service: Service;
  network?: string | null; // MTN, Airtel, DSTV, WAEC, ...
  phone: string; // phone number, smartcard number or meter number
  amount: number;
  planName?: string | null; // e.g. "MTN 1GB"
  planSize?: string | null;
};

export type VendorResult = {
  success: boolean;
  message: string;
  raw?: unknown;
};

export interface Vendor {
  name: string;
  purchase(req: VendorRequest): Promise<VendorResult>;
}

class MockVendor implements Vendor {
  name = "mock";

  async purchase(req: VendorRequest): Promise<VendorResult> {
    await new Promise((r) => setTimeout(r, 400));
    // Phone numbers ending in 000 simulate a vendor failure, to test refunds.
    if (req.phone.endsWith("000")) {
      return { success: false, message: "Mock vendor: simulated failure", raw: req };
    }
    return { success: true, message: "Mock vendor: delivered (no real data sent)", raw: req };
  }
}

/**
 * Skeleton for VTpass (https://www.vtpass.com/documentation). Check their docs
 * for the exact serviceID and variation_code values, then fill this in.
 */
class VtpassVendor implements Vendor {
  name = "vtpass";

  async purchase(_req: VendorRequest): Promise<VendorResult> {
    const base = process.env.VENDOR_BASE_URL;
    const apiKey = process.env.VENDOR_API_KEY;
    const secret = process.env.VENDOR_SECRET_KEY;
    if (!base || !apiKey || !secret) {
      return { success: false, message: "Vendor is not configured" };
    }
    // TODO: POST `${base}/pay` with { request_id: req.reference, serviceID, billersCode,
    // variation_code, amount, phone } and headers { "api-key": apiKey, "secret-key": secret },
    // then map the response code ("000" = success) to VendorResult.
    return { success: false, message: "VTpass integration not implemented yet" };
  }
}

export function getVendor(): Vendor {
  switch ((process.env.VENDOR_NAME ?? "mock").toLowerCase()) {
    case "vtpass":
      return new VtpassVendor();
    default:
      return new MockVendor();
  }
}
