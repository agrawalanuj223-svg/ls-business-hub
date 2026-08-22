-- L&S Business Hub — Phase 1 security migration
-- Prerequisite: database/schema.sql has been applied.
-- Review with the target Supabase/Postgres version before production use.

begin;

create schema if not exists private;

-- Keep helper functions out of the public API surface.
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select auth.uid();
$$;

create or replace function private.has_active_company_role(
  target_company_id uuid,
  allowed_roles internal_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1
    from public.user_company_roles ucr
    join public.profiles p on p.id = ucr.user_id
    join public.companies c on c.id = ucr.company_id
    where ucr.user_id = auth.uid()
      and ucr.company_id = target_company_id
      and ucr.status = 'ACTIVE'
      and p.status = 'ACTIVE'
      and c.status = 'ACTIVE'
      and (allowed_roles is null or ucr.role = any(allowed_roles))
  );
$$;

create or replace function private.is_group_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1 from public.user_company_roles ucr
    join public.profiles p on p.id = ucr.user_id
    where ucr.user_id = auth.uid()
      and ucr.role = 'GROUP_ADMIN'
      and ucr.status = 'ACTIVE'
      and p.status = 'ACTIVE'
  );
$$;

create or replace function private.is_active_client_member(target_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1
    from public.client_users cu
    join public.client_company_memberships ccm on ccm.user_id = cu.id
    join public.business_partners bp on bp.id = ccm.business_partner_id
    join public.profiles p on p.id = cu.id
    where cu.id = auth.uid()
      and ccm.business_partner_id = target_partner_id
      and ccm.status = 'ACTIVE'
      and p.status = 'ACTIVE'
      and bp.status = 'ACTIVE'
      and bp.partner_type in ('CLIENT','BOTH')
  );
$$;

create or replace function private.can_read_document(target_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1
    from public.documents d
    where d.id = target_document_id
      and private.has_active_company_role(d.company_id)
  ) or exists (
    select 1
    from public.documents d
    join public.document_access da on da.document_id = d.id
    where d.id = target_document_id
      and private.is_active_client_member(da.client_business_partner_id)
      and da.status = 'ACTIVE'
      and (da.expires_at is null or da.expires_at > now())
  );
$$;

create or replace function private.can_download_document(target_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1 from public.documents d
    where d.id = target_document_id
      and private.has_active_company_role(d.company_id)
  ) or exists (
    select 1
    from public.documents d
    join public.document_access da on da.document_id = d.id
    where d.id = target_document_id
      and da.access_level = 'DOWNLOAD'
      and private.is_active_client_member(da.client_business_partner_id)
      and da.status = 'ACTIVE'
      and (da.expires_at is null or da.expires_at > now())
  );
$$;

-- Client-safe RPCs. These functions deliberately return allowlisted fields and
-- do not grant direct client table access to internal records.
create or replace function public.client_invoice_summary(p_invoice_id uuid)
returns table (
  invoice_id uuid,
  invoice_number text,
  invoice_date date,
  billing_period text,
  due_date date,
  subtotal numeric,
  gst_amount numeric,
  total_amount numeric,
  currency char(3),
  status invoice_status,
  paid_amount numeric,
  outstanding_amount numeric
)
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select i.id, i.invoice_number, i.invoice_date, i.billing_period,
         i.due_date, i.subtotal, i.gst_amount, i.total_amount, i.currency,
         i.status,
         coalesce(sum(p.amount) filter (where p.id is not null), 0),
         i.total_amount - coalesce(sum(p.amount) filter (where p.id is not null), 0)
  from public.invoices i
  join public.business_partners bp on bp.id = i.business_partner_id
  left join public.payments p on p.invoice_id = i.id
  where i.id = p_invoice_id
    and private.is_active_client_member(i.business_partner_id)
    and i.status not in ('CANCELLED','ARCHIVED')
  group by i.id;
$$;

create or replace function public.client_document_metadata(p_document_id uuid)
returns table (
  document_id uuid,
  document_type document_type,
  file_name text,
  mime_type text,
  file_size bigint,
  uploaded_at timestamptz,
  can_download boolean
)
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select d.id, d.document_type, d.file_name, d.mime_type, d.file_size,
         d.uploaded_at, private.can_download_document(d.id)
  from public.documents d
  where d.id = p_document_id
    and private.can_read_document(d.id);
$$;

revoke all on function public.client_invoice_summary(uuid) from public;
grant execute on function public.client_invoice_summary(uuid) to authenticated;
revoke all on function public.client_document_metadata(uuid) from public;
grant execute on function public.client_document_metadata(uuid) to authenticated;

-- RLS is enabled on every application table. Policies are intentionally
-- internal-only for base table access. Client routes use allowlisted RPCs and
-- server-side DTOs so clients cannot select internal notes, costs or audit rows.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','companies','user_company_roles','business_partners',
    'service_orders','billing_schedules','invoices','payments','documents',
    'document_access','client_users','client_company_memberships',
    'client_invitations','reminders','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Remove broad table privileges. Application server operations use the
-- authenticated session and these policies; privileged job operations must use
-- narrowly scoped server-only functions.
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select on public.profiles, public.companies, public.user_company_roles,
  public.business_partners, public.service_orders, public.billing_schedules,
  public.invoices, public.payments, public.documents, public.document_access,
  public.client_users, public.client_company_memberships, public.client_invitations,
  public.reminders, public.audit_logs to authenticated;

grant insert, update on public.companies, public.user_company_roles,
  public.business_partners, public.service_orders, public.billing_schedules,
  public.invoices, public.payments, public.documents, public.document_access,
  public.client_users, public.client_company_memberships, public.client_invitations,
  public.reminders to authenticated;
-- Profile identity/status is controlled by trusted provisioning code. Users may
-- update only presentation fields on their own profile.
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- Profiles: users can read their own row; active internal company members may
-- read profile identities needed for assignment screens. Normal users cannot
-- change role/status through a direct table write in the application service.
create policy profiles_self_read on public.profiles for select to authenticated
using (id = auth.uid() or private.is_group_admin());
create policy profiles_self_update on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

create policy companies_member_read on public.companies for select to authenticated
using (private.has_active_company_role(id) or private.is_group_admin());
create policy companies_admin_insert on public.companies for insert to authenticated
with check (private.is_group_admin());
create policy companies_admin_update on public.companies for update to authenticated
using (private.is_group_admin()) with check (private.is_group_admin());

create policy roles_member_read on public.user_company_roles for select to authenticated
using (user_id = auth.uid() or private.is_group_admin());
create policy roles_admin_insert on public.user_company_roles for insert to authenticated
with check (
  private.is_group_admin()
  or (role <> 'GROUP_ADMIN' and private.has_active_company_role(company_id, array['COMPANY_ADMIN']::internal_role[]))
);
create policy roles_admin_update on public.user_company_roles for update to authenticated
using (private.is_group_admin() or private.has_active_company_role(company_id, array['COMPANY_ADMIN']::internal_role[]))
with check (
  private.is_group_admin()
  or (role <> 'GROUP_ADMIN' and private.has_active_company_role(company_id, array['COMPANY_ADMIN']::internal_role[]))
);

create policy partners_internal_read on public.business_partners for select to authenticated
using (private.has_active_company_role(company_id));
create policy partners_internal_insert on public.business_partners for insert to authenticated
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF']::internal_role[]));
create policy partners_internal_update on public.business_partners for update to authenticated
using (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF']::internal_role[]))
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF']::internal_role[]));

create policy service_orders_internal_read on public.service_orders for select to authenticated
using (private.has_active_company_role(company_id));
create policy service_orders_internal_insert on public.service_orders for insert to authenticated
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF']::internal_role[]));
create policy service_orders_internal_update on public.service_orders for update to authenticated
using (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF']::internal_role[]))
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF']::internal_role[]));

create policy schedules_internal_read on public.billing_schedules for select to authenticated
using (private.has_active_company_role(company_id));
create policy schedules_internal_write on public.billing_schedules for insert to authenticated
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF','FINANCE']::internal_role[]));
create policy schedules_internal_update on public.billing_schedules for update to authenticated
using (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF','FINANCE']::internal_role[]))
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF','FINANCE']::internal_role[]));

create policy invoices_internal_read on public.invoices for select to authenticated
using (private.has_active_company_role(company_id));
create policy invoices_internal_write on public.invoices for insert to authenticated
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE']::internal_role[]));
create policy invoices_internal_update on public.invoices for update to authenticated
using (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE']::internal_role[]))
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE']::internal_role[]));

create policy payments_internal_read on public.payments for select to authenticated
using (private.has_active_company_role(company_id));
create policy payments_internal_insert on public.payments for insert to authenticated
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE']::internal_role[]));
create policy payments_internal_update on public.payments for update to authenticated
using (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE']::internal_role[]))
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE']::internal_role[]));

create policy documents_internal_read on public.documents for select to authenticated
using (private.has_active_company_role(company_id));
create policy documents_internal_insert on public.documents for insert to authenticated
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','STAFF','FINANCE']::internal_role[])
  and uploaded_by = auth.uid());
create policy documents_access_internal_read on public.document_access for select to authenticated
using (exists (select 1 from public.documents d where d.id = document_id and private.has_active_company_role(d.company_id)));
create policy documents_access_internal_write on public.document_access for insert to authenticated
with check (shared_by = auth.uid() and exists (
  select 1 from public.documents d where d.id = document_id
    and private.has_active_company_role(d.company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE','STAFF']::internal_role[])
));
create policy documents_access_internal_update on public.document_access for update to authenticated
using (exists (select 1 from public.documents d where d.id = document_id and private.has_active_company_role(d.company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE','STAFF']::internal_role[])))
with check (exists (select 1 from public.documents d where d.id = document_id and private.has_active_company_role(d.company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE','STAFF']::internal_role[])));

create policy client_users_self_read on public.client_users for select to authenticated
using (id = auth.uid());
create policy client_memberships_self_read on public.client_company_memberships for select to authenticated
using (user_id = auth.uid());
create policy invitations_internal_read on public.client_invitations for select to authenticated
using (private.has_active_company_role((select bp.company_id from public.business_partners bp where bp.id = business_partner_id)));

create policy reminders_internal_read on public.reminders for select to authenticated
using (private.has_active_company_role(company_id));
create policy reminders_internal_write on public.reminders for insert to authenticated
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE','STAFF']::internal_role[]));
create policy reminders_internal_update on public.reminders for update to authenticated
using (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE','STAFF']::internal_role[]))
with check (private.has_active_company_role(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE','STAFF']::internal_role[]));

create policy audit_internal_read on public.audit_logs for select to authenticated
using (company_id is null or private.has_active_company_role(company_id) or private.is_group_admin());
-- No insert/update/delete policy is granted to normal authenticated clients.
-- Audit events are written by trusted server-side functions.

-- Explicitly prevent application users from mutating audit history and token hashes.
revoke insert, update, delete on public.audit_logs from authenticated;
revoke select(token_hash) on public.client_invitations from authenticated;

-- Storage bucket is private. Storage policies must rely on document metadata and
-- company memberships, not on path text alone. The app should issue signed URLs
-- only after private.can_read_document/can_download_document succeeds.
insert into storage.buckets (id, name, public)
values ('business-documents', 'business-documents', false)
on conflict (id) do update set public = false;

create policy business_documents_internal_read on storage.objects
for select to authenticated
using (
  bucket_id = 'business-documents'
  and exists (
    select 1 from public.documents d
    where d.storage_path = name
      and private.has_active_company_role(d.company_id)
  )
);

-- No direct browser INSERT policy is created. Uploads must go through a
-- server-only broker that authorizes company/entity ownership, validates MIME,
-- size and hash, then writes the object with a server credential before or in
-- coordination with the documents metadata transaction. This avoids treating
-- an untrusted storage path as authorization.

create policy business_documents_internal_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'business-documents'
  and exists (
    select 1 from public.documents d
    where d.storage_path = name
      and private.has_active_company_role(d.company_id, array['GROUP_ADMIN','COMPANY_ADMIN']::internal_role[])
  )
);

commit;
