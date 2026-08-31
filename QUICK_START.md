# Quick Start

## Coba di lokal (langsung jalan, pakai soal contoh)
```bash
npm install
npm run dev
```
Buka `http://localhost:3000`. Isi nama + email di halaman awal, lalu ujian
langsung bisa dicoba dengan 10 soal contoh (TWK/TIU/TKP) — tanpa setup
apa pun.

## Sambungkan ke Google Sheet asli
Lihat `VERCEL_SHEETY_SETUP.md` untuk langkah lengkap bikin Sheet, project
Sheety, dan isi `.env.local`.

## Deploy cepat ke Vercel
```bash
npm install -g vercel
vercel
vercel --prod
```
Jangan lupa tambahkan Environment Variable `NEXT_PUBLIC_SHEETY_BASE_URL` di
dashboard Vercel (Settings → Environment Variables) begitu Sheety sudah
siap.

## Struktur project
```
pages/
  index.js   → halaman awal: nama, email, tata tertib, tombol mulai
  ujian.js   → halaman ujian: timer, soal, navigator, submit
  hasil.js   → halaman hasil: skor, benar/salah/kosong
lib/
  sheety.js        → semua pemanggilan API ke Sheety
  soalFallback.js  → 10 soal contoh (mode demo)
```

## Yang perlu disesuaikan
- **Durasi & jumlah soal**: durasi diatur di `pages/ujian.js` (`DURASI_DETIK`, saat ini 30 menit). Jumlah soal otomatis mengikuti jumlah baris di tab `SOAL` pada Google Sheet.
- **Warna/branding**: token warna ada di `tailwind.config.js` (palet navy/emerald/amber ala CAT resmi) — tinggal ganti hex value kalau mau nuansa lain.
- **Kategori soal**: bebas diisi apa saja di kolom `kategori` (tidak harus TWK/TIU/TKP), akan tampil apa adanya sebagai label di atas tiap soal.
