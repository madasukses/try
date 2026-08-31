import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Breadcrumb from '../components/Breadcrumb';
import { getSoal } from '../lib/sheety';
import {
  DURASI_MENIT,
  PASSING_GRADE,
  KATEGORI_LABEL,
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
      <main className="min-h-screen bg-slate-50 px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Try Out dan Latihan SKD', href: '/' },
              { label: 'Persiapan Mengerjakan' },
            ]}
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">Persiapan Mengerjakan</h1>

          <div className="bg-blue-50 border-l-4 border-brand-500 rounded-lg px-5 py-4 mb-6 flex gap-3 items-start">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              i
            </span>
            <div>
              <p className="text-xs font-bold text-brand-700 tracking-wide mb-0.5">PENTING</p>
              <p className="text-sm text-navy-700">
                Hindari login dari device lain selama mengerjakan try out agar sesi kamu tidak ter-logout.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-navy-900 mb-4">{judulPaket}</h2>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">JUMLAH SOAL</p>
                <p className="text-xl font-bold text-navy-900">{jumlahSoal ?? '…'} soal</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">DURASI</p>
                <p className="text-xl font-bold text-navy-900">{DURASI_MENIT} menit</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                PG
              </span>
              <div>
                <h3 className="font-bold text-navy-900">Passing Grade</h3>
                <p className="text-xs text-slate-500">Standar kelulusan minimum per kategori</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(PASSING_GRADE).map(([kat, nilai]) => (
                <div key={kat} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-3">
                  <p className="text-xs font-semibold text-brand-600">{kat}</p>
                  <p className="text-[11px] text-slate-500 mb-1 leading-tight">{KATEGORI_LABEL[kat]}</p>
                  <p className="text-xl font-bold text-navy-900">{nilai}</p>
                </div>
              ))}
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
