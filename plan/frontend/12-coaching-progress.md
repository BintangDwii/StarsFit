# F12 — Workout & Progress UI

> Tujuan: mengelola program latihan dan memantau perkembangan member.

## Scope

### Workout Programs (`/workouts`)

- Daftar program dengan filter member.
- Buat program baru (member + judul + rentang tanggal).
- Detail program: hari latihan dan daftar exercise (sets, reps, target weight, rest).
- Non-aktifkan program.

### Progress Tracking (`/progress`)

- Pilih member.
- Grafik berat badan, body fat, dan lingkar pinggang.
- Tambah catatan progress (weight, body fat, waist, chest, arm).
- Tabel riwayat catatan.

## Routing

| Path | Halaman |
|---|---|
| `/workouts` | `WorkoutsPage` |
| `/progress` | `ProgressPage` |

## Data & Action

Dari `useWorkspace()`:

- `programs`, `progress`, `members`.
- `createProgram(memberId, title)`, `addProgress(memberId, record)`.

RPC: `create_workout_program`, `get_workout_programs`, `get_program_detail`, `record_progress`, `get_member_progress` (`../015_rpc_coaching.sql`).

## Komponen

| File | Tugas |
|---|---|
| `pages/workouts/WorkoutsPage.jsx` | Daftar + form program + detail |
| `pages/progress/ProgressPage.jsx` | Grafik + form + tabel |
| `components/progress/ProgressChart.jsx` | Grafik SVG ringan (sudah ada) |

## Modul Terkait

- Backend: `../008-coaching-progress.md`
- Design: `01-design-system.md`
- Berikutnya: `13-member-portal.md`
