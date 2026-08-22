-- L&S Business Hub — fictional DEMO/SAMPLE seed data only
-- NEVER run this against production. All names, identifiers, contacts, amounts,
-- addresses and emails below are synthetic and use example.invalid domains.
-- No uploaded documents or storage objects are created by this seed.

begin;

-- These synthetic identities exist only to support local RLS testing. They are
-- not real Google accounts and cannot be used as production users.
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'demo.internal.admin@example.invalid', '', now(), '{"provider":"google","providers":["google"]}', '{"full_name":"DEMO Internal Admin"}'),
  ('10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'demo.internal.finance@example.invalid', '', now(), '{"provider":"google","providers":["google"]}', '{"full_name":"DEMO Finance User"}'),
  ('10000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'demo.client.alpha@example.invalid', '', now(), '{"provider":"google","providers":["google"]}', '{"full_name":"DEMO Client Alpha User"}'),
  ('10000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'demo.client.beta@example.invalid', '', now(), '{"provider":"google","providers":["google"]}', '{"full_name":"DEMO Client Beta User"}'),
  ('10000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'demo.client.gamma@example.invalid', '', now(), '{"provider":"google","providers":["google"]}', '{"full_name":"DEMO Client Gamma User"}'),
  ('10000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'demo.client.delta@example.invalid', '', now(), '{"provider":"google","providers":["google"]}', '{"full_name":"DEMO Client Delta User"}'),
  ('10000000-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'demo.internal.user.a@example.invalid', '', now(), '{"provider":"google","providers":["google"]}', '{"full_name":"DEMO Internal User A"}'),
  ('10000000-0000-4000-8000-000000000008', 'authenticated', 'authenticated', 'demo.internal.user.b@example.invalid', '', now(), '{"provider":"google","providers":["google"]}', '{"full_name":"DEMO Internal User B"}')
on conflict (id) do nothing;

insert into profiles (id, full_name, email)
values
  ('10000000-0000-4000-8000-000000000001', 'DEMO Internal Admin', 'demo.internal.admin@example.invalid'),
  ('10000000-0000-4000-8000-000000000002', 'DEMO Finance User', 'demo.internal.finance@example.invalid'),
  ('10000000-0000-4000-8000-000000000003', 'DEMO Client Alpha User', 'demo.client.alpha@example.invalid'),
  ('10000000-0000-4000-8000-000000000004', 'DEMO Client Beta User', 'demo.client.beta@example.invalid'),
  ('10000000-0000-4000-8000-000000000005', 'DEMO Client Gamma User', 'demo.client.gamma@example.invalid'),
  ('10000000-0000-4000-8000-000000000006', 'DEMO Client Delta User', 'demo.client.delta@example.invalid'),
  ('10000000-0000-4000-8000-000000000007', 'DEMO Internal User A', 'demo.internal.user.a@example.invalid'),
  ('10000000-0000-4000-8000-000000000008', 'DEMO Internal User B', 'demo.internal.user.b@example.invalid')
on conflict (id) do update set full_name = excluded.full_name, email = excluded.email;

insert into companies (id, company_code, legal_name, display_name, registered_address, city, state, pincode, email, phone)
values
  ('20000000-0000-4000-8000-000000000001', 'DEMO-LS-001', 'DEMO LIFT & SHIFT OPERATIONS PRIVATE LIMITED', 'DEMO LIFT & SHIFT', 'DEMO ADDRESS — NOT A REAL ADDRESS', 'DEMO CITY', 'DEMO STATE', '000000', 'demo.ls@example.invalid', '+00-0000000000'),
  ('20000000-0000-4000-8000-000000000002', 'DEMO-SIS-001', 'DEMO SISTER COMPANY ONE PRIVATE LIMITED', 'DEMO SISTER COMPANY ONE', 'DEMO ADDRESS — NOT A REAL ADDRESS', 'DEMO CITY', 'DEMO STATE', '000000', 'demo.sister@example.invalid', '+00-0000000000')
on conflict (id) do nothing;

insert into user_company_roles (id, user_id, company_id, role)
values
  ('21000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'GROUP_ADMIN'),
  ('21000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'GROUP_ADMIN'),
  ('21000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'FINANCE'),
  ('21000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'FINANCE'),
  ('21000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000001', 'FINANCE'),
  ('21000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000002', 'FINANCE')
on conflict (id) do nothing;

-- Four distinct fictional client organizations: two per internal company.
insert into business_partners (id, company_id, partner_code, partner_type, company_name, contact_person, email, phone, address, city, state, pincode, payment_terms_days, notes)
values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'DEMO-CLIENT-ALPHA', 'CLIENT', 'DEMO CLIENT ALPHA ORGANIZATION', 'DEMO CONTACT ALPHA', 'client.alpha@example.invalid', '+00-0000000001', 'DEMO ADDRESS ALPHA — NOT REAL', 'DEMO CITY A', 'DEMO STATE A', '000001', 30, 'DEMO/SAMPLE RECORD — fictional client.'),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'DEMO-CLIENT-BETA', 'CLIENT', 'DEMO CLIENT BETA ORGANIZATION', 'DEMO CONTACT BETA', 'client.beta@example.invalid', '+00-0000000002', 'DEMO ADDRESS BETA — NOT REAL', 'DEMO CITY B', 'DEMO STATE B', '000002', 45, 'DEMO/SAMPLE RECORD — fictional client.'),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'DEMO-CLIENT-GAMMA', 'CLIENT', 'DEMO CLIENT GAMMA ORGANIZATION', 'DEMO CONTACT GAMMA', 'client.gamma@example.invalid', '+00-0000000003', 'DEMO ADDRESS GAMMA — NOT REAL', 'DEMO CITY C', 'DEMO STATE C', '000003', 30, 'DEMO/SAMPLE RECORD — fictional client.'),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', 'DEMO-CLIENT-DELTA', 'CLIENT', 'DEMO CLIENT DELTA ORGANIZATION', 'DEMO CONTACT DELTA', 'client.delta@example.invalid', '+00-0000000004', 'DEMO ADDRESS DELTA — NOT REAL', 'DEMO CITY D', 'DEMO STATE D', '000004', 15, 'DEMO/SAMPLE RECORD — fictional client.')
on conflict (id) do nothing;

insert into client_users (id)
values
  ('10000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000004'),
  ('10000000-0000-4000-8000-000000000005'),
  ('10000000-0000-4000-8000-000000000006')
on conflict (id) do nothing;

insert into client_company_memberships (id, user_id, business_partner_id, role)
values
  ('31000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001', 'CLIENT_ADMIN'),
  ('31000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002', 'CLIENT_USER'),
  ('31000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000003', 'CLIENT_ADMIN'),
  ('31000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000004', 'CLIENT_VIEWER')
on conflict (id) do nothing;

insert into service_orders (id, company_id, business_partner_id, order_number, service_description, start_date, contract_value, billing_frequency, billing_day, payment_terms_days, status, notes, created_by)
values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'DEMO-SO-ALPHA-001', 'DEMO monthly managed service', '2026-01-01', 100000.00, 'MONTHLY', 5, 30, 'ACTIVE', 'DEMO/SAMPLE only.', '10000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', 'DEMO-SO-BETA-001', 'DEMO quarterly support service', '2026-01-01', 240000.00, 'QUARTERLY', 10, 45, 'ACTIVE', 'DEMO/SAMPLE only.', '10000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', 'DEMO-SO-GAMMA-001', 'DEMO annual advisory service', '2026-01-01', 480000.00, 'YEARLY', 15, 30, 'ACTIVE', 'DEMO/SAMPLE only.', '10000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000004', 'DEMO-SO-DELTA-001', 'DEMO one-time implementation service', '2026-02-01', 75000.00, 'ONE_TIME', null, 15, 'ACTIVE', 'DEMO/SAMPLE only.', '10000000-0000-4000-8000-000000000002')
on conflict (id) do nothing;

insert into invoices (id, company_id, business_partner_id, service_order_id, invoice_number, invoice_date, billing_period, due_date, subtotal, gst_amount, total_amount, notes, status, created_by)
values
  ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'DEMO-INV-ALPHA-001', '2026-08-05', 'DEMO-AUG-2026', '2026-09-04', 100000.00, 18000.00, 118000.00, 'DEMO/SAMPLE invoice — fictional.', 'PARTIALLY_PAID', '10000000-0000-4000-8000-000000000002'),
  ('50000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'DEMO-INV-BETA-001', '2026-07-10', 'DEMO-Q3-2026', '2026-08-24', 200000.00, 36000.00, 236000.00, 'DEMO/SAMPLE invoice — fictional.', 'ISSUED', '10000000-0000-4000-8000-000000000002'),
  ('50000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003', 'DEMO-INV-GAMMA-001', '2026-01-15', 'DEMO-FY-2026', '2026-02-14', 480000.00, 86400.00, 566400.00, 'DEMO/SAMPLE invoice — fictional.', 'PAID', '10000000-0000-4000-8000-000000000002'),
  ('50000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004', 'DEMO-INV-DELTA-001', '2026-02-01', 'DEMO-ONE-TIME-2026', '2026-02-16', 75000.00, 13500.00, 88500.00, 'DEMO/SAMPLE invoice — fictional.', 'OVERDUE', '10000000-0000-4000-8000-000000000002')
on conflict (id) do nothing;

insert into payments (id, company_id, invoice_id, payment_date, amount, payment_reference, payment_mode, bank_name, notes, created_by)
values
  ('60000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '2026-08-20', 50000.00, 'DEMO-PAY-ALPHA-001', 'BANK_TRANSFER', 'DEMO BANK — NOT REAL', 'DEMO/SAMPLE payment — fictional.', '10000000-0000-4000-8000-000000000002'),
  ('60000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000003', '2026-02-10', 566400.00, 'DEMO-PAY-GAMMA-001', 'NEFT', 'DEMO BANK — NOT REAL', 'DEMO/SAMPLE payment — fictional.', '10000000-0000-4000-8000-000000000002')
on conflict (id) do nothing;

-- No storage objects or documents are seeded intentionally. A secure document
-- test should create a fake file in a disposable local bucket separately.

insert into audit_logs (id, company_id, user_id, actor_type, action, entity_type, entity_id, metadata)
values
  ('70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'SYSTEM', 'DEMO_SEED_APPLIED', 'SEED', null, '{"label":"DEMO/SAMPLE","fictional":true}'),
  ('70000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'SYSTEM', 'DEMO_SEED_APPLIED', 'SEED', null, '{"label":"DEMO/SAMPLE","fictional":true}')
on conflict (id) do nothing;

commit;
