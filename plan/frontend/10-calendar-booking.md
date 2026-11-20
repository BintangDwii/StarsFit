# F10 — Calendar & Booking UI

> Tujuan: kalender sesi latihan dan pusat persetujuan booking untuk PT.

## Scope

- Kalender dengan tiga mode: Day, Week, Month.
- Navigasi tanggal (sebelumnya, hari ini, berikutnya).
- Booking ditampilkan dengan warna status.
- Panel Pending Requests dengan approve/reject.
- Detail booking dengan aksi: approve, reject, check-in, complete, no-show, cancel.
- Form booking baru (member, tanggal, jam, durasi, catatan).
- Responsive: kalender minggu becomes daftar harian di mobile.

## Routing

| Path | Halaman |
|---|---|
| `/calendar` | `CalendarPage` |

## Status & Warna

| Status | Warna |
|---|---|
| pending | kuning |
| confirmed | hijau |
| checked_in | biru |
| completed | abu-abu |
| cancelled / rejected / no_show | merah |

## Data & Action

Dari `useWorkspace()`:

- `bookings` — array booking dengan `memberId`, `date`, `start`, `end`, `status`.
- `members` — untuk form booking.
- `approveBooking`, `rejectBooking`, `cancelBooking`, `checkInBooking`, `completeBooking`, `markNoShow`, `requestBooking`.

Semua aksi demo memakai state lokal; mode Supabase memanggil RPC sesuai `013_rpc_booking.sql`.

## Komponen

| File | Tugas |
|---|---|
| `lib/dates.js` | Helper tanggal (ISO, start of week, month matrix) |
| `pages/calendar/CalendarPage.jsx` | Header, view switcher, grid, pending panel |
| `components/calendar/BookingDetailModal.jsx` | Detail + aksi status |
| `components/calendar/BookingFormModal.jsx` | Form booking baru (Zod) |

## Modul Terkait

- Backend: `../013_rpc_booking.sql`, `../06-booking-engine.md`
- Design: `01-design-system.md`
- berikutnya: `11-session-coaching.md`
