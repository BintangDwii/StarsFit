-- 005_booking.sql
-- Booking sesi, composite FK, anti double-booking, dan FK ledger -> booking.

create table public.bookings (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null,
  member_id uuid not null,
  trainer_id uuid not null,
  quota_id uuid not null,

  start_at timestamptz not null,
  end_at timestamptz not null,

  status public.booking_status not null default 'pending',

  member_note text,
  cancellation_reason text,

  created_at timestamptz not null default now(),

  check (end_at > start_at),

  unique (tenant_id, id),

  foreign key (tenant_id, member_id)
    references public.tenant_members (tenant_id, id),

  foreign key (tenant_id, trainer_id)
    references public.tenant_members (tenant_id, id),

  -- Kuota harus milik member yang sama, bukan sekadar tenant yang sama.
  foreign key (tenant_id, quota_id, member_id)
    references public.member_quotas (tenant_id, id, member_id)
);

-- FK ledger -> booking (bookings baru tersedia sekarang).
alter table public.quota_ledger
  add constraint quota_ledger_booking_fk
  foreign key (tenant_id, booking_id)
  references public.bookings (tenant_id, id)
  on delete set null;

-- Idempotency: satu event per tipe per booking.
alter table public.quota_ledger
  add constraint quota_ledger_booking_event_unique
  unique (booking_id, event_type);

create index idx_bookings_trainer_time
  on public.bookings(trainer_id, start_at);

create index idx_bookings_member_time
  on public.bookings(member_id, start_at);

create index idx_bookings_tenant_status
  on public.bookings(tenant_id, status);

-- Anti double-booking untuk trainer.
alter table public.bookings
  add constraint prevent_trainer_overlap
  exclude using gist (
    tenant_id with =,
    trainer_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  )
  where (status in ('pending', 'confirmed', 'checked_in'));

-- Anti double-booking untuk member.
alter table public.bookings
  add constraint prevent_member_overlap
  exclude using gist (
    tenant_id with =,
    member_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  )
  where (status in ('pending', 'confirmed', 'checked_in'));
