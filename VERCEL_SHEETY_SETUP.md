# Setup Lengkap — Tryout CPNS (Sheety + Vercel)

App ini sudah bisa langsung dicoba tanpa setup apa pun (pakai 10 soal contoh
bawaan). Panduan ini untuk menyambungkan ke Google Sheet asli via Sheety
supaya soal, peserta, dan hasil tersimpan permanen dan bisa dikelola tanpa
coding.

## 1. Siapkan Google Sheet

> **Kalau Sheet sudah ada isinya (misal 50 soal yang sudah pernah diisi):** tinggal tambah 1 kolom baru bernama `kode` di antara kolom `id` dan `kategori`, lalu isi `SOAL1` di semua baris yang sudah ada. Atau paling gampang: import ulang file CSV terbaru yang sudah termasuk kolom `kode` (pilih **"Replace current sheet"** saat import, lihat langkah 1 di bawah).

Buat 1 Google Sheet baru dengan **3 tab**, persis nama dan kolom berikut
(huruf besar/kecil di baris pertama harus sama):

### Tab `SOAL`
| id | kode | kategori | soal | pilihanA | pilihanB | pilihanC | pilihanD | pilihanE | kunci |
|----|------|----------|------|----------|----------|----------|----------|----------|-------|
| 1  | SOAL1 | TWK      | Teks soal...| Opsi A | Opsi B | Opsi C | Opsi D | Opsi E | B |

- `id`: angka urut unik, wajib ada dan tidak boleh sama antar baris (boleh lanjut nomor antar paket, seperti di file CSV yang disediakan).
- `kode`: penanda paket try out, isi **SOAL1**, **SOAL2**, **SOAL3**, dst. Semua soal dengan kode yang sama akan digabung jadi satu paket try out yang bisa dipilih peserta di halaman awal. Boleh campur TWK/TIU/TKP dalam satu kode yang sama.
- `kategori`: bebas, contoh TWK / TIU / TKP.
- `kunci`: satu huruf A–E, harus sama persis dengan salah satu kolom pilihan yang berisi jawaban benar.

Paket baru otomatis muncul di halaman "Pilih Paket" begitu ada baris dengan kode baru — **tidak perlu ubah kode aplikasi sama sekali**, cukup tambah baris di Sheet.

### Tab `PESERTA`
| nama | email | waktuMulai |
|------|-------|------------|

Kosongkan isinya — akan terisi otomatis tiap ada peserta yang mulai ujian.

### Tab `HASIL`
| nama | email | paket | skor | benar | salah | kosong | waktuSelesai | detailJawaban |
|------|-------|-------|------|-------|-------|--------|--------------|----------------|

Kosongkan juga — terisi otomatis tiap peserta submit ujian. Kolom `paket` mencatat kode paket (SOAL1, SOAL2, dst) yang dikerjakan peserta.

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
