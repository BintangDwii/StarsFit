import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  demoAssignments,
  demoBookings,
  demoExercises,
  demoMembers,
  demoNotifications,
  demoProgress,
  demoPrograms,
  demoTrainers,
  demoWorkspace,
  dayOffset,
} from '../data/mockApp';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  DEMO_MODE,
  fetchNotifications,
  fetchWorkspaceData,
  rpc,
} from '../services/api';

import { WorkspaceContext } from './workspaceContext';

const newId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function WorkspaceProvider({ children }) {
  const [members, setMembers] = useState(demoMembers);
  const [bookings, setBookings] = useState(demoBookings);
  const [programs, setPrograms] = useState(demoPrograms);
  const [progress, setProgress] = useState(demoProgress);
  const [notifications, setNotifications] = useState(demoNotifications);
  const [assignments, setAssignments] = useState(demoAssignments);
  const [exercises, setExercises] = useState(demoExercises);
  const [loading, setLoading] = useState(false);

  const { tenantId: authTenantId, user } = useAuth();
  const tenantId = authTenantId || demoWorkspace.id;

  const refresh = useCallback(async () => {
    if (DEMO_MODE || !authTenantId) return;

    setLoading(true);
    try {
      const [data, items, assignmentRows, exerciseRows] = await Promise.all([
        fetchWorkspaceData(tenantId),
        fetchNotifications(tenantId),
        rpc('list_assignments', { p_tenant: tenantId }),
        rpc('list_exercises', { p_tenant: tenantId }),
      ]);
      setMembers(data.members);
      setBookings(data.bookings);
      setNotifications(items);
      setAssignments(assignmentRows || []);
      setExercises(
        (exerciseRows || []).map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          muscleGroup: exercise.muscle_group,
          equipment: exercise.equipment,
          description: exercise.description,
          isGlobal: exercise.is_global,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [authTenantId, tenantId]);

  useEffect(() => {
    if (DEMO_MODE || !authTenantId) return undefined;

    let active = true;

    (async () => {
      const [data, items, assignmentRows, exerciseRows] = await Promise.all([
        fetchWorkspaceData(tenantId),
        fetchNotifications(tenantId),
        rpc('list_assignments', { p_tenant: tenantId }),
        rpc('list_exercises', { p_tenant: tenantId }),
      ]);
      if (active) {
        setMembers(data.members);
        setBookings(data.bookings);
        setNotifications(items);
        setAssignments(assignmentRows || []);
        setExercises(
          (exerciseRows || []).map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            muscleGroup: exercise.muscle_group,
            equipment: exercise.equipment,
            description: exercise.description,
            isGlobal: exercise.is_global,
          }))
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [authTenantId, tenantId]);

  useEffect(() => {
    if (DEMO_MODE || !authTenantId || !supabase) return undefined;

    const channel = supabase
      .channel(`fitflow-workspace-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => refresh()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quota_ledger',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => refresh()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authTenantId, refresh, tenantId, user?.id]);

  const patchMember = useCallback((id, updater) => {
    setMembers((current) =>
      current.map((member) =>
        member.id === id ? updater(member) : member
      )
    );
  }, []);

  const addNotification = useCallback((title, body) => {
    setNotifications((current) => [
      { id: newId('n'), title, body, date: dayOffset(0), read: false },
      ...current,
    ]);
  }, []);

  const addMember = useCallback(
    async (payload) => {
      const id = newId('m');

      if (DEMO_MODE) {
        const member = {
          id,
          name: payload.name,
          initials: payload.name
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join(''),
          email: payload.email,
          phone: payload.phone || '',
          status: 'active',
          role: payload.role || 'member',
          goal: payload.goal || '-',
          height: payload.height || null,
          birthDate: payload.birthDate || null,
          joinedAt: dayOffset(0),
          notes: payload.notes || '',
          quota: {
            id: newId('q'),
            available: Number(payload.quantity) || 0,
            total: Number(payload.quantity) || 0,
            reserved: 0,
            consumed: 0,
            expiresAt: payload.expiresAt || null,
            unlimited: Boolean(payload.unlimited),
            status: 'active',
            history: [
              {
                id: newId('h'),
                type: 'grant',
                quantity: Number(payload.quantity) || 1,
                description: 'Initial quota grant',
                date: dayOffset(0),
              },
            ],
          },
        };

        setMembers((current) => [member, ...current]);
        addNotification('Member baru', `${member.name} ditambahkan ke workspace.`);
        return member;
      }

      const createdId = await rpc('create_member', {
        p_tenant: tenantId,
        p_email: payload.email,
        p_full_name: payload.name,
        p_role: payload.role || 'member',
        p_fitness_goal: payload.goal || null,
      });

      await rpc('create_quota', {
        p_tenant: tenantId,
        p_member: createdId,
        p_quantity: Number(payload.quantity) || 1,
        p_expires_at: payload.expiresAt || null,
        p_unlimited: Boolean(payload.unlimited),
      });

      await refresh();
      return { id: createdId };
    },
    [addNotification, refresh, tenantId]
  );

  const updateMember = useCallback(
    async (id, patch) => {
      if (DEMO_MODE) {
        patchMember(id, (member) => ({ ...member, ...patch }));
        return;
      }

      await rpc('update_member', {
        p_tenant: tenantId,
        p_member: id,
        p_status: patch.status || null,
        p_fitness_goal: patch.goal || null,
        p_notes: patch.notes || null,
        p_birth_date: patch.birthDate || null,
        p_height_cm: patch.height || null,
      });
      await refresh();
    },
    [patchMember, refresh, tenantId]
  );

  const deactivateMember = useCallback(
    async (id) => updateMember(id, { status: 'inactive' }),
    [updateMember]
  );

  const createQuota = useCallback(
    async (memberId, payload) => {
      if (DEMO_MODE) {
        patchMember(memberId, (member) => ({
          ...member,
          quota: {
            id: newId('q'),
            available: Number(payload.quantity) || 0,
            total: Number(payload.quantity) || 0,
            reserved: 0,
            consumed: 0,
            expiresAt: payload.expiresAt || null,
            unlimited: Boolean(payload.unlimited),
            status: 'active',
            history: [
              {
                id: newId('h'),
                type: 'grant',
                quantity: Number(payload.quantity) || 1,
                description: 'New quota package',
                date: dayOffset(0),
              },
            ],
          },
        }));
        return;
      }

      await rpc('create_quota', {
        p_tenant: tenantId,
        p_member: memberId,
        p_quantity: Number(payload.quantity) || 1,
        p_expires_at: payload.expiresAt || null,
        p_unlimited: Boolean(payload.unlimited),
      });
      await refresh();
    },
    [patchMember, refresh, tenantId]
  );

  const adjustQuota = useCallback(
    async (memberId, delta, description) => {
      if (DEMO_MODE) {
        patchMember(memberId, (member) => {
          const available = Math.max(0, member.quota.available + delta);
          return {
            ...member,
            quota: {
              ...member.quota,
              available,
              total: Math.max(0, member.quota.total + delta),
              history: [
                {
                  id: newId('h'),
                  type: 'adjustment',
                  quantity: delta,
                  description: description || 'Manual adjustment',
                  date: dayOffset(0),
                },
                ...(member.quota.history || []),
              ],
            },
          };
        });
        return;
      }

      const target = members.find((member) => member.id === memberId);
      await rpc('adjust_quota', {
        p_quota: target?.quota?.id,
        p_delta: delta,
        p_description: description,
      });
      await refresh();
    },
    [members, patchMember, refresh]
  );

  const setUnlimitedQuota = useCallback(
    async (memberId, unlimited) => {
      if (DEMO_MODE) {
        patchMember(memberId, (member) => ({
          ...member,
          quota: { ...member.quota, unlimited },
        }));
        return;
      }

      const target = members.find((member) => member.id === memberId);
      await rpc('set_unlimited_quota', {
        p_quota: target?.quota?.id,
        p_unlimited: unlimited,
      });
      await refresh();
    },
    [members, patchMember, refresh]
  );

  const changeBookingStatus = useCallback(
    (id, status, extra = {}) => {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, status, ...extra } : booking
        )
      );
    },
    []
  );

  const applyQuotaEvent = useCallback(
    (memberId, eventType, quantity, description) => {
      patchMember(memberId, (member) => ({
        ...member,
        quota: {
          ...member.quota,
          available: Math.max(0, member.quota.available + quantity),
          reserved:
            eventType === 'reservation'
              ? member.quota.reserved + 1
              : eventType === 'release'
                ? Math.max(0, member.quota.reserved - 1)
                : member.quota.reserved,
          consumed:
            eventType === 'consumed'
              ? member.quota.consumed + 1
              : member.quota.consumed,
          history: [
            {
              id: newId('h'),
              type: eventType,
              quantity,
              description,
              date: dayOffset(0),
            },
            ...(member.quota.history || []),
          ],
        },
      }));
    },
    [patchMember]
  );

  const requestBooking = useCallback(
    async (payload) => {
      const id = newId('bk');
      const trainer = demoTrainers[0];
      const member = members.find((item) => item.id === payload.memberId);

      if (DEMO_MODE) {
        setBookings((current) => [
          ...current,
          {
            id,
            memberId: payload.memberId,
            memberName: member?.name || 'Member',
            trainerId: trainer.id,
            date: payload.date,
            start: payload.start,
            end: payload.end,
            status: 'pending',
            note: payload.note || '',
          },
        ]);
        addNotification('Booking request', `${member?.name || 'Member'} mengajukan sesi baru.`);
        return id;
      }

      const createdId = await rpc('request_booking', {
        p_tenant: tenantId,
        p_trainer: trainer.id,
        p_quota: member?.quota?.id,
        p_start_at: `${payload.date}T${payload.start}:00+08:00`,
        p_end_at: `${payload.date}T${payload.end}:00+08:00`,
        p_member_note: payload.note || null,
      });
      await refresh();
      return createdId;
    },
    [addNotification, members, refresh, tenantId]
  );

  const approveBooking = useCallback(
    async (id) => {
      const booking = bookings.find((item) => item.id === id);
      if (!booking || booking.status !== 'pending') return;

      if (DEMO_MODE) {
        const member = members.find((item) => item.id === booking.memberId);
        changeBookingStatus(id, 'confirmed');
        if (!member?.quota?.unlimited) {
          applyQuotaEvent(booking.memberId, 'reservation', -1, 'Booking approved');
        }
        addNotification('Booking disetujui', `${booking.memberName} dikonfirmasi.`);
        return;
      }

      await rpc('approve_booking', { p_booking: id });
      await refresh();
    },
    [addNotification, applyQuotaEvent, bookings, changeBookingStatus, members, refresh]
  );

  const rejectBooking = useCallback(
    async (id) => {
      const booking = bookings.find((item) => item.id === id);
      if (!booking || booking.status !== 'pending') return;

      if (DEMO_MODE) {
        changeBookingStatus(id, 'rejected');
        return;
      }

      await rpc('reject_booking', { p_booking: id });
      await refresh();
    },
    [bookings, changeBookingStatus, refresh]
  );

  const cancelBooking = useCallback(
    async (id) => {
      const booking = bookings.find((item) => item.id === id);
      if (!booking) return;

      if (DEMO_MODE) {
        changeBookingStatus(id, 'cancelled');
        if (booking.status === 'confirmed') {
          applyQuotaEvent(booking.memberId, 'release', 1, 'Booking cancelled');
        }
        return;
      }

      await rpc('cancel_booking', { p_booking: id, p_reason: 'Cancelled from dashboard' });
      await refresh();
    },
    [applyQuotaEvent, bookings, changeBookingStatus, refresh]
  );

  const checkInBooking = useCallback(
    async (id) => {
      if (DEMO_MODE) {
        changeBookingStatus(id, 'checked_in');
        return;
      }
      await rpc('check_in_booking', { p_booking: id });
      await refresh();
    },
    [changeBookingStatus, refresh]
  );

  const completeBooking = useCallback(
    async (id, notes) => {
      const booking = bookings.find((item) => item.id === id);
      if (!booking) return;

      if (DEMO_MODE) {
        changeBookingStatus(id, 'completed');
        applyQuotaEvent(booking.memberId, 'consumed', 0, 'Session completed');
        return;
      }

      await rpc('complete_booking', { p_booking: id, p_notes: notes || null });
      await refresh();
    },
    [applyQuotaEvent, bookings, changeBookingStatus, refresh]
  );

  const markNoShow = useCallback(
    async (id) => {
      const booking = bookings.find((item) => item.id === id);
      if (!booking) return;

      if (DEMO_MODE) {
        changeBookingStatus(id, 'no_show');
        applyQuotaEvent(booking.memberId, 'consumed', 0, 'No-show');
        return;
      }

      await rpc('mark_no_show', { p_booking: id });
      await refresh();
    },
    [applyQuotaEvent, bookings, changeBookingStatus, refresh]
  );

  const addProgress = useCallback(
    async (memberId, record) => {
      const entry = {
        id: newId('pr'),
        date: dayOffset(0),
        weight: Number(record.weight) || null,
        bodyFat: Number(record.bodyFat) || null,
        waist: Number(record.waist) || null,
        chest: Number(record.chest) || null,
        arm: Number(record.arm) || null,
      };

      if (DEMO_MODE) {
        setProgress((current) => ({
          ...current,
          [memberId]: [entry, ...(current[memberId] || [])],
        }));
        return;
      }

      await rpc('record_progress', {
        p_tenant: tenantId,
        p_member: memberId,
        p_weight_kg: entry.weight,
        p_body_fat_percent: entry.bodyFat,
        p_waist_cm: entry.waist,
        p_chest_cm: entry.chest,
        p_arm_cm: entry.arm,
      });
    },
    [tenantId]
  );

  const createProgram = useCallback(
    async (memberId, title) => {
      const program = {
        id: newId('p'),
        memberId,
        title,
        startDate: dayOffset(0),
        endDate: dayOffset(90),
        isActive: true,
        days: [],
      };

      if (DEMO_MODE) {
        setPrograms((current) => [program, ...current]);
        return program;
      }

      const id = await rpc('create_workout_program', {
        p_tenant: tenantId,
        p_member: memberId,
        p_title: title,
      });
      return { ...program, id };
    },
    [tenantId]
  );

  const assignTrainer = useCallback(
    async (trainerId, memberId) => {
      if (DEMO_MODE) {
        setAssignments((current) =>
          current.some(
            (item) => item.trainerId === trainerId && item.memberId === memberId
          )
            ? current
            : [...current, { id: newId('as'), trainerId, memberId }]
        );
        return;
      }

      await rpc('assign_trainer', {
        p_tenant: tenantId,
        p_trainer: trainerId,
        p_member: memberId,
      });
      await refresh();
    },
    [refresh, tenantId]
  );

  const unassignTrainer = useCallback(
    async (trainerId, memberId) => {
      if (DEMO_MODE) {
        setAssignments((current) =>
          current.filter(
            (item) =>
              !(item.trainerId === trainerId && item.memberId === memberId)
          )
        );
        return;
      }

      await rpc('unassign_trainer', {
        p_tenant: tenantId,
        p_trainer: trainerId,
        p_member: memberId,
      });
      await refresh();
    },
    [refresh, tenantId]
  );

  const createExercise = useCallback(
    async (payload) => {
      if (DEMO_MODE) {
        setExercises((current) => [
          {
            id: newId('ex'),
            name: payload.name,
            muscleGroup: payload.muscleGroup || '',
            equipment: payload.equipment || '',
            description: payload.description || '',
            isGlobal: false,
          },
          ...current,
        ]);
        return;
      }

      await rpc('create_exercise', {
        p_tenant: tenantId,
        p_name: payload.name,
        p_muscle_group: payload.muscleGroup || null,
        p_equipment: payload.equipment || null,
        p_description: payload.description || null,
      });
      await refresh();
    },
    [refresh, tenantId]
  );

  const markNotificationRead = useCallback(
    async (id) => {
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      );

      if (!DEMO_MODE) {
        await rpc('mark_notification_read', { p_notification: id });
      }
    },
    []
  );

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );

    if (!DEMO_MODE) {
      await rpc('mark_all_notifications_read', { p_tenant: tenantId });
    }
  }, [tenantId]);

  const stats = useMemo(() => {
    const activeMembers = members.filter(
      (member) => member.status === 'active'
    ).length;
    const pendingBookings = bookings.filter(
      (booking) => booking.status === 'pending'
    ).length;
    const todaySessions = bookings.filter(
      (booking) =>
        booking.date === dayOffset(0) &&
        ['confirmed', 'checked_in', 'completed'].includes(booking.status)
    ).length;
    const lowQuota = members.filter(
      (member) =>
        member.status === 'active' &&
        member.quota &&
        !member.quota.unlimited &&
        member.quota.available <= 2
    ).length;

    return { activeMembers, todaySessions, pendingBookings, lowQuota };
  }, [members, bookings]);

  const value = useMemo(
    () => ({
      demoMode: DEMO_MODE,
      loading,
      workspace: demoWorkspace,
      trainers: demoTrainers,
      members,
      bookings,
      programs,
      progress,
      notifications,
      assignments,
      exercises,
      stats,
      addMember,
      updateMember,
      deactivateMember,
      createQuota,
      adjustQuota,
      setUnlimitedQuota,
      requestBooking,
      approveBooking,
      rejectBooking,
      cancelBooking,
      checkInBooking,
      completeBooking,
      markNoShow,
      addProgress,
      createProgram,
      assignTrainer,
      unassignTrainer,
      createExercise,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      loading,
      members,
      bookings,
      programs,
      progress,
      notifications,
      assignments,
      exercises,
      stats,
      addMember,
      updateMember,
      deactivateMember,
      createQuota,
      adjustQuota,
      setUnlimitedQuota,
      requestBooking,
      approveBooking,
      rejectBooking,
      cancelBooking,
      checkInBooking,
      completeBooking,
      markNoShow,
      addProgress,
      createProgram,
      assignTrainer,
      unassignTrainer,
      createExercise,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
