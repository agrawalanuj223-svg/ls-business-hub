-- L&S Business Hub — Phase 1 RLS isolation checks
-- Run in a disposable database after migrations and DEMO/SAMPLE seed.
-- These checks use Supabase's request.jwt.claim.sub mechanism to emulate sessions.

begin;
set local role authenticated;

-- Internal User A has access only to DEMO LIFT & SHIFT, not the sister company.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000007', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

do $$
begin
  if (exists (select 1 from public.companies where id = '20000000-0000-4000-8000-000000000002')) then
    raise exception 'FAIL: Internal User A can read Company B';
  end if;
  if (exists (select 1 from public.invoices where id = '50000000-0000-4000-8000-000000000003')) then
    raise exception 'FAIL: Internal User A can read Company B invoice';
  end if;
  if (exists (select 1 from public.payments where id = '60000000-0000-4000-8000-000000000002')) then
    raise exception 'FAIL: Internal User A can read Company B payment';
  end if;
  if (exists (select 1 from public.service_orders where id = '40000000-0000-4000-8000-000000000003')) then
    raise exception 'FAIL: Internal User A can read Company B service order';
  end if;
end $$;

-- Company A record remains visible to User A.
do $$
begin
  if not exists (select 1 from public.invoices where id = '50000000-0000-4000-8000-000000000001') then
    raise exception 'FAIL: Internal User A cannot read own-company invoice';
  end if;
end $$;

-- Direct payment cross-company attachment must fail at the composite FK even
-- for a privileged database session.
set local role postgres;
do $$
begin
  begin
    insert into public.payments (company_id, invoice_id, payment_date, amount, payment_mode, created_by)
    values ('20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000003', current_date, 1, 'OTHER', '10000000-0000-4000-8000-000000000007');
    raise exception 'FAIL: cross-company payment attachment was accepted';
  exception when foreign_key_violation then
    null;
  end;
end $$;

set local role authenticated;

-- Client Alpha cannot see Client Beta's client-safe invoice DTO.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);
do $$
begin
  if exists (select 1 from public.client_invoice_summary('50000000-0000-4000-8000-000000000002')) then
    raise exception 'FAIL: Client Alpha can read Client Beta invoice';
  end if;
  if not exists (select 1 from public.client_invoice_summary('50000000-0000-4000-8000-000000000001')) then
    raise exception 'FAIL: Client Alpha cannot read own invoice DTO';
  end if;
end $$;

-- Client Alpha cannot directly select internal invoice rows because client
-- access is intentionally provided only through safe RPCs/server DTOs.
do $$
begin
  if exists (select 1 from public.invoices where id = '50000000-0000-4000-8000-000000000001') then
    raise exception 'FAIL: client session can directly select internal invoice table';
  end if;
end $$;

-- Client Beta cannot read Client Alpha's invoice DTO.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', true);
do $$
begin
  if exists (select 1 from public.client_invoice_summary('50000000-0000-4000-8000-000000000001')) then
    raise exception 'FAIL: Client Beta can read Client Alpha invoice';
  end if;
end $$;

rollback;
