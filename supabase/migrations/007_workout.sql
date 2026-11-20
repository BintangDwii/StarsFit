-- 007_workout.sql
-- Program latihan dan exercise library.

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  muscle_group varchar(100),
  equipment varchar(100),
  description text
);

create table public.workout_programs (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null references public.tenants(id) on delete cascade,
  trainer_id uuid not null,
  member_id uuid not null,

  title varchar(150) not null,
  start_date date,
  end_date date,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),

  foreign key (tenant_id, trainer_id)
    references public.tenant_members (tenant_id, id),

  foreign key (tenant_id, member_id)
    references public.tenant_members (tenant_id, id)
);

create table public.program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null
    references public.workout_programs(id) on delete cascade,
  day_name varchar(50) not null
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid not null
    references public.program_days(id) on delete cascade,
  exercise_id uuid not null
    references public.exercises(id),
  sets integer not null,
  reps integer not null,
  target_weight numeric(7, 2),
  rest_seconds integer default 60
);

create index idx_workout_programs_member
  on public.workout_programs(member_id, is_active);

create index idx_program_days_program
  on public.program_days(program_id);

create index idx_workout_exercises_day
  on public.workout_exercises(program_day_id);
