-- 003_members.sql
-- Profil member per workspace.

create table public.member_profiles (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null,
  tenant_member_id uuid not null,

  birth_date date,
  gender varchar(30),
  fitness_goal varchar(150),
  height_cm numeric(5, 2),
  notes text,

  created_at timestamptz not null default now(),

  unique (tenant_member_id),

  foreign key (tenant_id, tenant_member_id)
    references public.tenant_members (tenant_id, id)
    on delete cascade
);

create index idx_member_profiles_tenant on public.member_profiles(tenant_id);
