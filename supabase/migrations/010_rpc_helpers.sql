-- 010_rpc_helpers.sql
-- Helper validasi tenant/role/kuota untuk seluruh RPC.
-- Semua helper SECURITY DEFINER: RLS dilewati, otorisasi dicek eksplisit.

create or replace function public.assert_tenant_access(p_tenant uuid)
returns public.tenant_members
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_member public.tenant_members;
begin
  select * into v_member
  from public.tenant_members
  where tenant_id = p_tenant
    and user_id = auth.uid()
    and status = 'active';

  if not found then
    raise exception 'TENANT_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  return v_member;
end;
$$;

create or replace function public.assert_staff(p_tenant uuid)
returns public.tenant_members
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_member public.tenant_members;
begin
  v_member := public.assert_tenant_access(p_tenant);

  if v_member.role not in ('owner', 'trainer') then
    raise exception 'STAFF_ONLY' using errcode = 'P0001';
  end if;

  return v_member;
end;
$$;

create or replace function public.assert_self_or_staff(
  p_tenant uuid,
  p_member uuid
)
returns public.tenant_members
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
begin
  v_caller := public.assert_tenant_access(p_tenant);

  if v_caller.role in ('owner', 'trainer') or v_caller.id = p_member then
    return v_caller;
  end if;

  raise exception 'ACCESS_DENIED' using errcode = 'P0001';
end;
$$;

create or replace function public.get_tenant_member(
  p_tenant uuid,
  p_member uuid
)
returns public.tenant_members
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_member public.tenant_members;
begin
  select * into v_member
  from public.tenant_members
  where tenant_id = p_tenant
    and id = p_member
    and status = 'active';

  if not found then
    raise exception 'MEMBER_NOT_FOUND' using errcode = 'P0001';
  end if;

  return v_member;
end;
$$;

create or replace function public.quota_available(p_quota uuid)
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(sum(quantity), 0)::integer
  from public.quota_ledger
  where quota_id = p_quota;
$$;

create or replace function public.assert_quota_usable(
  p_tenant uuid,
  p_quota uuid,
  p_member uuid
)
returns public.member_quotas
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_quota public.member_quotas;
begin
  select * into v_quota
  from public.member_quotas
  where tenant_id = p_tenant
    and id = p_quota
    and member_id = p_member
    and status = 'active';

  if not found then
    raise exception 'QUOTA_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_quota.expires_at is not null and v_quota.expires_at <= now() then
    raise exception 'QUOTA_EXPIRED' using errcode = 'P0001';
  end if;

  if not v_quota.is_unlimited and public.quota_available(p_quota) <= 0 then
    raise exception 'QUOTA_INSUFFICIENT' using errcode = 'P0001';
  end if;

  return v_quota;
end;
$$;

revoke all on function public.assert_tenant_access(uuid) from public;
revoke all on function public.assert_staff(uuid) from public;
revoke all on function public.assert_self_or_staff(uuid, uuid) from public;
revoke all on function public.get_tenant_member(uuid, uuid) from public;
revoke all on function public.quota_available(uuid) from public;
revoke all on function public.assert_quota_usable(uuid, uuid, uuid) from public;

grant execute on function public.assert_tenant_access(uuid) to authenticated;
grant execute on function public.assert_staff(uuid) to authenticated;
grant execute on function public.assert_self_or_staff(uuid, uuid) to authenticated;
grant execute on function public.get_tenant_member(uuid, uuid) to authenticated;
grant execute on function public.quota_available(uuid) to authenticated;
grant execute on function public.assert_quota_usable(uuid, uuid, uuid) to authenticated;
