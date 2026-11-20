# 07 — Session & Attendance

> Tujuan: mencatat pelaksanaan sesi dan memastikan kuota tidak terpotong dua kali.

## Alur Sesi

```
Booking Confirmed
   │
   ▼
Member Check-in  → status checked_in
   │
   ▼
Workout Session (catatan)
   │
   ▼
Mark as Completed → status completed + attendance + consumed(0)
```

## Check-in

`check_in_booking(booking_id)`:

1. Pastikan aktor staff (owner/trainer) atau member terkait.
2. Booking harus `confirmed`.
3. Set status `checked_in`.
4. Insert/upsert `attendances.check_in_at` (unik per booking).

## Complete Session (atomik)

`complete_booking(booking_id, notes)`:

1. Lock booking (`FOR UPDATE`).
2. Pastikan status `checked_in`.
3. Pastikan reservasi kuota sudah ada.
4. Set status `completed`.
5. Upsert `attendances` (`completed_at`, `trainer_notes`).
6. Append `quota_ledger` `consumed` quantity 0.
7. Commit.

Semua langkah dalam **satu transaksi database**.

## No-show

`mark_no_show(booking_id)`:

- Booking `confirmed`/`checked_in`.
- Set `no_show`.
- Append `consumed` 0 → kuota hangus (reservasi tidak dikembalikan).
- Catat di attendance bila perlu.

## Idempotency

- `attendances.booking_id UNIQUE` mencegah dua attendance.
- `UNIQUE (booking_id, event_type)` mencegah dua `consumed`.
- RPC harus menolak transisi status yang tidak valid, sehingga klik "Complete" dua kali tidak berefek ganda.

## Attendance Fields

| Field | Isi |
|---|---|
| `booking_id` | Unik, referensi booking |
| `check_in_at` | Waktu check-in |
| `completed_at` | Waktu selesai |
| `status` | `present` (default), `no_show` |
| `trainer_notes` | Catatan latihan |

## Modul Terkait

- Booking: `06-booking-engine.md`
- Quota: `05-quota-engine.md`
- RPC: `09-backend-rpc.md`
