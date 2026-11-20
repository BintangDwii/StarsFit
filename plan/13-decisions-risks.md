# 13 — Decisions, Risks & Open Questions

> Tujuan: mencatat keputusan final, catatan pra-production, dan hal yang perlu diputuskan.

## Keputusan Final

| Keputusan | Alasan |
|---|---|
| Tanpa payment gateway | Fokus pada manajemen PT–member |
| Tanpa invoice/transaksi finansial | Di luar scope MVP |
| Quota ledger tetap ada | Auditabilitas perubahan kuota |
| Booking approved langsung reserve -1 | Cegah pemakaian sesi ganda |
| Completed mencatat `consumed` qty 0 | Hindari pemotongan dua kali |
| RPC untuk operasi sensitif | Konsistensi + keamanan |
| Supabase Auth | Tidak mengelola password sendiri |
| Frontend dibangun lebih dulu dengan mock data | UI bisa dievaluasi sebelum backend selesai |
| Tema white & blue | Arah visual SaaS fitness profesional, bukan template admin |
| JavaScript + custom CSS | Kontrol penuh atas design token & konsistensi visual |
| Demo mode saat env Supabase kosong | UI dapat dievaluasi sebelum backend terhubung |
| Font Inter di-bundle lokal | Tidak bergantung CDN Google Fonts, console bersih |
| Member portal memakai member demo pilihan | Pengguna bisa mencoba portal tanpa login |

## Catatan Pra-Production

1. **Composite FK** `booking.quota_id` harus milik `booking.member_id` — sudah diterapkan (`booking_quota_owner`).
2. **Validasi role** trainer vs member di RPC — belum berupa constraint DB; harus di setiap RPC.
3. **RPC atomik** untuk approve + reservasi.
4. **RPC atomik** untuk cancel + release.
5. **Idempotency** complete/approve agar klik ganda aman.
6. **Auto-expire pending booking** (default 15 menit).
7. **Job expiry kuota** mengubah status saat lewat `expires_at`.

## Risiko Diketahui

| Risiko | Dampak | Mitigasi |
|---|---|---|
| `attendances` tanpa `tenant_id` | Isolasi tenant bergantung join | Tambah `tenant_id` + composite FK di iterasi berikut |
| `program_days`/`workout_exercises` tanpa `tenant_id` | Sama seperti di atas | Turunkan via program join; pertimbangkan denormalisasi |
| RLS staff melihat semua member | Trainer bisa lihat member non-assigned | Tambah tabel assignment trainer–member |
| `quota_ledger UNIQUE(booking_id,event_type)` | Adjustment terkait booking tidak bisa >1 | Adjustment biasanya tidak terikat booking |
| Timezone | Salah hitung slot | Simpan `timestamptz`, hitung di timezone tenant |
| Pending memblokir slot | Slot "hilang" saat pending | Auto-expire pending |

## Pertanyaan Terbuka

1. Apakah trainer perlu assignment eksplisit per member? (saat ini staff = semua member tenant)
2. Apakah member boleh reschedule sendiri atau hanya request ulang?
3. Berapa default durasi sesi dan apakah bisa berbeda per PT?
4. Apakah progress record boleh diinput member sendiri?
5. Apakah exercise library global atau per tenant?

## Modul Terkait

- Security: `04-security-rls.md`
- Backend: `09-backend-rpc.md`
- Roadmap: `12-roadmap.md`
