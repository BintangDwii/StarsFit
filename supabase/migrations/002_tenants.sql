-- 002_tenants.sql
-- Workspace PT dan keanggotaan pengguna.

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  slug varchar(100) not null unique,
  timezone varchar(60) not null default 'Asia/Makassar',
  created_at timestamptz not null default now()
);

create table public.tenant_members (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  role public.tenant_role not null,
  status public.member_status not null default 'active',

  created_at timestamptz not null default now(),

  unique (tenant_id, user_id),
  unique (tenant_id, id)
);

create index idx_tenant_members_user on public.tenant_members(user_id);
create index idx_tenant_members_tenant on public.tenant_members(tenant_id);
