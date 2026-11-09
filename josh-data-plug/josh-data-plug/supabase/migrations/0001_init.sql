-- JOSH DATA PLUG: core schema, RLS, triggers and money functions.
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  wallet_balance numeric(12, 2) not null default 0 check (wallet_balance >= 0),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------- plans
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  network text not null check (network in ('MTN', 'Airtel', 'Glo', '9mobile')),
  name text not null,
  size text not null,
  validity text not null,
  price numeric(12, 2) not null check (price > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.plans (id) on delete set null,
  service text not null default 'data'
    check (service in ('data', 'airtime', 'cable', 'electricity', 'exam')),
  network text,
  phone_number text not null,
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed', 'refunded')),
  reference text not null unique,
  vendor_response jsonb,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

-- ------------------------------------------------------------ transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('funding', 'purchase', 'refund')),
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  reference text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists transactions_user_idx on public.transactions (user_id, created_at desc);

-- ----------------------------------------------------------- announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------- is_admin()
-- security definer so RLS policies on profiles can call it without recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------- signup -> profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'phone', new.phone)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Block signed-in users (including via the anon key) from changing their own
-- role or wallet balance. Service-role / SQL-editor calls have auth.uid() = null.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    new.role := old.role;
    new.wallet_balance := old.wallet_balance;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- --------------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.orders enable row level security;
alter table public.transactions enable row level security;
alter table public.announcements enable row level security;

-- profiles: read/update own row; admins read all
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- plans: everyone reads active plans; only admins write
create policy "plans_select_active" on public.plans
  for select using (active or public.is_admin());
create policy "plans_admin_write" on public.plans
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: own rows; admins read all and update status
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- transactions: own rows; admins read all
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id or public.is_admin());

-- announcements: everyone reads active; only admins write
create policy "announcements_select_active" on public.announcements
  for select using (active or public.is_admin());
create policy "announcements_admin_write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------- money functions
-- Only the service role (our server routes) may call these.

-- Debit wallet + create order + purchase transaction in ONE atomic step.
create or replace function public.place_order(
  p_user uuid,
  p_plan uuid,
  p_service text,
  p_network text,
  p_phone text,
  p_amount numeric,
  p_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_order uuid;
begin
  select wallet_balance into v_balance from public.profiles where id = p_user for update;
  if v_balance is null then
    raise exception 'PROFILE_NOT_FOUND';
  end if;
  if v_balance < p_amount then
    raise exception 'INSUFFICIENT_FUNDS';
  end if;

  update public.profiles set wallet_balance = wallet_balance - p_amount where id = p_user;

  insert into public.orders (user_id, plan_id, service, network, phone_number, amount, status, reference)
  values (p_user, p_plan, p_service, p_network, p_phone, p_amount, 'pending', p_reference)
  returning id into v_order;

  insert into public.transactions (user_id, type, amount, status, reference)
  values (p_user, 'purchase', p_amount, 'success', p_reference);

  return v_order;
end;
$$;

-- Mark an order done. If the vendor failed, refund the wallet exactly once.
create or replace function public.finalize_order(
  p_reference text,
  p_success boolean,
  p_vendor_response jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where reference = p_reference for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if v_order.status <> 'pending' then
    return; -- already finalized
  end if;

  if p_success then
    update public.orders
      set status = 'success', vendor_response = p_vendor_response
      where id = v_order.id;
  else
    update public.orders
      set status = 'refunded', vendor_response = p_vendor_response
      where id = v_order.id;
    update public.profiles
      set wallet_balance = wallet_balance + v_order.amount
      where id = v_order.user_id;
    insert into public.transactions (user_id, type, amount, status, reference)
    values (v_order.user_id, 'refund', v_order.amount, 'success', p_reference || '-RF');
  end if;
end;
$$;

-- Credit a wallet for a verified Paystack payment. Idempotent per reference.
create or replace function public.credit_wallet(p_reference text, p_paid_amount numeric)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.transactions;
begin
  select * into v_tx from public.transactions
    where reference = p_reference and type = 'funding' for update;
  if not found then
    raise exception 'TRANSACTION_NOT_FOUND';
  end if;
  if v_tx.status = 'success' then
    return false; -- already credited
  end if;
  if p_paid_amount < v_tx.amount then
    update public.transactions set status = 'failed' where id = v_tx.id;
    raise exception 'AMOUNT_MISMATCH';
  end if;

  update public.transactions set status = 'success' where id = v_tx.id;
  update public.profiles set wallet_balance = wallet_balance + v_tx.amount where id = v_tx.user_id;
  return true;
end;
$$;

revoke all on function public.place_order(uuid, uuid, text, text, text, numeric, text) from public, anon, authenticated;
revoke all on function public.finalize_order(text, boolean, jsonb) from public, anon, authenticated;
revoke all on function public.credit_wallet(text, numeric) from public, anon, authenticated;
grant execute on function public.place_order(uuid, uuid, text, text, text, numeric, text) to service_role;
grant execute on function public.finalize_order(text, boolean, jsonb) to service_role;
grant execute on function public.credit_wallet(text, numeric) to service_role;

-- To make yourself an admin, after signing up run:
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
