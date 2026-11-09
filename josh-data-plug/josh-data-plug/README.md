# JOSH DATA PLUG

Cheap data, airtime, cable TV, electricity and exam pins for Nigeria.
Next.js 15 (App Router) + TypeScript + Tailwind, Supabase (Postgres, Auth, RLS), deployed on Vercel.

- Brand colors: green `#16A34A`, white, purple accent `#7C3AED`
- WhatsApp: 08031940875 / 08123670163
- Address: Jos, Plateau State, Nigeria

## 1. Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
npm run build                # must pass before you push
```

## 2. Supabase setup

1. Create a project at supabase.com.
2. In **SQL Editor**, run these files in order:
   1. `supabase/migrations/0001_init.sql` (tables, RLS, triggers, wallet functions)
   2. `supabase/migrations/0002_seed.sql` (20 **sample** plans and the first announcement)
3. **Project Settings -> API**: copy the Project URL, the `anon` key and the `service_role` key into `.env.local`.
4. **Authentication -> Providers**: Email is on by default. For quick testing you can turn off "Confirm email".
5. Sign up on the site, then make yourself admin in the SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Then open `/admin` to set your real plan prices.

## 3. Vercel setup

1. Push this repo to GitHub, then in Vercel: **Add New -> Project -> import the repo**.
2. Under **Settings -> Environment Variables** add everything from `.env.example`:

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your live URL, e.g. `https://joshdataplug.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret. Server only. |
| `PAYSTACK_SECRET_KEY` | Secret. Start with `sk_test_...` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` |
| `VENDOR_NAME` | `mock` for now |

3. Redeploy. Every push to `main` deploys automatically.

## 4. Paystack

1. Create a Paystack account and copy your **test** keys.
2. Set the webhook URL (Settings -> API Keys & Webhooks) to `https://YOUR-DOMAIN/api/paystack/webhook`.
3. Fund the wallet from `/dashboard` using Paystack's test card.
4. Switch to `sk_live_` keys only after your business is verified and you have tested end to end.

**Test-mode placeholder:** with no `PAYSTACK_SECRET_KEY` and `NODE_ENV` not `production`, "Fund wallet" credits the wallet instantly with no payment, so you can try the full flow locally. This is disabled in production.

## 5. Going live with real data delivery

`lib/vendor.ts` is the only file that talks to your data/airtime provider. Today it uses a **mock** that always succeeds (a phone number ending in `000` simulates a failure so you can test refunds).

To go live: open a reseller account (for example VTpass), implement `VtpassVendor.purchase()` using their docs, set `VENDOR_NAME=vtpass` and fill the `VENDOR_*` variables. **Until you do this, no real data or airtime is delivered.**

## How money stays safe

- Prices for data plans are always read from the database on the server, never from the browser.
- `place_order` debits the wallet and creates the order in one database transaction.
- If the vendor fails, `finalize_order` refunds the wallet exactly once.
- `credit_wallet` is idempotent per Paystack reference and checks the paid amount, so a repeated webhook cannot credit twice.
- Users cannot change their own `role` or `wallet_balance` (database trigger + RLS).
- The service-role key is only used in server code (`lib/supabase/admin.ts`).

## Project structure

```
app/            pages, API routes, admin server actions
components/     UI pieces (Header, PurchaseForm, PlanCard, ...)
lib/            supabase clients, vendor, paystack, helpers
supabase/       SQL migrations
```

## Before launch checklist

- [ ] Replace sample plan prices in `/admin`
- [ ] Replace placeholder testimonials in `app/page.tsx`
- [ ] Implement a real vendor in `lib/vendor.ts`
- [ ] Switch Paystack to live keys and test the webhook
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your real domain
