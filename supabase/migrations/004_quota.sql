-- 004_quota.sql
-- Konfigurasi kuota dan ledger append-only.
-- Catatan: quota_ledger.booking_id belum punya FK karena bookings dibuat di 005.

create table public.member_quotas (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null,
  member_id uuid not null,

  is_unlimited boolean not null default false,
  expires_at timestamptz,
  status public.quota_status not null default 'active',

  created_at timestamptz not null default now(),

  unique (tenant_id, id),
  unique (tenant_id, id, member_id),

  foreign key (tenant_id, member_id)
    references public.tenant_members (tenant_id, id)
    on delete cascade
);

create table public.quota_ledger (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null,
  quota_id uuid not null,
  booking_id uuid,

  event_type public.quota_event not null,
  quantity integer not null,

  description text,

  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),

  foreign key (tenant_id, quota_id)
    references public.member_quotas (tenant_id, id)
    on delete cascade,

  check (
    (event_type = 'reservation' and quantity = -1)
    or (event_type = 'release' and quantity = 1)
    or (event_type = 'consumed' and quantity = 0)
    or (event_type = 'grant' and quantity > 0)
    or (event_type = 'adjustment' and quantity <> 0)
  )
);

create index idx_quota_ledger_quota
  on public.quota_ledger(quota_id, created_at desc);

create index idx_quota_ledger_tenant
  on public.quota_ledger(tenant_id);
