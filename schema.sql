-- L&S Business Hub — Phase 1 normalized PostgreSQL schema
-- Apply through reviewed Supabase migrations. This file is a design baseline, not a production migration.

create extension if not exists pgcrypto;

create type company_status as enum ('ACTIVE','INACTIVE','ARCHIVED');
create type membership_status as enum ('ACTIVE','INACTIVE','REVOKED');
create type internal_role as enum ('GROUP_ADMIN','COMPANY_ADMIN','FINANCE','STAFF','VIEWER');
create type partner_type as enum ('CLIENT','VENDOR','BOTH');
create type partner_status as enum ('ACTIVE','INACTIVE','ARCHIVED');
create type service_order_status as enum ('DRAFT','ACTIVE','PAUSED','COMPLETED','EXPIRED','CANCELLED');
create type billing_frequency as enum ('MONTHLY','QUARTERLY','YEARLY','ONE_TIME','CUSTOM');
create type billing_schedule_status as enum ('UPCOMING','DUE','MISSING','UPLOADED','SKIPPED','CANCELLED');
create type invoice_status as enum ('DRAFT','ISSUED','PARTIALLY_PAID','PAID','OVERDUE','CANCELLED','ARCHIVED');
create type payment_mode as enum ('BANK_TRANSFER','NEFT','RTGS','IMPS','UPI','CHEQUE','CASH','OTHER');
create type document_type as enum ('SERVICE_ORDER','INVOICE','PAYMENT_PROOF','RECEIPT','CONTRACT','STATEMENT','OTHER');
create type document_access_level as enum ('VIEW','DOWNLOAD');
create type document_access_status as enum ('ACTIVE','REVOKED','EXPIRED');
create type client_role as enum ('CLIENT_ADMIN','CLIENT_USER','CLIENT_VIEWER');
create type reminder_type as enum ('BILL_UPLOAD','PAYMENT_DUE','PAYMENT_OVERDUE','SERVICE_ORDER_EXPIRY');
create type reminder_status as enum ('PENDING','SENT','FAILED','CANCELLED');
create type actor_type as enum ('INTERNAL_USER','CLIENT_USER','SYSTEM');

create table profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  full_name text not null,
  email text not null,
  avatar_url text,
  status membership_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index profiles_email_lower_uidx on profiles (lower(email));

create table companies (
  id uuid primary key default gen_random_uuid(),
  company_code text not null unique,
  legal_name text not null,
  display_name text not null,
  gstin text,
  pan text,
  cin text,
  registered_address text,
  city text,
  state text,
  pincode text,
  email text,
  phone text,
  logo_url text,
  status company_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_company_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete restrict,
  company_id uuid not null references companies(id) on delete restrict,
  role internal_role not null,
  status membership_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, company_id, role)
);
create index user_company_roles_user_idx on user_company_roles(user_id, status);
create index user_company_roles_company_idx on user_company_roles(company_id, status);

create table business_partners (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  partner_code text not null,
  partner_type partner_type not null,
  company_name text not null,
  contact_person text,
  email text,
  phone text,
  gstin text,
  pan text,
  address text,
  city text,
  state text,
  pincode text,
  payment_terms_days integer not null default 0 check (payment_terms_days >= 0),
  notes text,
  status partner_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, partner_code),
  unique (company_id, id)
);
create index business_partners_company_name_idx on business_partners(company_id, lower(company_name));

create table service_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  business_partner_id uuid not null,
  order_number text not null,
  service_description text not null,
  start_date date not null,
  end_date date,
  contract_value numeric(19,4) not null default 0 check (contract_value >= 0),
  billing_frequency billing_frequency not null,
  billing_day smallint check (billing_day between 1 and 31),
  payment_terms_days integer not null default 0 check (payment_terms_days >= 0),
  status service_order_status not null default 'DRAFT',
  notes text,
  created_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, order_number),
  foreign key (company_id, business_partner_id) references business_partners(company_id, id),
  check (end_date is null or end_date >= start_date),
  check (billing_frequency in ('ONE_TIME','CUSTOM') or billing_day is not null)
);
create index service_orders_partner_idx on service_orders(company_id, business_partner_id, status);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  business_partner_id uuid not null,
  service_order_id uuid,
  billing_schedule_id uuid,
  invoice_number text not null,
  invoice_date date not null,
  billing_period text not null,
  due_date date not null,
  subtotal numeric(19,4) not null check (subtotal >= 0),
  gst_amount numeric(19,4) not null default 0 check (gst_amount >= 0),
  total_amount numeric(19,4) not null check (total_amount >= 0),
  currency char(3) not null default 'INR',
  notes text,
  status invoice_status not null default 'DRAFT',
  created_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, invoice_number),
  unique (company_id, id),
  foreign key (company_id, business_partner_id) references business_partners(company_id, id),
  foreign key (company_id, service_order_id) references service_orders(company_id, id),
  check (total_amount = subtotal + gst_amount)
);
create index invoices_company_due_idx on invoices(company_id, due_date, status);
create index invoices_partner_idx on invoices(company_id, business_partner_id, invoice_date desc);

create table billing_schedules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  service_order_id uuid not null,
  billing_period text not null,
  expected_bill_date date not null,
  status billing_schedule_status not null default 'UPCOMING',
  invoice_id uuid,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_order_id, billing_period),
  unique (company_id, id),
  foreign key (company_id, service_order_id) references service_orders(company_id, id),
  foreign key (company_id, invoice_id) references invoices(company_id, id)
);
create index billing_schedules_due_idx on billing_schedules(company_id, expected_bill_date, status);

alter table invoices add constraint invoices_schedule_fk foreign key (company_id, billing_schedule_id) references billing_schedules(company_id, id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  invoice_id uuid not null,
  payment_date date not null,
  amount numeric(19,4) not null check (amount > 0),
  payment_reference text,
  payment_mode payment_mode not null,
  bank_name text,
  notes text,
  created_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (company_id, invoice_id) references invoices(company_id, id)
);
create index payments_invoice_idx on payments(company_id, invoice_id, payment_date);

create table documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  entity_type text not null,
  entity_id uuid not null,
  document_type document_type not null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  file_hash text,
  uploaded_by uuid not null references profiles(id) on delete restrict,
  uploaded_at timestamptz not null default now(),
  check (mime_type in ('application/pdf','image/jpeg','image/png'))
);
create index documents_entity_idx on documents(company_id, entity_type, entity_id);
create index documents_hash_idx on documents(company_id, file_hash) where file_hash is not null;

create table document_access (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete restrict,
  client_business_partner_id uuid not null references business_partners(id) on delete restrict,
  access_level document_access_level not null,
  shared_by uuid not null references profiles(id) on delete restrict,
  shared_at timestamptz not null default now(),
  expires_at timestamptz,
  status document_access_status not null default 'ACTIVE',
  unique (document_id, client_business_partner_id),
  check (expires_at is null or expires_at > shared_at)
);
create index document_access_client_idx on document_access(client_business_partner_id, status);

create table client_users (
  id uuid primary key references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table client_company_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references client_users(id) on delete restrict,
  business_partner_id uuid not null references business_partners(id) on delete restrict,
  role client_role not null,
  status membership_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, business_partner_id)
);
create index client_memberships_user_idx on client_company_memberships(user_id, status);
create index client_memberships_partner_idx on client_company_memberships(business_partner_id, status);

create table client_invitations (
  id uuid primary key default gen_random_uuid(),
  business_partner_id uuid not null references business_partners(id) on delete restrict,
  email text not null,
  full_name text not null,
  role client_role not null,
  token_hash text not null unique,
  invited_by uuid not null references profiles(id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index client_invitations_email_idx on client_invitations(lower(email), expires_at);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  reminder_type reminder_type not null,
  entity_type text not null,
  entity_id uuid not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status reminder_status not null default 'PENDING',
  recipient text not null,
  idempotency_key text not null unique,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reminders_queue_idx on reminders(status, scheduled_for);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete restrict,
  user_id uuid references profiles(id) on delete restrict,
  actor_type actor_type not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_company_time_idx on audit_logs(company_id, created_at desc);
create index audit_logs_entity_idx on audit_logs(entity_type, entity_id, created_at desc);

-- Financial writes must be implemented as transaction-safe server functions.
-- A payment is valid only when its company_id matches the referenced invoice and
-- the locked invoice's valid payment sum does not exceed total_amount in V1.
-- RLS policies and SECURITY DEFINER helper functions are intentionally added in
-- a separate reviewed migration after the application roles are established.
