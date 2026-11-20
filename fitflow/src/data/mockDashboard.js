export const dashboardStats = [
  {
    label: 'Active Members',
    value: '24',
    description: 'Currently training',
    trend: '+12%',
    icon: 'users',
    color: 'blue',
  },
  {
    label: "Today's Sessions",
    value: '06',
    description: 'Scheduled today',
    trend: 'Today',
    icon: 'calendar',
    color: 'green',
  },
  {
    label: 'Pending Bookings',
    value: '03',
    description: 'Waiting for approval',
    trend: 'Action needed',
    icon: 'clock',
    color: 'orange',
  },
  {
    label: 'Low Quota Members',
    value: '04',
    description: '2 sessions or less',
    trend: 'Attention',
    icon: 'alert',
    color: 'red',
  },
];

export const upcomingSessions = [
  {
    id: 1,
    member: 'Andi Pratama',
    initials: 'AP',
    program: 'Strength Training',
    time: '07:00 - 08:00',
    status: 'confirmed',
  },
  {
    id: 2,
    member: 'Sarah Putri',
    initials: 'SP',
    program: 'Fat Loss',
    time: '09:00 - 10:00',
    status: 'confirmed',
  },
  {
    id: 3,
    member: 'Budi Santoso',
    initials: 'BS',
    program: 'Muscle Building',
    time: '13:00 - 14:00',
    status: 'pending',
  },
  {
    id: 4,
    member: 'Nadia Amelia',
    initials: 'NA',
    program: 'Full Body Workout',
    time: '16:00 - 17:00',
    status: 'confirmed',
  },
];

export const pendingBookings = [
  {
    id: 1,
    member: 'Rizky Ramadhan',
    initials: 'RR',
    date: '22 Nov 2026',
    time: '08:00 - 09:00',
  },
  {
    id: 2,
    member: 'Dewi Anggraini',
    initials: 'DA',
    date: '22 Nov 2026',
    time: '10:00 - 11:00',
  },
  {
    id: 3,
    member: 'Fajar Nugraha',
    initials: 'FN',
    date: '23 Nov 2026',
    time: '15:00 - 16:00',
  },
];

export const lowQuotaMembers = [
  {
    id: 1,
    name: 'Andi Pratama',
    remaining: 1,
    total: 12,
  },
  {
    id: 2,
    name: 'Sarah Putri',
    remaining: 2,
    total: 8,
  },
  {
    id: 3,
    name: 'Budi Santoso',
    remaining: 1,
    total: 10,
  },
];
