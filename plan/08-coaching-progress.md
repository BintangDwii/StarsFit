# 08 — Coaching & Progress

> Tujuan: modul program latihan, exercise library, dan progress member.

## Exercise Library

`exercises` bersifat global (bukan per tenant): nama, muscle group, equipment, deskripsi. Bisa diisi seed awal dan diperluas.

## Workout Program

```
workout_programs
  └── program_days (day_name)
        └── workout_exercises (exercise_id, sets, reps, target_weight, rest_seconds)
```

- Program milik satu member dan dibuat trainer.
- Memiliki `start_date`, `end_date`, `is_active`.
- Satu member bisa punya banyak program (riwayat).

Contoh `day_name`: "Day 1 — Push", "Day 2 — Pull", "Legs".

## Progress Records

Menyimpan pengukuran berkala:

| Field | Satuan |
|---|---|
| `weight_kg` | kg |
| `body_fat_percent` | % |
| `waist_cm` | cm |
| `chest_cm` | cm |
| `arm_cm` | cm |
| `recorded_at` | timestamp |

## Tampilan

- Member: chart weight & body fat dari waktu ke waktu.
- PT: tabel progress + tren per member.
- Perbandingan first vs latest record.
- Progress bisa dikaitkan dengan catatan sesi (attendance) di iterasi berikutnya.

## Aturan

- Member hanya bisa melihat progress sendiri.
- Trainer hanya untuk member yang ditugaskan.
- Input progress oleh trainer/owner; member read-only di MVP.

## Modul Terkait

- Schema: `03-database-schema.md`
- UI: `10-ui-ux.md`
- RPC: `09-backend-rpc.md`
