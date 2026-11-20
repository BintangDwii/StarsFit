-- 009_rls.sql
-- Helper functions dan Row Level Security untuk isolasi multi-tenant.

-- ============================================================
-- Helper functions (SECURITY DEFINER agar tidak rekursif RLS)
-- ============================================================

create or replace function public.is_tenant_member(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = target_tenant
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
  );
$$;

create or replace function public.is_tenant_staff(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = target_tenant
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
      and tm.role in ('owner', 'trainer')
  );
$$;

create or replace function public.current_member_id(target_tenant uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select tm.id
  from public.tenant_members tm
  where tm.tenant_id = target_tenant
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
  limit 1;
$$;

-- ============================================================
-- Enable RLS
-- ============================================================

alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.member_profiles enable row level security;
alter table public.member_quotas enable row level security;
alter table public.quota_ledger enable row level security;
alter table public.bookings enable row level security;
alter table public.trainer_availability enable row level security;
alter table public.trainer_availability_exceptions enable row level security;
alter table public.attendances enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_programs enable row level security;
alter table public.program_days enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.progress_records enable row level security;

-- ============================================================
-- Read policies (tulis hanya lewat RPC / service role)
-- ============================================================

create policy "tenants_read_members"
  on public.tenants for select
  using (public.is_tenant_member(id));

create policy "tenant_members_read"
  on public.tenant_members for select
  using (
    public.is_tenant_staff(tenant_id)
    or user_id = (select auth.uid())
  );

create policy "member_profiles_read"
  on public.member_profiles for select
  using (
    public.is_tenant_staff(tenant_id)
    or tenant_member_id = public.current_member_id(tenant_id)
  );

create policy "member_quotas_read"
  on public.member_quotas for select
  using (
    public.is_tenant_staff(tenant_id)
    or member_id = public.current_member_id(tenant_id)
  );

create policy "quota_ledger_read"
  on public.quota_ledger for select
  using (
    public.is_tenant_staff(tenant_id)
    or exists (
      select 1
      from public.member_quotas q
      where q.id = quota_ledger.quota_id
        and q.member_id = public.current_member_id(quota_ledger.tenant_id)
    )
  );

create policy "bookings_read"
  on public.bookings for select
  using (
    public.is_tenant_staff(tenant_id)
    or member_id = public.current_member_id(tenant_id)
  );

create policy "trainer_availability_read"
  on public.trainer_availability for select
  using (public.is_tenant_member(tenant_id));

create policy "trainer_availability_exceptions_read"
  on public.trainer_availability_exceptions for select
  using (public.is_tenant_member(tenant_id));

create policy "attendances_read"
  on public.attendances for select
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = attendances.booking_id
        and (
          public.is_tenant_staff(b.tenant_id)
          or b.member_id = public.current_member_id(b.tenant_id)
        )
    )
  );

create policy "exercises_read_authenticated"
  on public.exercises for select
  using ((select auth.uid()) is not null);

create policy "workout_programs_read"
  on public.workout_programs for select
  using (
    public.is_tenant_staff(tenant_id)
    or member_id = public.current_member_id(tenant_id)
  );

create policy "program_days_read"
  on public.program_days for select
  using (
    exists (
      select 1
      from public.workout_programs wp
      where wp.id = program_days.program_id
        and (
          public.is_tenant_staff(wp.tenant_id)
          or wp.member_id = public.current_member_id(wp.tenant_id)
        )
    )
  );

create policy "workout_exercises_read"
  on public.workout_exercises for select
  using (
    exists (
      select 1
      from public.program_days pd
      join public.workout_programs wp on wp.id = pd.program_id
      where pd.id = workout_exercises.program_day_id
        and (
          public.is_tenant_staff(wp.tenant_id)
          or wp.member_id = public.current_member_id(wp.tenant_id)
        )
    )
  );

create policy "progress_records_read"
  on public.progress_records for select
  using (
    public.is_tenant_staff(tenant_id)
    or member_id = public.current_member_id(tenant_id)
  );

-- ============================================================
-- Privileges: client hanya boleh SELECT. Mutasi lewat RPC.
-- ============================================================

grant usage on schema public to authenticated;

grant select on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
