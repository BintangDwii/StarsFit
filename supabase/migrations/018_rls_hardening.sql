-- 018_rls_hardening.sql
-- Denormalisasi tenant_id pada tabel turunan agar isolasi tidak bergantung join.
-- Menutup risiko yang tercatat di plan/13-decisions-risks.md.

-- ============================================================
-- attendances
-- ============================================================

alter table public.attendances add column tenant_id uuid;

update public.attendances a
set tenant_id = b.tenant_id
from public.bookings b
where b.id = a.booking_id;

alter table public.attendances alter column tenant_id set not null;

alter table public.attendances
  add constraint attendances_tenant_booking_fk
  foreign key (tenant_id, booking_id)
  references public.bookings (tenant_id, id)
  on delete cascade;

create index idx_attendances_tenant on public.attendances(tenant_id);

create or replace function public.fill_attendance_tenant()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.tenant_id is null then
    select b.tenant_id into new.tenant_id
    from public.bookings b
    where b.id = new.booking_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_attendance_tenant on public.attendances;

create trigger trg_attendance_tenant
  before insert on public.attendances
  for each row execute function public.fill_attendance_tenant();

drop policy if exists "attendances_read" on public.attendances;

create policy "attendances_read_tenant"
  on public.attendances for select
  using (
    public.is_tenant_staff(tenant_id)
    or exists (
      select 1
      from public.bookings b
      where b.id = attendances.booking_id
        and b.member_id = public.current_member_id(attendances.tenant_id)
    )
  );

-- ============================================================
-- workout_programs → composite key untuk FK turunan
-- ============================================================

alter table public.workout_programs
  add constraint workout_programs_tenant_id_unique unique (tenant_id, id);

-- ============================================================
-- program_days
-- ============================================================

alter table public.program_days add column tenant_id uuid;

update public.program_days pd
set tenant_id = wp.tenant_id
from public.workout_programs wp
where wp.id = pd.program_id;

alter table public.program_days alter column tenant_id set not null;

alter table public.program_days
  add constraint program_days_tenant_program_fk
  foreign key (tenant_id, program_id)
  references public.workout_programs (tenant_id, id)
  on delete cascade;

alter table public.program_days
  add constraint program_days_tenant_id_unique unique (tenant_id, id);

create index idx_program_days_tenant on public.program_days(tenant_id);

drop policy if exists "program_days_read" on public.program_days;

create policy "program_days_read_tenant"
  on public.program_days for select
  using (
    public.is_tenant_staff(tenant_id)
    or exists (
      select 1
      from public.workout_programs wp
      where wp.id = program_days.program_id
        and wp.member_id = public.current_member_id(program_days.tenant_id)
    )
  );

-- ============================================================
-- workout_exercises
-- ============================================================

alter table public.workout_exercises add column tenant_id uuid;

update public.workout_exercises we
set tenant_id = pd.tenant_id
from public.program_days pd
where pd.id = we.program_day_id;

alter table public.workout_exercises alter column tenant_id set not null;

alter table public.workout_exercises
  add constraint workout_exercises_tenant_day_fk
  foreign key (tenant_id, program_day_id)
  references public.program_days (tenant_id, id)
  on delete cascade;

create index idx_workout_exercises_tenant
  on public.workout_exercises(tenant_id);

drop policy if exists "workout_exercises_read" on public.workout_exercises;

create policy "workout_exercises_read_tenant"
  on public.workout_exercises for select
  using (
    public.is_tenant_staff(tenant_id)
    or exists (
      select 1
      from public.program_days pd
      join public.workout_programs wp on wp.id = pd.program_id
      where pd.id = workout_exercises.program_day_id
        and wp.member_id = public.current_member_id(workout_exercises.tenant_id)
    )
  );

grant select on public.notifications to authenticated;
