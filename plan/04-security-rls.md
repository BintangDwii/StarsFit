# 04 — Security, RLS & Roles

> Tujuan: mendefinisikan otorisasi multi-tenant yang aman. Implementasi SQL ada di `supabase/migrations/009_rls.sql`.

## Prinsip

1. `tenant_members` adalah dasar otorisasi.
2. Semua akses harus terikat tenant + assignment, bukan hanya role.
3. Client tidak boleh menulis ke `quota_ledger`; semua mutasi lewat RPC.
4. RLS default-deny: tanpa policy tulis, INSERT/UPDATE/DELETE dari client ditolak.

## Helper Functions

```sql
is_tenant_member(target_tenant uuid) -> boolean
-- aktif sebagai anggota tenant mana pun

is_tenant_staff(target_tenant uuid) -> boolean
-- role owner atau trainer, status active

current_member_id(target_tenant uuid) -> uuid
-- tenant_members.id milik auth.uid(), atau null
```

Semua dibuat `SECURITY DEFINER` dengan `SET search_path = ''` dan skema eksplisit (`public.*`) untuk menghindari search-path attack.

## Matrix Akses (Final)

| Aksi | Owner | Trainer | Member |
|---|---|---|---|
| Lihat workspace | ✅ | ✅ | ✅ |
| Kelola member | ✅ | ✅ (assigned) | — |
| Lihat profil sendiri | ✅ | ✅ | ✅ |
| Set / adjust quota | ✅ | ✅ | — |
| Request booking | — | — | ✅ |
| Approve / reject booking | ✅ | ✅ | — |
| Check-in / complete | ✅ | ✅ | — |
| Lihat progress member | ✅ | ✅ (assigned) | ✅ (sendiri) |
| Lihat progress sendiri | ✅ | ✅ | ✅ |

## Policy per Tabel

| Tabel | Policy baca |
|---|---|
| `tenants` | `is_tenant_member(id)` |
| `tenant_members` | staff lihat semua member tenant; member hanya baris sendiri |
| `member_profiles` | staff lihat semua; member hanya profil sendiri |
| `member_quotas` | staff lihat semua; member hanya kuota sendiri |
| `quota_ledger` | staff lihat semua; member hanya ledger milik kuota sendiri |
| `bookings` | staff lihat semua; member hanya booking sendiri |
| `attendances` | staff lihat semua; member hanya attendance dari booking sendiri |
| `trainer_availability` | staff lihat semua; member boleh lihat untuk booking |
| `workout_programs` | staff lihat semua; member hanya miliknya |
| `progress_records` | staff lihat semua; member hanya miliknya |

## Yang Sengaja Tidak Diberi Policy Tulis

- `quota_ledger` — append-only, hanya RPC.
- `member_quotas` — mutasi via RPC.
- `bookings` — status hanya via RPC.
- `attendances` — hanya via RPC.

RPC berjalan dengan hak yang lebih tinggi (validasi eksplisit), sehingga RLS tabel tetap ketat untuk client.

## Catatan Keamanan

- Jangan pakai `user_metadata` untuk otorisasi; pakai `tenant_members`.
- Validasi role `trainer`/`owner` untuk `trainer_id`, dan `member` untuk `member_id`, di level RPC.
- Audit `auth.uid()` dan `tenant_id` di setiap RPC sebelum mutasi.

## Modul Terkait

- Schema: `03-database-schema.md`
- RPC: `09-backend-rpc.md`
- Risiko: `13-decisions-risks.md`
