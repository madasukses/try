import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Breadcrumb from '../components/Breadcrumb';
import ThemeToggle from '../components/ThemeToggle';
import { formatJudulPaket } from '../lib/paketConfig';

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
      <div className="min-h-screen bg-slate-50 dark:bg-navy-900 flex items-center justify-center">
        <p className="text-slate-400 font-mono text-sm">Memuat hasil…</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Hasil — {formatJudulPaket(hasil.kodePaket)}</title>
      </Head>
      <main className="min-h-screen bg-slate-50 dark:bg-navy-900 px-4 sm:px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Persiapan Mengerjakan', href: '/persiapan' },
                { label: 'Hasil' },
              ]}
            />
            <ThemeToggle />
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-5 text-center">
              <p className="text-blue-100 text-xs font-bold tracking-wide">HASIL TRY OUT</p>
              <p className="text-white font-semibold mt-1">{peserta?.nama}</p>
              <p className="text-blue-100 text-xs mt-0.5">{formatJudulPaket(hasil.kodePaket)}</p>
            </div>

            <div className="px-6 py-8 text-center border-b border-slate-100 dark:border-navy-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Skor Akhir</p>
              <p className="text-6xl font-extrabold text-navy-900 dark:text-slate-100">{hasil.skor}</p>
              {hasil.otomatis && (
                <p className="text-xs text-amberx-600 dark:text-amberx-500 mt-2">
                  Ujian diselesaikan otomatis karena waktu habis.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-navy-700">
              <div className="px-4 py-4 text-center">
                <p className="text-2xl font-bold text-emeraldx-600 dark:text-emeraldx-500">{hasil.benar}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Benar</p>
              </div>
              <div className="px-4 py-4 text-center">
                <p className="text-2xl font-bold text-alarm-500">{hasil.salah}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Salah</p>
              </div>
              <div className="px-4 py-4 text-center">
                <p className="text-2xl font-bold text-slate-400">{hasil.kosong}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kosong</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-2.5">
              <button
                onClick={() => router.push('/pembahasan')}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg text-sm"
              >
                Lihat Pembahasan
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('tryout_peserta');
                  sessionStorage.removeItem('tryout_hasil');
                  sessionStorage.removeItem('tryout_pembahasan');
                  router.push('/');
                }}
                className="w-full border border-slate-300 dark:border-navy-600 text-navy-700 dark:text-slate-300 font-semibold py-2.5 rounded-lg text-sm"
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
