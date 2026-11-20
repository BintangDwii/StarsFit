# F16 — Trainer Assignment & Exercise Library

> Tujuan: menutup dua keputusan terbuka — trainer hanya mengelola member yang ditugaskan, dan exercise library bersifat global + tenant-specific.

## Trainer Assignment

- Tabel `trainer_assignments` (`019`): tenant_id, trainer_id, member_id, unik per kombinasi.
- Owner dapat menugaskan/mencabut trainer ke member.
- Trainer hanya melihat member yang ditugaskan:
  - `can_view_member()` dipakai `list_members`, `assert_self_or_staff`, dan RPC booking.
  - Owner tetap melihat semua member.
- RPC: `assign_trainer`, `unassign_trainer`, `list_assignments`.
- UI: kartu "Trainer penanggung jawab" di halaman detail member.

## Exercise Library

- `exercises.tenant_id` nullable (`020`): `NULL` = exercise global bawaan, UUID tenant = exercise studio.
- Policy RLS: global dibaca semua anggota, tenant-specific hanya anggota tenant tersebut.
- RPC: `list_exercises`, `create_exercise`.
- UI: halaman `/exercises` dengan filter pencarian, kelompok otot, dan badge Global/Studio.

## Routing Baru

| Path | Halaman |
|---|---|
| `/exercises` | `ExercisesPage` |

## Status

| Bagian | Status |
|---|---|
| SQL assignment + access control | ✅ selesai |
| SQL exercise scope | ✅ selesai |
| Frontend assignment UI | ✅ selesai |
| Frontend exercise UI | ✅ selesai |
| Uji isolasi trainer | ✅ 4 → 3 → 2 member saat assign/unassign |
| Uji exercise scope | ✅ 5 global + 1 studio |

## Modul Terkait

- Audit: `../15-rls-audit.md`
- Keputusan: `../13-decisions-risks.md`
- Backend: `../019_trainer_assignment.sql`, `../020_exercise_library.sql`
