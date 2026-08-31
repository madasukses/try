import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { catatPeserta } from '../lib/sheety';

const ATURAN = [
  'Ujian terdiri dari 50 soal (TWK, TIU, TKP) dengan waktu 30 menit.',
  'Waktu berjalan otomatis sejak Anda menekan "Mulai Ujian" dan tidak dapat dijeda.',
  'Sistem akan submit otomatis begitu waktu habis, meski belum semua soal terjawab.',
  'Gunakan tombol navigasi nomor soal di sisi kanan untuk berpindah antar soal.',
  'Pastikan koneksi internet stabil selama ujian berlangsung.',
];

export default function Beranda() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [setuju, setSetuju] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function mulaiUjian(e) {
    e.preventDefault();
    setError('');
    if (!nama.trim() || !email.trim()) {
      setError('Nama dan email wajib diisi.');
      return;
    }
    if (!setuju) {
      setError('Anda harus menyetujui tata tertib ujian terlebih dahulu.');
      return;
    }
    setLoading(true);
    const waktuMulai = new Date().toISOString();
    await catatPeserta({ nama: nama.trim(), email: email.trim(), waktuMulai });
    sessionStorage.setItem(
      'tryout_peserta',
      JSON.stringify({ nama: nama.trim(), email: email.trim(), waktuMulai })
    );
    router.push('/ujian');
  }

  return (
    <>
      <Head>
        <title>Tryout CPNS — CAT</title>
      </Head>
      <main className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-6">
            <p className="text-navy-300 font-mono text-xs tracking-wide">SISTEM TRYOUT BERBASIS CAT</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">Tryout CPNS</h1>
            <p className="text-navy-200 mt-2 text-sm sm:text-base">
              Simulasi ujian Computer Assisted Test — TWK, TIU, dan TKP
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-navy-700 px-6 py-4">
              <h2 className="text-white font-semibold">Tata Tertib Ujian</h2>
            </div>
            <ul className="px-6 py-4 space-y-2 text-sm text-navy-800 border-b border-navy-100">
              {ATURAN.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-navy-400 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>

            <form onSubmit={mulaiUjian} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Sesuai identitas"
                  className="w-full border border-navy-200 rounded px-3 py-2 text-sm focus:border-navy-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full border border-navy-200 rounded px-3 py-2 text-sm focus:border-navy-500"
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-navy-700">
                <input
                  type="checkbox"
                  checked={setuju}
                  onChange={(e) => setSetuju(e.target.checked)}
                  className="mt-0.5"
                />
                Saya telah membaca dan menyetujui tata tertib ujian di atas.
              </label>

              {error && <p className="text-alarm-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-700 hover:bg-navy-800 disabled:opacity-60 text-white font-semibold py-3 rounded transition-colors"
              >
                {loading ? 'Menyiapkan ujian…' : 'Mulai Ujian'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
