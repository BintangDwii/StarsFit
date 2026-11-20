# F11 — Session & Attendance UI

> Tujuan: mencatat kehadiran dan penyelesaian sesi latihan agar kuota tetap akurat.

## Scope

- Daftar sesi berdasarkan tanggal (default hari ini).
- Aksi: check-in, complete session, no-show, cancel.
- Ringkasan: confirmed, checked in, completed, no-show.
- Riwayat sesi terbaru dengan status.
- Responsive: tabel menjadi kartu di mobile.

## Routing

| Path | Halaman |
|---|---|
| `/attendance` | `AttendancePage` |

## Aturan

- Check-in hanya dari status `confirmed`.
- Complete hanya dari `confirmed` / `checked_in`.
- Complete mencatat ledger `consumed` dengan quantity `0` — kuota sudah ditahan saat approve.
- No-show mencatat `consumed` 0 dan kuota hangus.
- Cancel confirmed mengembalikan kuota (policy 12 jam untuk member).

## Action

Dari `useWorkspace()`: `checkInBooking`, `completeBooking`, `markNoShow`, `cancelBooking`.

RPC terkait: `check_in_booking`, `complete_booking`, `mark_no_show`, `cancel_booking` (`../013_rpc_booking.sql`).

## Modul Terkait

- Backend: `../07-session-attendance.md`
- Design: `01-design-system.md`
- Berikutnya: `12-coaching-progress.md`
