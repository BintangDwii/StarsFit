# 10 — UI/UX Blueprint

> Tujuan: struktur pengalaman PT (desktop/tablet) dan member (mobile-first). Tema: **white & blue**, clean white dengan blue accent (menggantikan dark navy + lime).

## Navigasi PT Dashboard

```
FITFLOW
├── WORKSPACE
│   ├── Overview
│   └── Calendar
├── MANAGEMENT
│   ├── Members
│   └── Quota Management
├── COACHING
│   ├── Workout Programs
│   └── Progress Tracking
└── (bawah sidebar)
    ├── Settings
    └── Profile
```

Catatan: Bookings, Trainer Availability, Exercise Library, Attendance, dan Notifications ditunda sampai modul backend terkait tersedia.

## Overview

Empat pertanyaan yang harus dijawab dashboard:

1. Berapa member aktif saya kelola?
2. Berapa sesi latihan hari ini?
3. Siapa yang menunggu approval?
4. Siapa yang kuotanya hampir habis?

Komponen utama:

- Stat card: Active Members, Today's Sessions, Pending Bookings, Low Quota Members.
- Upcoming Sessions dengan status badge Confirmed / Pending.
- Low Quota Alert dengan progress bar.
- Tabel Pending Booking Requests (approve/reject masih visual mockup).

## Members Management (milestone berikutnya)

Tabel: Member, Status, Goal, Quota (mis. 8/12), Next Session, Action.

Detail member (tab): Overview, Quota, Bookings, Attendance, Workout, Progress, Activity History.

Fitur: search & filter, add member modal, edit, deactivate, responsive mobile.

Rencana detail: `frontend/07-status-next.md`.

## Quota Management UI

Aksi: Add quota, Reduce quota, Bonus quota, Change expiry, Set unlimited, View quota history.

Tampilkan tiga angka: Available / Reserved / Consumed, plus timeline ledger.

## Calendar

Mode: Day, Week, Month.

| Warna | Status |
|---|---|
| Kuning | Pending |
| Hijau | Confirmed |
| Biru | Checked-in |
| Abu-abu | Completed |
| Merah | Cancelled / No-show |

Klik jadwal → detail booking (approve/reject/check-in/complete).

## Member Mobile

Bottom nav: HOME, BOOKING, WORKOUT, PROGRESS, PROFILE.

Home: sisa kuota, jadwal berikutnya, tombol Book Session, workout program, progress terbaru, notifikasi.

## Alur Booking Member

1. Klik Book Session.
2. Pilih tanggal.
3. Pilih jam tersedia.
4. Pilih durasi yang diizinkan.
5. Lihat kuota tersedia.
6. Setujui cancellation policy.
7. Klik Request Booking.
8. Lihat status realtime (pending → confirmed/rejected).

## Prinsip Desain

- White background dominan; blue sebagai warna identitas.
- Sidebar putih; card dengan border tipis, bukan shadow berlebihan.
- Rounded corners 12–16px.
- Mobile-first untuk member; desktop-first untuk PT.
- Status selalu dikomunikasikan lewat warna + label (aksesibilitas).
- Konfirmasi untuk aksi destruktif (cancel, reduce quota).

## Modul Terkait

- Frontend blueprint: `frontend/plan.md`
- Design system: `frontend/01-design-system.md`
- Frontend structure: `11-frontend-structure.md`
- Booking: `06-booking-engine.md`
