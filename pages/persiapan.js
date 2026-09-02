import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Breadcrumb from '../components/Breadcrumb';
import ThemeToggle from '../components/ThemeToggle';
import { getSoal } from '../lib/sheety';
import {
  DURASI_MENIT,
  formatJudulPaket,
  ambilSoalPaket,
} from '../lib/paketConfig';

export default function Persiapan() {
  const router = useRouter();
  const [kodePaket, setKodePaket] = useState(null);
  const [jumlahSoal, setJumlahSoal] = useState(null);

  useEffect(() => {
    const peserta = sessionStorage.getItem('tryout_peserta');
    const kode = sessionStorage.getItem('tryout_kode_paket');
    if (!peserta || !kode) {
      router.replace('/');
      return;
    }
    setKodePaket(kode);
    getSoal().then((data) => setJumlahSoal(ambilSoalPaket(data, kode).length));
  }, [router]);

  if (!kodePaket) return null;

  const judulPaket = formatJudulPaket(kodePaket);

  return (
    <>
      <Head>
        <title>Persiapan Mengerjakan — {judulPaket}</title>
      </Head>
      <main className="min-h-screen bg-slate-50 dark:bg-navy-900 px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Try Out dan Latihan SKD', href: '/' },
                { label: 'Persiapan Mengerjakan' },
              ]}
            />
            <ThemeToggle />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-slate-100 mb-6">Persiapan Mengerjakan</h1>

          <div className="bg-blue-50 dark:bg-navy-800 border-l-4 border-brand-500 rounded-lg px-5 py-4 mb-6 flex gap-3 items-start">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              i
            </span>
            <div>
              <p className="text-xs font-bold text-brand-700 dark:text-brand-400 tracking-wide mb-0.5">PENTING</p>
              <p className="text-sm text-navy-700 dark:text-slate-300">
                Hindari login dari device lain selama mengerjakan try out agar sesi kamu tidak ter-logout.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm p-5 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-navy-900 dark:text-slate-100 mb-4">{judulPaket}</h2>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <div className="bg-slate-50 dark:bg-navy-700 border border-slate-200 dark:border-navy-600 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">JUMLAH SOAL</p>
                <p className="text-xl font-bold text-navy-900 dark:text-slate-100">{jumlahSoal ?? '…'} soal</p>
              </div>
              <div className="bg-slate-50 dark:bg-navy-700 border border-slate-200 dark:border-navy-600 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">DURASI</p>
                <p className="text-xl font-bold text-navy-900 dark:text-slate-100">{DURASI_MENIT} menit</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-800 px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-white">
              <p className="text-xs font-bold tracking-wide opacity-90">SIAP MULAI?</p>
              <p className="font-semibold">Kerjakan dengan tenang & raih skor terbaikmu.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => router.push('/')}
                className="px-5 py-2.5 rounded-lg border border-white/40 text-white text-sm font-medium hover:bg-white/10"
              >
                Kembali
              </button>
              <button
                onClick={() => router.push('/ujian')}
                className="px-5 py-2.5 rounded-lg bg-white text-brand-700 text-sm font-semibold hover:bg-blue-50"
              >
                ▶ Mulai Mengerjakan
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
