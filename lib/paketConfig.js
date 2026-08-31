// Konfigurasi umum try out. Daftar paket TIDAK di-hardcode di sini —
// paket otomatis diturunkan dari kolom "kode" pada tab SOAL di Google Sheet
// (lihat groupSoalByPaket di bawah). Kalau nanti nambah SOAL3, SOAL4, dst,
// tinggal tambah baris di Sheet, tidak perlu ubah kode.

export const PAKET_BADGE = 'GRATIS';
export const KODE_DEFAULT = 'SOAL1'; // dipakai kalau kolom "kode" kosong/belum ada di Sheet

export const DURASI_MENIT = 30;
export const DURASI_DETIK = DURASI_MENIT * 60;

// Passing grade resmi SKD CPNS — ditampilkan sebagai acuan di halaman Persiapan.
export const PASSING_GRADE = {
  TWK: 65,
  TIU: 80,
  TKP: 166,
};

export const KATEGORI_LABEL = {
  TWK: 'Tes Wawasan Kebangsaan',
  TIU: 'Tes Intelegensia Umum',
  TKP: 'Tes Karakteristik Pribadi',
};

// Ubah "SOAL3" jadi "Paket Latihan 3". Kalau kode tidak berformat SOALx,
// tampilkan apa adanya.
export function formatJudulPaket(kode) {
  const angka = String(kode || '').match(/\d+/);
  return angka ? `Paket Latihan ${angka[0]}` : String(kode || 'Paket');
}

// Kelompokkan daftar soal (dari Sheety atau fallback) berdasarkan kolom "kode".
// Baris tanpa kode dianggap masuk KODE_DEFAULT supaya tetap kompatibel
// dengan sheet lama yang belum punya kolom "kode".
export function groupSoalByPaket(soalList) {
  const map = new Map();
  for (const s of soalList) {
    const kode = (s.kode && String(s.kode).trim()) || KODE_DEFAULT;
    if (!map.has(kode)) map.set(kode, []);
    map.get(kode).push(s);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
    .map(([kode, soal]) => ({ kode, soal, jumlah: soal.length }));
}

export function ambilSoalPaket(soalList, kode) {
  return soalList.filter((s) => ((s.kode && String(s.kode).trim()) || KODE_DEFAULT) === kode);
}
