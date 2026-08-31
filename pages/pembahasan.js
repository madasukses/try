import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Breadcrumb from '../components/Breadcrumb';
import { YOUTUBE_URL } from '../lib/paketConfig';

const PILIHAN = ['A', 'B', 'C', 'D', 'E'];

export default function Pembahasan() {
  const router = useRouter();
  const [daftar, setDaftar] = useState(null);
  const [hasil, setHasil] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('tryout_pembahasan');
    const h = sessionStorage.getItem('tryout_hasil');
    if (!raw || !h) {
      router.replace('/');
      return;
    }
    setDaftar(JSON.parse(raw));
    setHasil(JSON.parse(h));
  }, [router]);

  if (!daftar) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 font-mono text-sm">Memuat pembahasan…</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Pembahasan Jawaban</title>
      </Head>
      <main className="min-h-screen bg-slate-50 px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Hasil', href: '/hasil' },
              { label: 'Pembahasan' },
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-1">Pembahasan Jawaban</h1>
          <p className="text-sm text-slate-500 mb-6">
            Skor kamu: <span className="font-semibold text-navy-800">{hasil?.skor}</span> — {hasil?.benar} benar,{' '}
            {hasil?.salah} salah, {hasil?.kosong} kosong dari {hasil?.total} soal.
          </p>

          {/* Ajakan YouTube */}
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl px-5 py-4 mb-6 hover:from-red-700 hover:to-red-800 transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl flex-shrink-0">
              ▶
            </span>
            <div className="text-white">
              <p className="font-semibold text-sm">Mau pembahasan lebih lengkap?</p>
              <p className="text-xs text-red-100">Tonton pembahasan videonya di channel YouTube kami →</p>
            </div>
          </a>

          <div className="space-y-4">
            {daftar.map((s, i) => {
              const dijawab = s.jawabanPeserta;
              const benar = dijawab === s.kunci;
              return (
                <div key={s.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold bg-navy-800 text-white px-2.5 py-1 rounded">
                      No. {i + 1}
                    </span>
                    <span className="text-xs font-medium bg-slate-100 text-navy-600 px-2.5 py-1 rounded">
                      {s.kategori}
                    </span>
                    {dijawab === null ? (
                      <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded ml-auto">
                        Tidak dijawab
                      </span>
                    ) : benar ? (
                      <span className="text-xs font-medium bg-emeraldx-50 text-emeraldx-700 px-2.5 py-1 rounded ml-auto">
                        ✓ Benar
                      </span>
                    ) : (
                      <span className="text-xs font-medium bg-alarm-50 text-alarm-600 px-2.5 py-1 rounded ml-auto">
                        ✗ Salah
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-navy-900 mb-3 whitespace-pre-line">{s.soal}</p>

                  <div className="space-y-1.5">
                    {PILIHAN.map((huruf) => {
                      const teks = s[`pilihan${huruf}`];
                      if (!teks) return null;
                      const iniKunci = huruf === s.kunci;
                      const iniDijawab = huruf === dijawab;

                      let kelas = 'border-slate-200 text-slate-600';
                      if (iniKunci) kelas = 'border-emeraldx-500 bg-emeraldx-50 text-emeraldx-800';
                      else if (iniDijawab && !iniKunci) kelas = 'border-alarm-500 bg-alarm-50 text-alarm-700';

                      return (
                        <div key={huruf} className={`flex gap-2.5 items-center border rounded-lg px-3 py-2 text-sm ${kelas}`}>
                          <span className="font-semibold">{huruf}.</span>
                          <span className="flex-1">{teks}</span>
                          {iniKunci && <span className="text-xs font-semibold">Kunci</span>}
                          {iniDijawab && !iniKunci && <span className="text-xs font-semibold">Jawabanmu</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => router.push('/hasil')}
            className="w-full mt-6 bg-navy-800 hover:bg-navy-900 text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            Kembali ke Hasil
          </button>
        </div>
      </main>
    </>
  );
}
