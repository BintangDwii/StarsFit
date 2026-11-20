-- 022_member_progress.sql
-- Member dapat mencatat progress dirinya sendiri; trainer diambil dari assignment.

create or replace function public.record_progress(
  p_tenant uuid,
  p_member uuid,
  p_weight_kg numeric default null,
  p_body_fat_percent numeric default null,
  p_waist_cm numeric default null,
  p_chest_cm numeric default null,
  p_arm_cm numeric default null,
  p_recorded_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller public.tenant_members;
  v_trainer uuid;
  v_record_id uuid;
begin
  v_caller := public.assert_self_or_staff(p_tenant, p_member);
  perform public.get_tenant_member(p_tenant, p_member);

  if v_caller.role = 'member' and v_caller.id <> p_member then
    raise exception 'ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select trainer_id into v_trainer
  from public.trainer_assignments
  where tenant_id = p_tenant
    and member_id = p_member
  limit 1;

  insert into public.progress_records (
    tenant_id, member_id, trainer_id,
    weight_kg, body_fat_percent, waist_cm, chest_cm, arm_cm, recorded_at
  )
  values (
    p_tenant,
    p_member,
    coalesce(v_trainer, v_caller.id),
    p_weight_kg,
    p_body_fat_percent,
    p_waist_cm,
    p_chest_cm,
    p_arm_cm,
    p_recorded_at
  )
  returning id into v_record_id;

  return v_record_id;
end;
$$;

revoke all on function public.record_progress(uuid, uuid, numeric, numeric, numeric, numeric, numeric, timestamptz) from public;
grant execute on function public.record_progress(uuid, uuid, numeric, numeric, numeric, numeric, numeric, timestamptz) to authenticated;
