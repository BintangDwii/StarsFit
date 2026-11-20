-- 012_rpc_quota.sql
-- RPC kuota: grant, adjustment, unlimited, riwayat ledger.

create or replace function public.create_quota(
  p_tenant uuid,
  p_member uuid,
  p_quantity integer,
  p_expires_at timestamptz default null,
  p_unlimited boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_staff public.tenant_members;
  v_quota_id uuid;
  v_grant_quantity integer;
begin
  v_staff := public.assert_staff(p_tenant);
  perform public.get_tenant_member(p_tenant, p_member);

  if p_quantity is null or p_quantity <= 0 then
    if not p_unlimited then
      raise exception 'QUANTITY_REQUIRED' using errcode = 'P0001';
    end if;
    v_grant_quantity := 1;
  else
    v_grant_quantity := p_quantity;
  end if;

  insert into public.member_quotas (
    tenant_id, member_id, is_unlimited, expires_at, status
  )
  values (p_tenant, p_member, p_unlimited, p_expires_at, 'active')
  returning id into v_quota_id;

  insert into public.quota_ledger (
    tenant_id, quota_id, event_type, quantity, description, created_by
  )
  values (
    p_tenant,
    v_quota_id,
    'grant',
    v_grant_quantity,
    'Initial quota grant',
    v_staff.user_id
  );

  return v_quota_id;
end;
$$;

create or replace function public.adjust_quota(
  p_quota uuid,
  p_delta integer,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tenant uuid;
  v_staff public.tenant_members;
  v_available integer;
begin
  select tenant_id into v_tenant
  from public.member_quotas
  where id = p_quota
  for update;

  if v_tenant is null then
    raise exception 'QUOTA_NOT_FOUND' using errcode = 'P0001';
  end if;

  v_staff := public.assert_staff(v_tenant);

  if p_delta is null or p_delta = 0 then
    raise exception 'INVALID_DELTA' using errcode = 'P0001';
  end if;

  v_available := public.quota_available(p_quota);

  if p_delta < 0 and v_available + p_delta < 0 then
    raise exception 'QUOTA_INSUFFICIENT' using errcode = 'P0001';
  end if;

  insert into public.quota_ledger (
    tenant_id, quota_id, event_type, quantity, description, created_by
  )
  values (
    v_tenant,
    p_quota,
    'adjustment',
    p_delta,
    coalesce(p_description, 'Manual adjustment'),
    v_staff.user_id
  );
end;
$$;

create or replace function public.set_unlimited_quota(
  p_quota uuid,
  p_unlimited boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tenant uuid;
begin
  select tenant_id into v_tenant
  from public.member_quotas
  where id = p_quota;

  if v_tenant is null then
    raise exception 'QUOTA_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform public.assert_staff(v_tenant);

  update public.member_quotas
  set is_unlimited = p_unlimited
  where id = p_quota;
end;
$$;

create or replace function public.get_quota_history(p_quota uuid)
returns table (
  id uuid,
  event_type public.quota_event,
  quantity integer,
  description text,
  booking_id uuid,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_tenant uuid;
  v_member uuid;
begin
  select tenant_id, member_id into v_tenant, v_member
  from public.member_quotas
  where id = p_quota;

  if v_tenant is null then
    raise exception 'QUOTA_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform public.assert_self_or_staff(v_tenant, v_member);

  return query
  select
    ql.id,
    ql.event_type,
    ql.quantity,
    ql.description,
    ql.booking_id,
    ql.created_at
  from public.quota_ledger ql
  where ql.quota_id = p_quota
  order by ql.created_at desc;
end;
$$;

create or replace function public.get_member_quotas(
  p_tenant uuid,
  p_member uuid
)
returns table (
  id uuid,
  is_unlimited boolean,
  expires_at timestamptz,
  status public.quota_status,
  available integer,
  reserved integer,
  consumed integer,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.assert_self_or_staff(p_tenant, p_member);

  return query
  select
    mq.id,
    mq.is_unlimited,
    mq.expires_at,
    mq.status,
    coalesce(sum(ql.quantity), 0)::integer as available,
    coalesce(sum(ql.quantity) filter (where ql.event_type = 'reservation'), 0)::integer * -1 as reserved,
    count(ql.id) filter (where ql.event_type = 'consumed')::integer as consumed,
    mq.created_at
  from public.member_quotas mq
  left join public.quota_ledger ql on ql.quota_id = mq.id
  where mq.tenant_id = p_tenant
    and mq.member_id = p_member
  group by mq.id, mq.is_unlimited, mq.expires_at, mq.status, mq.created_at
  order by mq.created_at desc;
end;
$$;

revoke all on function public.create_quota(uuid, uuid, integer, timestamptz, boolean) from public;
revoke all on function public.adjust_quota(uuid, integer, text) from public;
revoke all on function public.set_unlimited_quota(uuid, boolean) from public;
revoke all on function public.get_quota_history(uuid) from public;
revoke all on function public.get_member_quotas(uuid, uuid) from public;

grant execute on function public.create_quota(uuid, uuid, integer, timestamptz, boolean) to authenticated;
grant execute on function public.adjust_quota(uuid, integer, text) to authenticated;
grant execute on function public.set_unlimited_quota(uuid, boolean) to authenticated;
grant execute on function public.get_quota_history(uuid) to authenticated;
grant execute on function public.get_member_quotas(uuid, uuid) to authenticated;
