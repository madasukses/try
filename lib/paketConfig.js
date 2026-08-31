// Info paket try out yang tampil di halaman "Pilih Paket" & "Persiapan Mengerjakan".
// Kalau nanti mau bikin banyak paket, tinggal ubah ini jadi array dan sesuaikan
// pages/index.js untuk me-render daftar paket + pages/persiapan.js membaca query id-nya.

export const PAKET = {
  slug: 'skd-cpns-2026-part-1',
  badge: 'GRATIS',
  judul: 'Try Out Pemanasan SKD CPNS 2026 Part 1',
  deskripsi: 'Simulasi ujian Computer Assisted Test — TWK, TIU, dan TKP.',
};

export const DURASI_MENIT = 30;
export const DURASI_DETIK = DURASI_MENIT * 60;

// Passing grade resmi SKD CPNS — ditampilkan sebagai acuan, belum dipakai
// untuk menghitung lulus/tidak lulus per kategori di halaman hasil.
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
