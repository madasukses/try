# Setup Lengkap — Tryout CPNS (Sheety + Vercel)

App ini sudah bisa langsung dicoba tanpa setup apa pun (pakai 10 soal contoh
bawaan). Panduan ini untuk menyambungkan ke Google Sheet asli via Sheety
supaya soal, peserta, dan hasil tersimpan permanen dan bisa dikelola tanpa
coding.

## 1. Siapkan Google Sheet

Buat 1 Google Sheet baru dengan **3 tab**, persis nama dan kolom berikut
(huruf besar/kecil di baris pertama harus sama):

### Tab `SOAL`
| id | kategori | soal | pilihanA | pilihanB | pilihanC | pilihanD | pilihanE | kunci |
|----|----------|------|----------|----------|----------|----------|----------|-------|
| 1  | TWK      | Teks soal...| Opsi A | Opsi B | Opsi C | Opsi D | Opsi E | B |

- `id`: angka urut unik, wajib ada dan tidak boleh sama antar baris.
- `kategori`: bebas, contoh TWK / TIU / TKP.
- `kunci`: satu huruf A–E, harus sama persis dengan salah satu kolom pilihan yang berisi jawaban benar.
- Isi sampai 50 baris soal (atau berapa pun jumlah yang diinginkan — app otomatis menyesuaikan jumlah soal dari Sheet).

### Tab `PESERTA`
| nama | email | waktuMulai |
|------|-------|------------|

Kosongkan isinya — akan terisi otomatis tiap ada peserta yang mulai ujian.

### Tab `HASIL`
| nama | email | skor | benar | salah | kosong | waktuSelesai | detailJawaban |
|------|-------|------|-------|-------|--------|--------------|----------------|

Kosongkan juga — terisi otomatis tiap peserta submit ujian.

## 2. Buat project di Sheety

1. Buka [sheety.co](https://sheety.co) dan login (bisa pakai akun Google).
2. Klik **"Create new project / New API"**, tempel link Google Sheet yang tadi dibuat.
3. Pastikan Sheet **di-share ke akun Sheety** (ikuti instruksi di layar Sheety — biasanya cukup share Sheet-nya ke email yang diminta, atau lewat OAuth Google langsung).
4. Setelah project dibuat, Sheety akan menampilkan **Base URL**, formatnya seperti:
   ```
   https://api.sheety.co/abcdef1234567890/tryoutCpns
   ```
   Endpoint otomatis tersedia: `/soal`, `/peserta`, `/hasil` (mengikuti nama tab, huruf kecil).
5. Di tab **Authentication** pada dashboard Sheety, aktifkan minimal:
   - `GET` untuk `soal` (public, supaya app bisa ambil soal)
   - `POST` untuk `peserta` dan `hasil`

## 3. Sambungkan ke app

1. Salin `.env.local.example` menjadi `.env.local`.
2. Isi:
   ```
   NEXT_PUBLIC_SHEETY_BASE_URL=https://api.sheety.co/abcdef1234567890/tryoutCpns
   ```
3. Jalankan `npm run dev` lalu buka `http://localhost:3000` — soal sekarang diambil dari Google Sheet asli, bukan data contoh lagi.

## 4. Deploy ke Vercel

**Opsi A — lewat GitHub (disarankan):**
1. Push folder project ini ke repository GitHub baru.
2. Buka [vercel.com/new](https://vercel.com/new), import repo tersebut.
3. Saat konfigurasi, tambahkan Environment Variable:
   - Key: `NEXT_PUBLIC_SHEETY_BASE_URL`
   - Value: URL Sheety dari langkah 2.
4. Klik **Deploy**. Selesai dalam ±1–2 menit, dapat URL publik `namaproyek.vercel.app`.

**Opsi B — lewat Vercel CLI (lebih cepat, tanpa GitHub):**
```bash
npm install -g vercel
cd tryout-cpns
vercel
# ikuti prompt, lalu set env var:
vercel env add NEXT_PUBLIC_SHEETY_BASE_URL
vercel --prod
```

## 5. Kelola soal & lihat hasil sehari-hari

- **Tambah/edit/hapus soal**: langsung edit tab `SOAL` di Google Sheet — tidak perlu redeploy, perubahan langsung kepakai peserta berikutnya.
- **Lihat hasil peserta**: buka tab `HASIL` di Sheet, semua tersimpan otomatis (skor, benar/salah/kosong, waktu selesai).
- **Reset ujian baru**: kalau mau buka sesi tryout baru, cukup kosongkan/arsipkan tab `PESERTA` dan `HASIL` — tab `SOAL` boleh tetap.

## Catatan

- Selama `NEXT_PUBLIC_SHEETY_BASE_URL` kosong, app tetap jalan pakai 10 soal contoh di `lib/soalFallback.js` (mode demo) — berguna untuk uji coba sebelum Sheet siap.
- Sheety versi gratis punya batas jumlah request/bulan — cukup untuk skala puluhan peserta, tapi kalau nanti mau dipakai untuk ratusan/ribuan peserta sekaligus sebaiknya upgrade paket Sheety atau pindah ke backend database (Supabase, dsb).
