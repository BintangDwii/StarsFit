-- 014_rpc_dashboard_jobs.sql
-- Ringkasan dashboard & job expiry.

create or replace function public.get_dashboard_stats(p_tenant uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
  v_tz text;
  v_active_members integer;
  v_today_sessions integer;
  v_pending_bookings integer;
  v_low_quota integer;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  select t.timezone into v_tz from public.tenants t where t.id = p_tenant;
  v_tz := coalesce(v_tz, 'UTC');

  select count(*)::integer into v_active_members
  from public.tenant_members tm
  where tm.tenant_id = p_tenant
    and tm.role = 'member'
    and tm.status = 'active';

  select count(*)::integer into v_today_sessions
  from public.bookings b
  where b.tenant_id = p_tenant
    and b.status in ('confirmed', 'checked_in')
    and (b.start_at at time zone v_tz)::date = (now() at time zone v_tz)::date;

  select count(*)::integer into v_pending_bookings
  from public.bookings b
  where b.tenant_id = p_tenant
    and b.status = 'pending';

  select count(*)::integer into v_low_quota
  from (
    select mq.member_id
    from public.member_quotas mq
    left join public.quota_ledger ql on ql.quota_id = mq.id
    where mq.tenant_id = p_tenant
      and mq.status = 'active'
      and not mq.is_unlimited
    group by mq.member_id
    having coalesce(sum(ql.quantity), 0) between 1 and 2
  ) low_quota;

  return jsonb_build_object(
    'activeMembers', v_active_members,
    'todaySessions', v_today_sessions,
    'pendingBookings', v_pending_bookings,
    'lowQuotaMembers', v_low_quota
  );
end;
$$;

create or replace function public.get_upcoming_sessions(p_tenant uuid)
returns table (
  id uuid,
  member_id uuid,
  member_name text,
  start_at timestamptz,
  end_at timestamptz,
  status public.booking_status
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
    coalesce(u.raw_user_meta_data ->> 'full_name', u.email::text) as member_name,
    b.start_at,
    b.end_at,
    b.status
  from public.bookings b
  join public.tenant_members tm on tm.id = b.member_id
  join auth.users u on u.id = tm.user_id
  where b.tenant_id = p_tenant
    and b.status in ('confirmed', 'checked_in')
    and v_caller.role in ('owner', 'trainer')
  order by b.start_at
  limit 10;
end;
$$;

create or replace function public.get_pending_requests(p_tenant uuid)
returns table (
  id uuid,
  member_id uuid,
  member_name text,
  start_at timestamptz,
  end_at timestamptz,
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
    coalesce(u.raw_user_meta_data ->> 'full_name', u.email::text) as member_name,
    b.start_at,
    b.end_at,
    b.member_note
  from public.bookings b
  join public.tenant_members tm on tm.id = b.member_id
  join auth.users u on u.id = tm.user_id
  where b.tenant_id = p_tenant
    and b.status = 'pending'
    and v_caller.role in ('owner', 'trainer')
  order by b.start_at
  limit 20;
end;
$$;

create or replace function public.expire_pending_bookings()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  update public.bookings
  set status = 'rejected'
  where status = 'pending'
    and created_at < now() - interval '15 minutes';

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.expire_quotas()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  update public.member_quotas
  set status = 'expired'
  where status = 'active'
    and expires_at is not null
    and expires_at < now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.get_dashboard_stats(uuid) from public;
revoke all on function public.get_upcoming_sessions(uuid) from public;
revoke all on function public.get_pending_requests(uuid) from public;
revoke all on function public.expire_pending_bookings() from public;
revoke all on function public.expire_quotas() from public;

grant execute on function public.get_dashboard_stats(uuid) to authenticated;
grant execute on function public.get_upcoming_sessions(uuid) to authenticated;
grant execute on function public.get_pending_requests(uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.expire_pending_bookings() to service_role;
    grant execute on function public.expire_quotas() to service_role;
  end if;
end
$$;
