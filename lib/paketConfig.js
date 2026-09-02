// Konfigurasi umum try out. Daftar paket TIDAK di-hardcode di sini —
// paket otomatis diturunkan dari kolom "kode" pada tab SOAL di Google Sheet
// (lihat groupSoalByPaket di bawah). Kalau nanti nambah SOAL3, SOAL4, dst,
// tinggal tambah baris di Sheet, tidak perlu ubah kode.

// GANTI password ini sebelum deploy — dipakai untuk buka halaman /admin.
// Ini proteksi sederhana (bukan keamanan tingkat tinggi), cukup untuk
// mencegah orang iseng, karena data ini juga sudah dilindungi oleh Apps
// Script yang tidak menyediakan link admin ke publik.
export const ADMIN_PASSWORD = 'admin123';

export const KODE_DEFAULT = 'SOAL1'; // dipakai kalau kolom "kode" kosong/belum ada di Sheet

// GANTI dengan link channel YouTube Anda — dipakai di banner ajakan
// nonton pembahasan pada halaman /pembahasan.
export const YOUTUBE_URL = 'https://www.youtube.com/@GANTI_DENGAN_CHANNEL_ANDA';

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

const HURUF = ['A', 'B', 'C', 'D', 'E'];

// Acak urutan pilihan A-E per soal, stabil selama satu sesi (tersimpan di
// sessionStorage lewat urutanKey) supaya kunci jawaban tetap konsisten kalau
// halaman di-refresh di tengah pengerjaan.
export function acakPilihanStabil(soalList, urutanKey) {
  let mapping = {};
  const saved = sessionStorage.getItem(urutanKey);
  if (saved) mapping = JSON.parse(saved);

  const hasil = soalList.map((s) => {
    let urutanHuruf = mapping[s.id];
    if (!urutanHuruf) {
      const hurufTersedia = HURUF.filter((h) => s[`pilihan${h}`]);
      urutanHuruf = [...hurufTersedia];
      for (let i = urutanHuruf.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [urutanHuruf[i], urutanHuruf[j]] = [urutanHuruf[j], urutanHuruf[i]];
      }
      mapping[s.id] = urutanHuruf;
    }
    const baru = { ...s };
    urutanHuruf.forEach((hurufLama, idx) => {
      const hurufBaru = HURUF[idx];
      baru[`pilihan${hurufBaru}`] = s[`pilihan${hurufLama}`];
      if (hurufLama === s.kunci) baru.kunci = hurufBaru;
    });
    return baru;
  });

  sessionStorage.setItem(urutanKey, JSON.stringify(mapping));
  return hasil;
}
// Acak urutan soal sekali per attempt. Urutan hasil acakan disimpan di
// sessionStorage (lewat urutanKey) supaya kalau halaman di-refresh, urutan
// yang dilihat peserta tidak berubah lagi di tengah pengerjaan.
export function acakSoalStabil(soalList, urutanKey) {
  const saved = sessionStorage.getItem(urutanKey);
  if (saved) {
    const urutanId = JSON.parse(saved);
    const byId = new Map(soalList.map((s) => [String(s.id), s]));
    const hasil = urutanId.map((id) => byId.get(String(id))).filter(Boolean);
    // soal baru yang belum ada di urutan lama (misal admin nambah soal di tengah sesi) ditaruh di akhir
    const idTerpakai = new Set(urutanId.map(String));
    const sisa = soalList.filter((s) => !idTerpakai.has(String(s.id)));
    return [...hasil, ...sisa];
  }
  const acak = [...soalList];
  for (let i = acak.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [acak[i], acak[j]] = [acak[j], acak[i]];
  }
  sessionStorage.setItem(urutanKey, JSON.stringify(acak.map((s) => s.id)));
  return acak;
}
