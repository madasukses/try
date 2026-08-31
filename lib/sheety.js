import soalFallback from './soalFallback';

// Isi NEXT_PUBLIC_GAS_URL di .env.local setelah Google Apps Script Web App
// selesai di-deploy (lihat GOOGLE_APPS_SCRIPT_SETUP.md). Selama kosong, app
// otomatis pakai data demo lokal (soalFallback.js) supaya tetap bisa dicoba
// sebelum setup selesai.
//
// Nama file ini masih "sheety.js" untuk menjaga kompatibilitas import di
// halaman lain, tapi isinya sekarang bicara ke Google Apps Script Web App,
// bukan lagi ke layanan Sheety.
const BASE_URL = process.env.NEXT_PUBLIC_GAS_URL;

export const backendConfigured = Boolean(BASE_URL);

export async function getSoal() {
  if (!BASE_URL) {
    return soalFallback;
  }
  try {
    const res = await fetch(`${BASE_URL}?sheet=soal`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    const list = data.soal;
    return Array.isArray(list) && list.length > 0 ? list : soalFallback;
  } catch (err) {
    console.error('Gagal mengambil soal, pakai data demo:', err);
    return soalFallback;
  }
}

export async function catatPeserta({ nama, noWa, waktuMulai }) {
  if (!BASE_URL) {
    console.info('[demo] peserta dicatat lokal:', nama, noWa);
    return { id: `demo-${Date.now()}` };
  }
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      // text/plain dipakai supaya browser tidak mengirim CORS preflight
      // (OPTIONS) yang tidak didukung Apps Script Web App. Isinya tetap JSON.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ sheet: 'peserta', data: { nama, noWa, waktuMulai } }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('Gagal mencatat peserta:', err);
    return null;
  }
}

export async function kirimHasil({ nama, noWa, paket, skor, benar, salah, kosong, waktuSelesai, detailJawaban }) {
  if (!BASE_URL) {
    console.info('[demo] hasil dicatat lokal:', { nama, paket, skor });
    return { id: `demo-${Date.now()}` };
  }
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        sheet: 'hasil',
        data: {
          nama,
          noWa,
          paket,
          skor,
          benar,
          salah,
          kosong,
          waktuSelesai,
          detailJawaban: JSON.stringify(detailJawaban),
        },
      }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('Gagal mengirim hasil:', err);
    return null;
  }
}
