-- 013_rpc_booking.sql
-- RPC booking: slot availability, request, approve, reject, cancel, reschedule, session.

create or replace function public.assert_booking_slot(
  p_tenant uuid,
  p_trainer uuid,
  p_member uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_exclude_booking uuid default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tz text;
  v_weekday smallint;
  v_local_date date;
  v_local_start time;
  v_local_end time;
  v_exc record;
  v_exc_found boolean := false;
  v_covered boolean := false;
  v_minutes numeric;
begin
  if p_start_at is null or p_end_at is null or p_end_at <= p_start_at then
    raise exception 'INVALID_DURATION' using errcode = 'P0001';
  end if;

  v_minutes := extract(epoch from (p_end_at - p_start_at)) / 60;

  perform public.assert_session_duration(p_tenant, v_minutes::integer);

  if p_start_at <= now() then
    raise exception 'PAST_SLOT' using errcode = 'P0001';
  end if;

  select t.timezone into v_tz
  from public.tenants t
  where t.id = p_tenant;

  v_tz := coalesce(v_tz, 'UTC');
  v_local_date := (p_start_at at time zone v_tz)::date;
  v_local_start := (p_start_at at time zone v_tz)::time;
  v_local_end := (p_end_at at time zone v_tz)::time;
  v_weekday := extract(dow from v_local_date)::smallint;

  select * into v_exc
  from public.trainer_availability_exceptions e
  where e.tenant_id = p_tenant
    and e.trainer_id = p_trainer
    and e.exception_date = v_local_date
  limit 1;

  v_exc_found := found;

  if v_exc_found and v_exc.is_available = false then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  if v_exc_found and v_exc.is_available = true then
    v_covered := v_local_start >= v_exc.start_time
      and v_local_end <= v_exc.end_time;
  else
    select exists (
      select 1
      from public.trainer_availability a
      where a.tenant_id = p_tenant
        and a.trainer_id = p_trainer
        and a.weekday = v_weekday
        and a.is_active = true
        and v_local_start >= a.start_time
        and v_local_end <= a.end_time
    ) into v_covered;
  end if;

  if not v_covered then
    raise exception 'OUTSIDE_AVAILABILITY' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.bookings b
    where b.tenant_id = p_tenant
      and b.status in ('pending', 'confirmed', 'checked_in')
      and (p_exclude_booking is null or b.id <> p_exclude_booking)
      and (b.trainer_id = p_trainer or b.member_id = p_member)
      and tstzrange(b.start_at, b.end_at, '[)') && tstzrange(p_start_at, p_end_at, '[)')
  ) then
    raise exception 'SLOT_CONFLICT' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.get_available_slots(
  p_tenant uuid,
  p_trainer uuid,
  p_date date,
  p_duration_minutes integer default 60
)
returns table (start_at timestamptz, end_at timestamptz)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
  v_tz text;
  v_weekday smallint;
  v_exc record;
  v_exc_found boolean := false;
  v_has_exception_block boolean := false;
begin
  v_caller := public.assert_tenant_access(p_tenant);
  perform public.get_tenant_member(p_tenant, p_trainer);

  perform public.assert_session_duration(p_tenant, p_duration_minutes);

  select t.timezone into v_tz
  from public.tenants t
  where t.id = p_tenant;

  v_tz := coalesce(v_tz, 'UTC');
  v_weekday := extract(dow from p_date)::smallint;

  select * into v_exc
  from public.trainer_availability_exceptions e
  where e.tenant_id = p_tenant
    and e.trainer_id = p_trainer
    and e.exception_date = p_date
  limit 1;

  v_exc_found := found;

  if v_exc_found and v_exc.is_available = false then
    v_has_exception_block := true;
  end if;

  return query
  with windows as (
    select a.start_time as win_start, a.end_time as win_end
    from public.trainer_availability a
    where a.tenant_id = p_tenant
      and a.trainer_id = p_trainer
      and a.weekday = v_weekday
      and a.is_active = true
      and not v_has_exception_block
    union all
    select v_exc.start_time, v_exc.end_time
    where v_exc_found and v_exc.is_available = true
  ),
  candidates as (
    select
      ((p_date + w.win_start) at time zone v_tz)
        + (g || ' minutes')::interval as slot_start
    from windows w
    cross join lateral generate_series(
      0,
      (extract(epoch from (w.win_end - w.win_start)) / 60)::integer - p_duration_minutes,
      p_duration_minutes
    ) as g
  )
  select
    c.slot_start,
    c.slot_start + (p_duration_minutes || ' minutes')::interval
  from candidates c
  where c.slot_start > now()
    and not exists (
      select 1
      from public.bookings b
      where b.tenant_id = p_tenant
        and b.trainer_id = p_trainer
        and b.status in ('pending', 'confirmed', 'checked_in')
        and tstzrange(b.start_at, b.end_at, '[)')
          && tstzrange(
            c.slot_start,
            c.slot_start + (p_duration_minutes || ' minutes')::interval,
            '[)'
          )
    );
end;
$$;

create or replace function public.request_booking(
  p_tenant uuid,
  p_trainer uuid,
  p_quota uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_member_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
  v_trainer public.tenant_members;
  v_booking_id uuid;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  if v_caller.role <> 'member' then
    raise exception 'MEMBER_ONLY' using errcode = 'P0001';
  end if;

  v_trainer := public.get_tenant_member(p_tenant, p_trainer);

  if v_trainer.role not in ('owner', 'trainer') then
    raise exception 'INVALID_TRAINER' using errcode = 'P0001';
  end if;

  perform public.assert_quota_usable(p_tenant, p_quota, v_caller.id);
  perform public.assert_booking_slot(
    p_tenant, p_trainer, v_caller.id, p_start_at, p_end_at, null
  );

  insert into public.bookings (
    tenant_id, member_id, trainer_id, quota_id,
    start_at, end_at, status, member_note
  )
  values (
    p_tenant, v_caller.id, p_trainer, p_quota,
    p_start_at, p_end_at, 'pending', p_member_note
  )
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

create or replace function public.approve_booking(p_booking uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking public.bookings;
  v_staff public.tenant_members;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_booking.status = 'confirmed' then
    return;
  end if;

  if v_booking.status <> 'pending' then
    raise exception 'INVALID_STATE' using errcode = 'P0001';
  end if;

  v_staff := public.assert_staff(v_booking.tenant_id);
  perform public.assert_self_or_staff(v_booking.tenant_id, v_booking.member_id);

  perform public.assert_booking_slot(
    v_booking.tenant_id,
    v_booking.trainer_id,
    v_booking.member_id,
    v_booking.start_at,
    v_booking.end_at,
    p_booking
  );

  perform public.assert_quota_usable(
    v_booking.tenant_id, v_booking.quota_id, v_booking.member_id
  );

  insert into public.quota_ledger (
    tenant_id, quota_id, booking_id, event_type, quantity, description, created_by
  )
  values (
    v_booking.tenant_id,
    v_booking.quota_id,
    p_booking,
    'reservation',
    -1,
    'Booking approved',
    v_staff.user_id
  );

  update public.bookings
  set status = 'confirmed'
  where id = p_booking;
end;
$$;

create or replace function public.reject_booking(p_booking uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_booking.status = 'rejected' then
    return;
  end if;

  if v_booking.status <> 'pending' then
    raise exception 'INVALID_STATE' using errcode = 'P0001';
  end if;

  perform public.assert_staff(v_booking.tenant_id);
  perform public.assert_self_or_staff(v_booking.tenant_id, v_booking.member_id);

  update public.bookings
  set status = 'rejected'
  where id = p_booking;
end;
$$;

create or replace function public.cancel_booking(
  p_booking uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking public.bookings;
  v_caller public.tenant_members;
  v_release boolean := false;
  v_staff_user uuid;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'P0001';
  end if;

  v_caller := public.assert_self_or_staff(v_booking.tenant_id, v_booking.member_id);

  if v_booking.status in ('cancelled', 'rejected', 'completed', 'no_show') then
    raise exception 'INVALID_STATE' using errcode = 'P0001';
  end if;

  if v_booking.status = 'checked_in' and v_caller.role = 'member' then
    raise exception 'INVALID_STATE' using errcode = 'P0001';
  end if;

  if v_caller.role in ('owner', 'trainer') then
    v_release := true;
  elsif v_booking.status = 'confirmed'
    and v_booking.start_at - now() >= interval '12 hours' then
    v_release := true;
  end if;

  if v_release then
    v_staff_user := v_caller.user_id;

    insert into public.quota_ledger (
      tenant_id, quota_id, booking_id, event_type, quantity, description, created_by
    )
    values (
      v_booking.tenant_id,
      v_booking.quota_id,
      p_booking,
      'release',
      1,
      'Booking cancelled',
      v_staff_user
    );
  end if;

  update public.bookings
  set status = 'cancelled',
      cancellation_reason = p_reason
  where id = p_booking;
end;
$$;

create or replace function public.reschedule_booking(
  p_booking uuid,
  p_start_at timestamptz,
  p_end_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform public.assert_self_or_staff(v_booking.tenant_id, v_booking.member_id);

  if v_booking.status not in ('pending', 'confirmed') then
    raise exception 'INVALID_STATE' using errcode = 'P0001';
  end if;

  perform public.assert_booking_slot(
    v_booking.tenant_id,
    v_booking.trainer_id,
    v_booking.member_id,
    p_start_at,
    p_end_at,
    p_booking
  );

  update public.bookings
  set start_at = p_start_at,
      end_at = p_end_at
  where id = p_booking;
end;
$$;

create or replace function public.check_in_booking(p_booking uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform public.assert_staff(v_booking.tenant_id);
  perform public.assert_self_or_staff(v_booking.tenant_id, v_booking.member_id);

  if v_booking.status = 'checked_in' then
    return;
  end if;

  if v_booking.status <> 'confirmed' then
    raise exception 'INVALID_STATE' using errcode = 'P0001';
  end if;

  update public.bookings
  set status = 'checked_in'
  where id = p_booking;

  insert into public.attendances (booking_id, check_in_at)
  values (p_booking, now())
  on conflict (booking_id) do update
  set check_in_at = excluded.check_in_at;
end;
$$;

create or replace function public.complete_booking(
  p_booking uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking public.bookings;
  v_staff public.tenant_members;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'P0001';
  end if;

  v_staff := public.assert_staff(v_booking.tenant_id);
  perform public.assert_self_or_staff(v_booking.tenant_id, v_booking.member_id);

  if v_booking.status = 'completed' then
    return;
  end if;

  if v_booking.status not in ('confirmed', 'checked_in') then
    raise exception 'INVALID_STATE' using errcode = 'P0001';
  end if;

  insert into public.quota_ledger (
    tenant_id, quota_id, booking_id, event_type, quantity, description, created_by
  )
  values (
    v_booking.tenant_id,
    v_booking.quota_id,
    p_booking,
    'consumed',
    0,
    'Session completed',
    v_staff.user_id
  );

  insert into public.attendances (
    booking_id, check_in_at, completed_at, status, trainer_notes
  )
  values (p_booking, now(), now(), 'completed', p_notes)
  on conflict (booking_id) do update
  set completed_at = excluded.completed_at,
      status = 'completed',
      trainer_notes = coalesce(excluded.trainer_notes, public.attendances.trainer_notes);

  update public.bookings
  set status = 'completed'
  where id = p_booking;
end;
$$;

create or replace function public.mark_no_show(p_booking uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking public.bookings;
  v_staff public.tenant_members;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'P0001';
  end if;

  v_staff := public.assert_staff(v_booking.tenant_id);
  perform public.assert_self_or_staff(v_booking.tenant_id, v_booking.member_id);

  if v_booking.status = 'no_show' then
    return;
  end if;

  if v_booking.status not in ('confirmed', 'checked_in') then
    raise exception 'INVALID_STATE' using errcode = 'P0001';
  end if;

  insert into public.quota_ledger (
    tenant_id, quota_id, booking_id, event_type, quantity, description, created_by
  )
  values (
    v_booking.tenant_id,
    v_booking.quota_id,
    p_booking,
    'consumed',
    0,
    'No-show',
    v_staff.user_id
  );

  insert into public.attendances (booking_id, completed_at, status)
  values (p_booking, now(), 'no_show')
  on conflict (booking_id) do update
  set completed_at = excluded.completed_at,
      status = 'no_show';

  update public.bookings
  set status = 'no_show'
  where id = p_booking;
end;
$$;

create or replace function public.list_bookings(
  p_tenant uuid,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  id uuid,
  member_id uuid,
  member_name text,
  trainer_id uuid,
  trainer_name text,
  start_at timestamptz,
  end_at timestamptz,
  status public.booking_status,
  member_note text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  return query
  select
    b.id,
    b.member_id,
    coalesce(u.email::text, 'member') as member_name,
    b.trainer_id,
    coalesce(tu.email::text, 'trainer') as trainer_name,
    b.start_at,
    b.end_at,
    b.status,
    b.member_note
  from public.bookings b
  join auth.users u on u.id = (select user_id from public.tenant_members where id = b.member_id)
  join auth.users tu on tu.id = (select user_id from public.tenant_members where id = b.trainer_id)
  where b.tenant_id = p_tenant
    and (v_caller.role in ('owner', 'trainer') or b.member_id = v_caller.id)
    and (p_from is null or b.start_at >= p_from)
    and (p_to is null or b.start_at < p_to)
  order by b.start_at;
end;
$$;

revoke all on function public.assert_booking_slot(uuid, uuid, uuid, timestamptz, timestamptz, uuid) from public;
revoke all on function public.get_available_slots(uuid, uuid, date, integer) from public;
revoke all on function public.request_booking(uuid, uuid, uuid, timestamptz, timestamptz, text) from public;
revoke all on function public.approve_booking(uuid) from public;
revoke all on function public.reject_booking(uuid) from public;
revoke all on function public.cancel_booking(uuid, text) from public;
revoke all on function public.reschedule_booking(uuid, timestamptz, timestamptz) from public;
revoke all on function public.check_in_booking(uuid) from public;
revoke all on function public.complete_booking(uuid, text) from public;
revoke all on function public.mark_no_show(uuid) from public;
revoke all on function public.list_bookings(uuid, timestamptz, timestamptz) from public;

grant execute on function public.assert_booking_slot(uuid, uuid, uuid, timestamptz, timestamptz, uuid) to authenticated;
grant execute on function public.get_available_slots(uuid, uuid, date, integer) to authenticated;
grant execute on function public.request_booking(uuid, uuid, uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.approve_booking(uuid) to authenticated;
grant execute on function public.reject_booking(uuid) to authenticated;
grant execute on function public.cancel_booking(uuid, text) to authenticated;
grant execute on function public.reschedule_booking(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function public.check_in_booking(uuid) to authenticated;
grant execute on function public.complete_booking(uuid, text) to authenticated;
grant execute on function public.mark_no_show(uuid) to authenticated;
grant execute on function public.list_bookings(uuid, timestamptz, timestamptz) to authenticated;
