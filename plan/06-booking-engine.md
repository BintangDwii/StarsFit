# 06 — Booking & Scheduling Engine

> Tujuan: alur booking member → approval PT dengan validasi jadwal dan kuota.

## Status Booking

`pending` → `confirmed` → `checked_in` → `completed`

Cabang: `rejected`, `cancelled`, `no_show`.

| Status | Menahan kuota | Menahan slot |
|---|---|---|
| `pending` | tidak | ya (anti overlap) |
| `confirmed` | ya | ya |
| `checked_in` | ya | ya |
| `completed` | final | tidak |
| `rejected` / `cancelled` | tidak | tidak |
| `no_show` | final | tidak |

## Workflow Request Booking

1. Member login.
2. Buka kalender.
3. Pilih tanggal → sistem tampilkan slot tersedia.
4. Pilih jam + durasi yang diizinkan.
5. Sistem validasi.
6. Buat booking `pending`.
7. PT menerima notifikasi.
8. PT approve/reject.
9. Jika approve → kuota direservasi -1, status `confirmed`.

## Checklist Validasi Slot

Wajib dicek di `get_available_slots` dan `request_booking`:

- Jam kerja `trainer_availability` untuk weekday terkait.
- `trainer_availability_exceptions` (libur / override).
- Konflik booking trainer (pending/confirmed/checked_in).
- Konflik booking member sendiri.
- Durasi sesi valid.
- Status member `active`.
- Kuota aktif, belum expired, saldo > 0 (kecuali unlimited).
- `start_at` di masa depan.

Exclusion constraint di database menjadi lapisan pengaman terakhir.

## Workflow Approve / Reject

`approve_booking(booking_id)` (atomik):

1. Lock booking, pastikan status `pending`.
2. Validasi ulang slot & kuota.
3. Cek saldo (kecuali unlimited).
4. Insert ledger `reservation` -1.
5. Set status `confirmed`.

`reject_booking(booking_id)` → status `rejected`, tanpa perubahan kuota.

## Reschedule

- Hanya untuk `pending`/`confirmed`.
- Validasi slot baru dengan checklist yang sama.
- Pindahkan `start_at`/`end_at` dalam satu transaksi.
- Untuk `confirmed`, reservasi tetap -1 (tidak release lalu reserve ulang) agar tidak flicker saldo.
- Exclusion constraint akan menolak overlap baru.

## Cancellation Policy (per tenant)

| Kondisi | Aksi | Kuota |
|---|---|---|
| Pending dibatalkan | `cancelled` | tidak berubah |
| Confirmed dibatalkan sebelum deadline | `cancelled` | `release` +1 |
| Confirmed dibatalkan setelah deadline | `cancelled` | hangus |
| PT membatalkan | `cancelled` | `release` +1 |
| No-show | `no_show` | hangus (`consumed` 0) |
| Completed dibatalkan | ditolak | — |

Default policy yang disarankan:

- Cancellation deadline: 12 jam sebelum sesi.
- PT cancel: kuota selalu kembali.
- No-show: kuota hangus.
- Policy ditampilkan sebelum member booking.

## Auto-Expire Pending

Booking `pending` yang tidak diputuskan dalam batas waktu (default 15 menit, configurable) otomatis menjadi `rejected`/`expired`. Dijalankan job terjadwal.

## Notifikasi

- Request masuk → notifikasi PT.
- Approve/reject → notifikasi member.
- Reminder H-1 / beberapa jam sebelum sesi.

## Modul Terkait

- Quota: `05-quota-engine.md`
- Session: `07-session-attendance.md`
- RPC: `09-backend-rpc.md`
