-- seed.sql
-- Data demo FitFlow untuk Supabase lokal.
-- Jalankan: supabase db reset
--
-- Akun demo (password semua: fitflow123)
--   owner@fitflow.test   (owner)
--   trainer@fitflow.test (trainer)
--   andi@fitflow.test    (member)
--   budi@fitflow.test    (member)

-- ============================================================
-- Auth users
-- ============================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'c0000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'owner@fitflow.test',
    crypt('fitflow123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Bintang Owner"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'c0000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'trainer@fitflow.test',
    crypt('fitflow123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Andi Trainer"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'c0000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'andi@fitflow.test',
    crypt('fitflow123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Andi Pratama"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'c0000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated', 'budi@fitflow.test',
    crypt('fitflow123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Budi Santoso"}',
    now(), now(), '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
values
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001',
   '{"sub":"c0000000-0000-0000-0000-000000000001","email":"owner@fitflow.test"}',
   'email', 'c0000000-0000-0000-0000-000000000001', now(), now(), now()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002',
   '{"sub":"c0000000-0000-0000-0000-000000000002","email":"trainer@fitflow.test"}',
   'email', 'c0000000-0000-0000-0000-000000000002', now(), now(), now()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003',
   '{"sub":"c0000000-0000-0000-0000-000000000003","email":"andi@fitflow.test"}',
   'email', 'c0000000-0000-0000-0000-000000000003', now(), now(), now()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004',
   '{"sub":"c0000000-0000-0000-0000-000000000004","email":"budi@fitflow.test"}',
   'email', 'c0000000-0000-0000-0000-000000000004', now(), now(), now())
on conflict do nothing;

-- ============================================================
-- Tenant + membership
-- ============================================================

insert into public.tenants (id, name, slug, timezone)
values (
  'a0000000-0000-0000-0000-000000000001',
  'PT Bintang',
  'pt-bintang',
  'Asia/Makassar'
)
on conflict (slug) do nothing;

insert into public.tenant_members (id, tenant_id, user_id, role, status)
values
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000001', 'owner', 'active'),
  ('b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000002', 'trainer', 'active'),
  ('b0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000003', 'member', 'active'),
  ('b0000000-0000-0000-0000-000000000004',
   'a0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000004', 'member', 'active')
on conflict (tenant_id, user_id) do nothing;

-- ============================================================
-- Member profiles
-- ============================================================

insert into public.member_profiles (
  tenant_id, tenant_member_id, birth_date, gender, fitness_goal, height_cm, notes
)
values
  ('a0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000003',
   '1995-04-12', 'male', 'Fat loss', 172.00,
   'Sering latihan pagi.'),
  ('a0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000004',
   '1992-09-03', 'male', 'Muscle building', 178.00, null)
on conflict (tenant_member_id) do nothing;

-- ============================================================
-- Quota + ledger
-- ============================================================

insert into public.member_quotas (
  id, tenant_id, member_id, is_unlimited, expires_at, status
)
values
  ('d0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000003',
   false, now() + interval '60 days', 'active'),
  ('d0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000004',
   true, null, 'active')
on conflict (id) do nothing;

insert into public.quota_ledger (
  id, tenant_id, quota_id, event_type, quantity, description, created_by
)
values
  ('e0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000001',
   'grant', 12, 'Initial quota by PT',
   'c0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000002',
   'grant', 1, 'Unlimited membership (audit entry)',
   'c0000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- ============================================================
-- Trainer availability (Senin-Jumat 07:00-12:00)
-- ============================================================

insert into public.trainer_availability (
  tenant_id, trainer_id, weekday, start_time, end_time, is_active
)
select
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  d, time '07:00', time '12:00', true
from generate_series(1, 5) as d
where not exists (
  select 1 from public.trainer_availability ta
  where ta.tenant_id = 'a0000000-0000-0000-0000-000000000001'
    and ta.trainer_id = 'b0000000-0000-0000-0000-000000000002'
    and ta.weekday = d
);

-- ============================================================
-- Exercise library
-- ============================================================

insert into public.exercises (name, muscle_group, equipment, description)
select v.name, v.muscle_group, v.equipment, v.description
from (
  values
    ('Barbell Squat', 'Legs', 'Barbell', 'Compound squat.'),
    ('Bench Press', 'Chest', 'Barbell', 'Flat bench press.'),
    ('Deadlift', 'Back', 'Barbell', 'Conventional deadlift.'),
    ('Pull Up', 'Back', 'Bodyweight', 'Bodyweight pull up.'),
    ('Overhead Press', 'Shoulders', 'Barbell', 'Standing overhead press.')
) as v(name, muscle_group, equipment, description)
where not exists (
  select 1 from public.exercises e where e.name = v.name
);
