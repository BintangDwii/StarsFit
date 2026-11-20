# 05 — Quota Engine

> Tujuan: aturan kuota sesi tanpa payment gateway, dengan jejak audit penuh.

## Konsep

Kuota dibagi menjadi tiga perspektif:

| Istilah | Arti |
|---|---|
| Available | Kuota yang masih bisa dipakai |
| Reserved | Kuota yang ditahan booking aktif (`pending` tidak menahan, `confirmed`/`checked_in` menahan) |
| Consumed | Kuota yang benar-benar terpakai |

Rumus: `Available = Σ quota_ledger.quantity`.

## Tabel Transisi Kuota

| Aktivitas | Perubahan | event_type |
|---|---|---|
| Member request booking | 0 | — |
| PT approve booking | -1 (reserved) | `reservation` |
| Member menyelesaikan latihan | 0 tambahan | `consumed` (qty 0) |
| PT cancel booking | +1 | `release` |
| Member no-show | tetap terpakai | `consumed` (qty 0) |
| PT bonus | +1 | `adjustment` (+n) |
| PT koreksi | sesuai input | `adjustment` |

**Penting:** jangan kurangi kuota dua kali. Kuota ditahan saat approve, dan `consumed` hanya menandai pemakaian final dengan quantity 0.

## Tipe Kuota

| Mode | Perilaku |
|---|---|
| Terbatas | Cek saldo sebelum approve; blokir jika `available <= 0` |
| Unlimited | `is_unlimited = true`; cek saldo dilewati |
| Expiry | Kuota tidak bisa dipakai setelah `expires_at` |
| Reset | Kuota baru + entry `grant`/`adjustment` baru |

Contoh aturan PT: 8 sesi/30 hari, 12 sesi/60 hari, unlimited, custom.

## Workflow: Buat Kuota Awal

Satu RPC atomik `create_quota`:

1. Validasi staff + tenant + member role.
2. Insert `member_quotas` (expiry, unlimited).
3. Insert `quota_ledger` `grant` quantity n.
4. Commit.

## Workflow: Adjust Kuota

`adjust_quota(quota_id, delta, description)`:

1. `SELECT ... FOR UPDATE` baris quota (lock).
2. Jika delta negatif, pastikan `available + delta >= 0`.
3. Append `adjustment` dengan quantity delta.
4. Commit.

PT tidak pernah overwrite saldo; hanya menambah entry.

## Reservasi & Release

- `approve_booking` → append `reservation` -1, status booking `confirmed`.
- `cancel_booking` (confirmed) → append `release` +1 (sesuai policy).
- `complete_booking` / `no_show` → append `consumed` 0.

## Guardrail

- `quota_ledger` append-only.
- `UNIQUE (booking_id, event_type)` mencegah double reservation/release/consumed.
- Cek expiry sebelum reservasi.
- `is_unlimited` melewati cek saldo tetapi tetap mencatat ledger untuk audit.

## Expiry Job

Job berkala (Edge Function / pg_cron) mengubah `member_quotas.status` menjadi `expired` saat `expires_at < now()`. Booking yang belum approve tidak boleh memakai kuota kedaluwarsa.

## Modul Terkait

- Schema: `03-database-schema.md`
- RPC: `09-backend-rpc.md`
- Booking: `06-booking-engine.md`
