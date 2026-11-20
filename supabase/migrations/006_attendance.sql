-- 006_attendance.sql
-- Ketersediaan trainer dan attendance sesi.

create table public.trainer_availability (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null,
  trainer_id uuid not null,

  weekday smallint not null,
  start_time time not null,
  end_time time not null,

  is_active boolean not null default true,

  check (weekday between 0 and 6),
  check (end_time > start_time),

  foreign key (tenant_id, trainer_id)
    references public.tenant_members (tenant_id, id)
    on delete cascade
);

create table public.trainer_availability_exceptions (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null,
  trainer_id uuid not null,

  exception_date date not null,
  is_available boolean not null default false,

  start_time time,
  end_time time,
  note text,

  foreign key (tenant_id, trainer_id)
    references public.tenant_members (tenant_id, id)
    on delete cascade,

  check (
    (is_available = false)
    or (
      start_time is not null
      and end_time is not null
      and end_time > start_time
    )
  )
);

create table public.attendances (
  id uuid primary key default gen_random_uuid(),

  booking_id uuid not null unique
    references public.bookings(id)
    on delete cascade,

  check_in_at timestamptz,
  completed_at timestamptz,

  status varchar(30) not null default 'present',
  trainer_notes text,

  created_at timestamptz not null default now()
);

create index idx_trainer_availability_trainer
  on public.trainer_availability(trainer_id, weekday);

create index idx_trainer_exceptions_trainer
  on public.trainer_availability_exceptions(trainer_id, exception_date);
