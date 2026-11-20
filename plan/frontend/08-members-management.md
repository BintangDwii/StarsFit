# F08 — Members Management

> Tujuan: modul member lengkap — listing, pencarian, filter, tambah member, detail, kuota, riwayat, dan edit/deactivate.

## Scope

- Member listing dengan search (nama/email) dan filter status + goal.
- Statistik ringkas di header (total, aktif, kuota rendah).
- Add member modal dengan validasi Zod.
- Member detail page dengan tab: Overview, Quota, Bookings, Workout, Progress, Activity.
- Edit profil & deactivate member.
- Responsive: tabel berubah menjadi kartu di mobile.

## Routing Baru

| Path | Halaman |
|---|---|
| `/members` | `MembersPage` |
| `/members/:memberId` | `MemberDetailPage` |

## Data

Berasal dari `useWorkspace()`:

- `members` — array member dengan `quota`, `status`, `goal`, `joinedAt`.
- `bookings` — dipakai tab Bookings.
- `programs`, `progress` — dipakai tab Workout & Progress.
- Actions: `addMember`, `updateMember`, `deactivateMember`, `adjustQuota`, `createQuota`.

Semua aksi berjalan di **demo mode** (state lokal) atau memanggil RPC jika Supabase terkonfigurasi (lihat `02-project-setup.md`, `011_rpc_members.sql`, `012_rpc_quota.sql`).

## Komponen

| File | Tugas |
|---|---|
| `components/ui/Modal.jsx` | Backdrop + dialog + escape key |
| `components/ui/Badge.jsx` | Status badge (active/inactive/suspended) |
| `components/ui/Field.jsx` | Label + input/select/textarea + error |
| `pages/members/MembersPage.jsx` | Listing, search, filter, tambah member |
| `pages/members/MemberDetailPage.jsx` | Detail bertab |
| `components/members/MemberFormModal.jsx` | Form tambah/edit member (Zod) |
| `components/members/QuotaAdjustModal.jsx` | Adjust/create kuota (Zod) |

## Validasi Zod

```
name: min 2 karakter
email: format email
quantity: integer 1..1000 (opsional jika unlimited)
goal: opsional
```

Pesan error ditampilkan inline di bawah field.

## Perilaku

- Klik baris member → detail.
- Deactivate memakai konfirmasi modal (aksi destruktif).
- Adjust kuota menambah entri ledger, bukan overwrite saldo.
- Low quota: `available <= 2` dan bukan unlimited.

## Modul Terkait

- Backend: `../011_rpc_members.sql`, `../012_rpc_quota.sql`
- Design: `01-design-system.md`
- berikutnya: `09-quota-management.md`
