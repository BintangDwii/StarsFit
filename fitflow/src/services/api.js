import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const DEMO_MODE = !isSupabaseConfigured;

export function mapRpcError(error) {
  const code = error?.message || error?.code || 'UNKNOWN_ERROR';

  const messages = {
    QUOTA_INSUFFICIENT: 'Kuota member tidak mencukupi.',
    QUOTA_EXPIRED: 'Kuota sudah kedaluwarsa.',
    SLOT_CONFLICT: 'Jadwal bertabrakan dengan booking lain.',
    OUTSIDE_AVAILABILITY: 'Di luar jam ketersediaan trainer.',
    INVALID_STATE: 'Status booking tidak memungkinkan aksi ini.',
    ALREADY_MEMBER: 'Email sudah terdaftar di workspace ini.',
    AUTH_USER_NOT_FOUND: 'User dengan email tersebut belum memiliki akun.',
    QUANTITY_REQUIRED: 'Jumlah kuota harus lebih dari nol.',
    INVALID_DELTA: 'Perubahan kuota tidak boleh nol.',
  };

  return messages[code] || code;
}

export async function rpc(name, args = {}) {
  if (DEMO_MODE) {
    throw new Error('DEMO_MODE');

  }

  const { data, error } = await supabase.rpc(name, args);

  if (error) {
    throw new Error(mapRpcError(error));
  }

  return data;
}

export async function fetchWorkspaceData(tenantId) {
  const [membersData, bookingsData] = await Promise.all([
    rpc('list_members', { p_tenant: tenantId }),
    rpc('list_bookings', { p_tenant: tenantId }),
  ]);

  const quotaResults = await Promise.all(
    (membersData || []).map((member) =>
      rpc('get_member_quotas', {
        p_tenant: tenantId,
        p_member: member.id,
      })
    )
  );

  const members = (membersData || []).map((member, index) => {
    const quota = quotaResults[index]?.[0];

    return {
      id: member.id,
      name: member.full_name,
      email: member.email,
      initials: initialsOf(member.full_name),
      role: member.role,
      status: member.status,
      goal: member.fitness_goal || '-',
      height: member.height_cm,
      birthDate: member.birth_date,
      notes: member.notes || '',
      joinedAt: member.joined_at,
      quota: quota
        ? {
            id: quota.id,
            available: quota.available,
            total: quota.available + quota.reserved + quota.consumed,
            reserved: quota.reserved,
            consumed: quota.consumed,
            expiresAt: quota.expires_at,
            unlimited: quota.is_unlimited,
            status: quota.status,
          }
        : null,
    };
  });

  const bookings = (bookingsData || []).map((booking) => ({
    id: booking.id,
    memberId: booking.member_id,
    memberName: booking.member_name,
    trainerId: booking.trainer_id,
    trainerName: booking.trainer_name,
    date: booking.start_at.slice(0, 10),
    start: booking.start_at.slice(11, 16),
    end: booking.end_at.slice(11, 16),
    status: booking.status,
    note: booking.member_note || '',
  }));

  return { members, bookings };
}

export async function fetchNotifications(tenantId) {
  const data = await rpc('get_my_notifications', { p_tenant: tenantId });

  return (data || []).map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    date: item.created_at.slice(0, 10),
    read: Boolean(item.read_at),
    type: item.type,
  }));
}

export function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
