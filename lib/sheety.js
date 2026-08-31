import soalFallback from './soalFallback';

// Isi NEXT_PUBLIC_SHEETY_BASE_URL di .env.local setelah Sheety project jadi.
// Contoh: https://api.sheety.co/xxxxxxxxxxxx/tryoutCpns
// Selama kosong, app otomatis pakai data demo lokal (soalFallback.js) supaya
// tetap bisa dicoba/dideploy sebelum setup Sheety selesai.
const BASE_URL = process.env.NEXT_PUBLIC_SHEETY_BASE_URL;

export const sheetyConfigured = Boolean(BASE_URL);

export async function getSoal() {
  if (!BASE_URL) {
    return soalFallback;
  }
  try {
    const res = await fetch(`${BASE_URL}/soal`);
    if (!res.ok) throw new Error(`Sheety error ${res.status}`);
    const data = await res.json();
    // Sheety membungkus data dengan key = nama sheet (huruf kecil, jamak jika perlu)
    const list = data.soal || data.soals || Object.values(data)[0];
    return Array.isArray(list) && list.length > 0 ? list : soalFallback;
  } catch (err) {
    console.error('Gagal mengambil soal dari Sheety, pakai data demo:', err);
    return soalFallback;
  }
}

export async function catatPeserta({ nama, noWa, waktuMulai }) {
  if (!BASE_URL) {
    console.info('[demo] peserta dicatat lokal:', nama, noWa);
    return { id: `demo-${Date.now()}` };
  }
  try {
    const res = await fetch(`${BASE_URL}/peserta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta: { nama, noWa, waktuMulai } }),
    });
    if (!res.ok) throw new Error(`Sheety error ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('Gagal mencatat peserta ke Sheety:', err);
    return null;
  }
}

export async function kirimHasil({ nama, noWa, paket, skor, benar, salah, kosong, waktuSelesai, detailJawaban }) {
  if (!BASE_URL) {
    console.info('[demo] hasil dicatat lokal:', { nama, paket, skor });
    return { id: `demo-${Date.now()}` };
  }
  try {
    const res = await fetch(`${BASE_URL}/hasil`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hasil: {
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
    if (!res.ok) throw new Error(`Sheety error ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('Gagal mengirim hasil ke Sheety:', err);
    return null;
  }
}
