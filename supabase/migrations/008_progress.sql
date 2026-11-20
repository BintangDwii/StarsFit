-- 008_progress.sql
-- Catatan progress tubuh member.

create table public.progress_records (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null,
  member_id uuid not null,
  trainer_id uuid not null,

  weight_kg numeric(6, 2),
  body_fat_percent numeric(5, 2),
  waist_cm numeric(5, 2),
  chest_cm numeric(5, 2),
  arm_cm numeric(5, 2),

  recorded_at timestamptz not null default now(),

  foreign key (tenant_id, member_id)
    references public.tenant_members (tenant_id, id)
    on delete cascade,

  foreign key (tenant_id, trainer_id)
    references public.tenant_members (tenant_id, id)
);

create index idx_progress_records_member
  on public.progress_records(member_id, recorded_at desc);
