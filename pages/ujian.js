import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getSoal, kirimHasil } from '../lib/sheety';

const DURASI_DETIK = 30 * 60; // 30 menit
const PILIHAN = ['A', 'B', 'C', 'D', 'E'];

function formatWaktu(detik) {
  const m = Math.floor(detik / 60).toString().padStart(2, '0');
  const s = Math.floor(detik % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Ujian() {
  const router = useRouter();
  const [peserta, setPeserta] = useState(null);
  const [soal, setSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [jawaban, setJawaban] = useState({});
  const [raguRagu, setRaguRagu] = useState({});
  const [sisaWaktu, setSisaWaktu] = useState(DURASI_DETIK);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const submitted = useRef(false);

  // Ambil data peserta & mulai sesi
  useEffect(() => {
    const raw = sessionStorage.getItem('tryout_peserta');
    if (!raw) {
      router.replace('/');
      return;
    }
    setPeserta(JSON.parse(raw));

    let mulaiTs = sessionStorage.getItem('tryout_mulai_ts');
    if (!mulaiTs) {
      mulaiTs = Date.now().toString();
      sessionStorage.setItem('tryout_mulai_ts', mulaiTs);
    }
    const elapsed = Math.floor((Date.now() - Number(mulaiTs)) / 1000);
    setSisaWaktu(Math.max(DURASI_DETIK - elapsed, 0));

    const savedJawaban = sessionStorage.getItem('tryout_jawaban');
    if (savedJawaban) setJawaban(JSON.parse(savedJawaban));
    const savedRagu = sessionStorage.getItem('tryout_ragu');
    if (savedRagu) setRaguRagu(JSON.parse(savedRagu));

    getSoal().then((data) => {
      setSoal(data);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (loading) return;
    if (sisaWaktu <= 0) {
      handleSubmit(true);
      return;
    }
    const t = setTimeout(() => setSisaWaktu((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sisaWaktu, loading]);

  // Persist progres
  useEffect(() => {
    sessionStorage.setItem('tryout_jawaban', JSON.stringify(jawaban));
  }, [jawaban]);
  useEffect(() => {
    sessionStorage.setItem('tryout_ragu', JSON.stringify(raguRagu));
  }, [raguRagu]);

  const soalAktif = soal[index];
  const totalDijawab = Object.keys(jawaban).length;

  const statusNomor = useMemo(() => {
    return soal.map((s) => {
      if (jawaban[s.id] !== undefined) return 'dijawab';
      if (raguRagu[s.id]) return 'ragu';
      return 'belum';
    });
  }, [soal, jawaban, raguRagu]);

  function pilihJawaban(huruf) {
    setJawaban((prev) => ({ ...prev, [soalAktif.id]: huruf }));
  }

  function toggleRagu() {
    setRaguRagu((prev) => ({ ...prev, [soalAktif.id]: !prev[soalAktif.id] }));
  }

  async function handleSubmit(otomatis = false) {
    if (submitted.current) return;
    submitted.current = true;
    setMengirim(true);

    let benar = 0;
    let salah = 0;
    soal.forEach((s) => {
      const dijawab = jawaban[s.id];
      if (dijawab === undefined) return;
      if (dijawab === s.kunci) benar += 1;
      else salah += 1;
    });
    const kosong = soal.length - benar - salah;
    const skor = soal.length > 0 ? Math.round((benar / soal.length) * 100) : 0;

    await kirimHasil({
      nama: peserta?.nama,
      email: peserta?.email,
      skor,
      benar,
      salah,
      kosong,
      waktuSelesai: new Date().toISOString(),
      detailJawaban: jawaban,
    });

    sessionStorage.setItem(
      'tryout_hasil',
      JSON.stringify({ skor, benar, salah, kosong, total: soal.length, otomatis })
    );
    sessionStorage.removeItem('tryout_mulai_ts');
    sessionStorage.removeItem('tryout_jawaban');
    sessionStorage.removeItem('tryout_ragu');

    router.push('/hasil');
  }

  if (loading || !soalAktif) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <p className="text-navy-200 font-mono text-sm">Memuat soal…</p>
      </div>
    );
  }

  const waktuKritis = sisaWaktu <= 300; // 5 menit terakhir

  return (
    <>
      <Head>
        <title>Ujian Berlangsung — Tryout CPNS</title>
      </Head>
      <div className="min-h-screen bg-navy-50 flex flex-col">
        {/* Top bar */}
        <header className="bg-navy-800 text-white px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <p className="text-xs text-navy-300 font-mono">PESERTA</p>
            <p className="font-semibold text-sm sm:text-base">{peserta?.nama}</p>
          </div>
          <div
            className={`font-mono text-lg sm:text-xl font-bold px-4 py-1.5 rounded ${
              waktuKritis ? 'bg-alarm-500 text-white' : 'bg-navy-700 text-white'
            }`}
          >
            {formatWaktu(sisaWaktu)}
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 p-4 max-w-6xl w-full mx-auto">
          {/* Panel soal */}
          <section className="bg-white rounded-lg shadow p-5 sm:p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold bg-navy-100 text-navy-700 px-2 py-1 rounded">
                {soalAktif.kategori}
              </span>
              <span className="text-sm text-navy-500">
                Soal {index + 1} dari {soal.length}
              </span>
            </div>

            <p className="text-navy-900 leading-relaxed mb-6 whitespace-pre-line">{soalAktif.soal}</p>

            <div className="space-y-2.5 flex-1">
              {PILIHAN.map((huruf) => {
                const teks = soalAktif[`pilihan${huruf}`];
                if (!teks) return null;
                const dipilih = jawaban[soalAktif.id] === huruf;
                return (
                  <label
                    key={huruf}
                    className={`flex gap-3 items-start border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                      dipilih
                        ? 'border-navy-700 bg-navy-50'
                        : 'border-navy-200 hover:border-navy-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`soal-${soalAktif.id}`}
                      checked={dipilih}
                      onChange={() => pilihJawaban(huruf)}
                      className="mt-1"
                    />
                    <span className="text-sm text-navy-800">
                      <span className="font-semibold mr-1.5">{huruf}.</span>
                      {teks}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-100">
              <button
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                disabled={index === 0}
                className="px-4 py-2 text-sm font-medium text-navy-700 border border-navy-300 rounded disabled:opacity-40"
              >
                ‹ Sebelumnya
              </button>
              <button
                onClick={toggleRagu}
                className={`px-4 py-2 text-sm font-medium rounded border ${
                  raguRagu[soalAktif.id]
                    ? 'bg-amberx-500 border-amberx-500 text-white'
                    : 'border-amberx-500 text-amberx-600'
                }`}
              >
                Ragu-ragu
              </button>
              <button
                onClick={() => setIndex((i) => Math.min(i + 1, soal.length - 1))}
                disabled={index === soal.length - 1}
                className="px-4 py-2 text-sm font-medium text-navy-700 border border-navy-300 rounded disabled:opacity-40"
              >
                Selanjutnya ›
              </button>
            </div>
          </section>

          {/* Navigator */}
          <aside className="bg-white rounded-lg shadow p-4 h-fit lg:sticky lg:top-20">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Navigasi Soal</h3>

            <div className="flex gap-3 mb-3 text-xs text-navy-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emeraldx-500 inline-block" /> Dijawab
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amberx-500 inline-block" /> Ragu
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border border-navy-300 inline-block" /> Kosong
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {soal.map((s, i) => {
                const status = statusNomor[i];
                const cls =
                  status === 'dijawab'
                    ? 'nomor-dijawab'
                    : status === 'ragu'
                    ? 'nomor-ragu'
                    : 'nomor-belum';
                return (
                  <button
                    key={s.id}
                    onClick={() => setIndex(i)}
                    className={`nomor-btn ${cls} ${i === index ? 'nomor-aktif' : ''}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-navy-500 mb-4">
              Terjawab: <span className="font-semibold text-navy-800">{totalDijawab}</span> / {soal.length}
            </p>

            <button
              onClick={() => setShowKonfirmasi(true)}
              className="w-full bg-navy-800 hover:bg-navy-900 text-white font-semibold py-2.5 rounded text-sm"
            >
              Selesai Ujian
            </button>
          </aside>
        </main>
      </div>

      {/* Modal konfirmasi */}
      {showKonfirmasi && (
        <div className="fixed inset-0 bg-navy-900/60 flex items-center justify-center px-4 z-20">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-navy-900 mb-2">Selesaikan ujian sekarang?</h3>
            <p className="text-sm text-navy-600 mb-4">
              Anda telah menjawab <span className="font-semibold">{totalDijawab}</span> dari{' '}
              {soal.length} soal. Jawaban tidak dapat diubah setelah ujian diselesaikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowKonfirmasi(false)}
                className="flex-1 border border-navy-300 text-navy-700 py-2 rounded text-sm font-medium"
              >
                Kembali
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={mengirim}
                className="flex-1 bg-navy-800 text-white py-2 rounded text-sm font-medium disabled:opacity-60"
              >
                {mengirim ? 'Menyimpan…' : 'Ya, Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
