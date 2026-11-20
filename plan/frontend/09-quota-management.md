# F09 — Quota Management UI

> Tujuan: halaman khusus untuk mengelola sesi latihan member dengan jejak audit yang transparan.

## Scope

- Ringkasan Available / Reserved / Consumed untuk seluruh workspace.
- Daftar kuota per member dengan status (active/expired), expiry, dan unlimited flag.
- Aksi: adjust kuota, buat paket baru, toggle unlimited, lihat riwayat ledger.
- Alert untuk member dengan sisa ≤ 2 sesi.
- Responsive: tabel menjadi kartu di mobile.

## Routing

| Path | Halaman |
|---|---|
| `/quota` | `QuotaPage` |

## Data & Action

Dari `useWorkspace()`:

- `members` dengan `quota` (available, reserved, consumed, total, expiresAt, unlimited, history).
- `adjustQuota(memberId, delta, description)`.
- `createQuota(memberId, payload)`.
- `updateMember` / RPC `set_unlimited_quota` untuk toggle unlimited (demo mode: update state).

## Aturan Bisnis

- Adjust positif = bonus, negatif = koreksi; tidak boleh membuat saldo negatif.
- Saldo tidak pernah di-overwrite — selalu ditambah entri ledger baru.
- `consumed` dicatat dengan quantity `0` saat sesi selesai atau no-show.
- Kuota unlimited tetap mencatat audit grant.
- Cek expiry sebelum reservasi (dilakukan RPC `approve_booking`).

## Komponen

| File | Tugas |
|---|---|
| `pages/quota/QuotaPage.jsx` | Ringkasan, tabel, filter, aksi |
| `components/quota/QuotaAdjustModal.jsx` | Form adjust/create (sudah ada dari F08) |
| `components/quota/QuotaHistoryModal.jsx` | Timeline ledger per member |

## Modul Terkait

- Backend: `../012_rpc_quota.sql`, `../05-quota-engine.md`
- Design: `01-design-system.md`
- berikutnya: `10-calendar-booking.md`
