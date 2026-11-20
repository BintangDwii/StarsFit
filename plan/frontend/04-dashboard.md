# F04 — Dashboard PT

> Tujuan: halaman Overview yang menjawab empat pertanyaan utama personal trainer.

## Pertanyaan Dashboard

1. Berapa banyak member yang saya kelola? → **Active Members**
2. Berapa sesi latihan hari ini? → **Today's Sessions**
3. Siapa yang menunggu approval? → **Pending Bookings**
4. Siapa yang kuotanya hampir habis? → **Low Quota Members**

## `src/data/mockDashboard.js`

Data dipisahkan dari komponen agar mudah diganti API Supabase.

| Export | Isi |
|---|---|
| `dashboardStats` | 4 stat card: label, value, description, trend, icon, color |
| `upcomingSessions` | 4 sesi: member, initials, program, time, status |
| `pendingBookings` | 3 booking: member, initials, date, time |
| `lowQuotaMembers` | 3 member: name, remaining, total |

Icon stat dipetakan lewat objek `statIcons`: `users → Users`, `calendar → CalendarDays`, `clock → Clock3`, `alert → AlertCircle`.

Warna stat (`blue`, `green`, `orange`, `red`) memetakan class `stat-icon--*` dan `stat-trend--*`.

## `src/pages/trainer/DashboardPage.jsx`

Komponen internal:

| Komponen | Tugas |
|---|---|
| `StatCard` | Kartu statistik dengan icon, value, description, trend |
| `StatusBadge` | Badge `Confirmed` (hijau) / `Pending` (kuning) |
| `SectionHeader` | Judul section + text button "View ..." |

Struktur halaman:

1. `.page-heading.dashboard-heading` — eyebrow tanggal, sapaan, deskripsi, tombol **Manage Schedule**.
2. `.stats-grid` — 4 `StatCard`.
3. `.dashboard-grid` — `Upcoming Sessions` (1.5fr) + `Low Quota Alert` (1fr).
4. `.pending-card` — tabel **Pending Booking Requests** dengan kolom MEMBER, DATE, TIME, STATUS, ACTION.

Progress bar kuota: `(remaining / total) * 100`, warna orange.

## Batasan

- Tombol approve/reject pada tabel **hanya visual mockup**.
- Jangan mengaktifkan aksi tersebut sebelum backend booking dan transaksi quota selesai (lihat `../05-quota-engine.md` dan `../06-booking-engine.md`).
- Semua angka dan nama adalah data contoh, bukan dari database.

## Modul Terkait

- Data source pengganti: `../03-database-schema.md`
- styling: `05-global-styles.md`
