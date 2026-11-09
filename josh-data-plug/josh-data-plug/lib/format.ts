const naira = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 1500 -> "₦1,500" */
export function formatNaira(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return `₦${naira.format(Number.isFinite(n) ? n : 0)}`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

/** Accepts 0803..., 234803..., +234803... and returns 0803XXXXXXX or null. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  let local = digits;
  if (digits.startsWith("234") && digits.length === 13) local = "0" + digits.slice(3);
  if (!/^0[789][01]\d{8}$/.test(local)) return null;
  return local;
}

export function makeReference(prefix: string): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}
