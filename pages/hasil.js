import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Hasil() {
  const router = useRouter();
  const [peserta, setPeserta] = useState(null);
  const [hasil, setHasil] = useState(null);

  useEffect(() => {
    const p = sessionStorage.getItem('tryout_peserta');
    const h = sessionStorage.getItem('tryout_hasil');
    if (!p || !h) {
      router.replace('/');
      return;
    }
    setPeserta(JSON.parse(p));
    setHasil(JSON.parse(h));
  }, [router]);

  if (!hasil) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <p className="text-navy-200 font-mono text-sm">Memuat hasil…</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Hasil Ujian — Tryout CPNS</title>
      </Head>
      <main className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-navy-700 px-6 py-5 text-center">
              <p className="text-navy-200 text-xs font-mono tracking-wide">HASIL TRYOUT CPNS</p>
              <p className="text-white font-semibold mt-1">{peserta?.nama}</p>
            </div>

            <div className="px-6 py-8 text-center border-b border-navy-100">
              <p className="text-xs text-navy-500 mb-1">Skor Akhir</p>
              <p className="text-6xl font-extrabold text-navy-800">{hasil.skor}</p>
              {hasil.otomatis && (
                <p className="text-xs text-amberx-600 mt-2">
                  Ujian diselesaikan otomatis karena waktu habis.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 divide-x divide-navy-100">
              <div className="px-4 py-4 text-center">
                <p className="text-2xl font-bold text-emeraldx-600">{hasil.benar}</p>
                <p className="text-xs text-navy-500 mt-1">Benar</p>
              </div>
              <div className="px-4 py-4 text-center">
                <p className="text-2xl font-bold text-alarm-500">{hasil.salah}</p>
                <p className="text-xs text-navy-500 mt-1">Salah</p>
              </div>
              <div className="px-4 py-4 text-center">
                <p className="text-2xl font-bold text-navy-400">{hasil.kosong}</p>
                <p className="text-xs text-navy-500 mt-1">Kosong</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <button
                onClick={() => {
                  sessionStorage.removeItem('tryout_peserta');
                  sessionStorage.removeItem('tryout_hasil');
                  router.push('/');
                }}
                className="w-full bg-navy-800 hover:bg-navy-900 text-white font-semibold py-2.5 rounded text-sm"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
