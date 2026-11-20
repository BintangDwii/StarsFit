# 09 — Backend RPC & API

> Tujuan: daftar operasi backend, batas transaksi, dan aturan implementasi.

## Prinsip

- Operasi sensitif via PostgreSQL RPC, bukan query client.
- Selalu validasi `auth.uid()`, tenant, role, dan relasi member.
- Gunakan satu transaksi per aksi bisnis.
- Idempotent untuk aksi yang bisa ditekan berulang (approve/complete).

## Daftar RPC

| Function | Aktor | Fungsi |
|---|---|---|
| `create_member` | owner/trainer | Buat undangan + `tenant_members` + profil |
| `update_member` | owner/trainer/member(self) | Ubah profil |
| `create_quota` | owner/trainer | Kuota awal + `grant` |
| `adjust_quota` | owner/trainer | Tambah/kurangi kuota (`adjustment`) |
| `set_unlimited_quota` | owner/trainer | Set unlimited |
| `get_available_slots` | member/staff | Slot yang valid |
| `request_booking` | member | Buat `pending` |
| `approve_booking` | owner/trainer | Reserve -1 + `confirmed` |
| `reject_booking` | owner/trainer | `rejected` |
| `cancel_booking` | member/staff | Release sesuai policy |
| `reschedule_booking` | member/staff | Pindah slot + validasi |
| `check_in_booking` | owner/trainer | `checked_in` |
| `complete_booking` | owner/trainer | `completed` + attendance + `consumed` 0 |
| `mark_no_show` | owner/trainer | `no_show` + `consumed` 0 |
| `get_quota_history` | staff/member(self) | Riwayat ledger |
| `get_member_progress` | staff/member(self) | Data progress |

## Contoh Signature

```sql
create_member(
  p_tenant uuid,
  p_email text,
  p_full_name text,
  p_role tenant_role default 'member',
  p_fitness_goal text default null
) returns uuid

create_quota(
  p_tenant uuid,
  p_member uuid,
  p_quantity int,
  p_expires_at timestamptz default null,
  p_unlimited boolean default false
) returns uuid

approve_booking(p_booking uuid) returns void
complete_booking(p_booking uuid, p_notes text default null) returns void
adjust_quota(p_quota uuid, p_delta int, p_description text) returns void
```

## Transaction Boundary

| Aksi | Lock | Tulis |
|---|---|---|
| `create_quota` | — | quota + ledger grant |
| `adjust_quota` | quota `FOR UPDATE` | ledger adjustment |
| `approve_booking` | booking `FOR UPDATE` | booking + ledger reservation |
| `cancel_booking` | booking + quota | booking + ledger release |
| `complete_booking` | booking `FOR UPDATE` | booking + attendance + ledger consumed |
| `reschedule_booking` | booking `FOR UPDATE` | booking start/end |

## Background Jobs (Edge Function / pg_cron)

1. **Expire pending bookings** — auto-reject setelah batas waktu.
2. **Expire quotas** — set `status = 'expired'` saat lewat `expires_at`.
3. **Reminder** — notifikasi H-1 / beberapa jam sebelum sesi.

## Error Handling

- Lempar exception dengan kode stabil (`P0001` + pesan), mis. `QUOTA_INSUFFICIENT`, `SLOT_CONFLICT`, `INVALID_STATE`.
- Client memetakan kode ke pesan UI.

## Modul Terkait

- Security: `04-security-rls.md`
- Quota: `05-quota-engine.md`
- Booking: `06-booking-engine.md`
- Session: `07-session-attendance.md`
