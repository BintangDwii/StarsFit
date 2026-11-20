# F13 — Member Portal (Mobile)

> Tujuan: pengalaman member mobile-first untuk melihat kuota, booking sesi, program, dan progress.

## Scope

- Layout terpisah dengan bottom navigation: Home, Booking, Workout, Progress, Profile.
- Top header ringkas dengan identitas member.
- Home: sisa kuota, sesi berikutnya, tombol Book Session, program aktif, progress terbaru.
- Booking: pilih tanggal, slot tersedia, durasi, kebijakan pembatalan, riwayat booking.
- Workout: program latihan milik member.
- Progress: grafik berat badan & body fat.
- Profile: data diri, pilih member demo, logout visual.

## Routing

| Path | Halaman |
|---|---|
| `/m/home` | MemberHomePage |
| `/m/booking` | MemberBookingPage |
| `/m/workout` | MemberWorkoutPage |
| `/m/progress` | MemberProgressPage |
| `/m/profile` | MemberProfilePage |

Route `/m` redirect ke `/m/home`.

## Identitas Member

Belum ada auth di demo. `PortalContext` menyimpan `memberId` yang dipilih (default member pertama) di `localStorage`. Saat Supabase aktif, nilai ini berasal dari `auth.uid()` → `tenant_members`.

## Data & Action

Dari `useWorkspace()`:

- `members`, `bookings`, `programs`, `progress`.
- `requestBooking`, `cancelBooking`.

Slot dihitung dari jam kerja trainer 07:00–17:00 dikurangi booking yang bentrok.

## Komponen

| File | Tugas |
|---|---|
| `layouts/MemberPortalLayout.jsx` | Header + bottom nav + Outlet |
| `context/PortalContext.jsx` | Member demo aktif |
| `pages/member/*.jsx` | Lima halaman portal |

## Modul Terkait

- UI referensi: `../10-ui-ux.md`
- Backend booking: `../013_rpc_booking.sql`
- Design: `01-design-system.md`
- Berikutnya: `14-production-hardening.md`
