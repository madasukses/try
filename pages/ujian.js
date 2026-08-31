import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Breadcrumb from '../components/Breadcrumb';
import { getSoal, kirimHasil } from '../lib/sheety';
import { DURASI_DETIK, formatJudulPaket, ambilSoalPaket } from '../lib/paketConfig';

const PILIHAN = ['A', 'B', 'C', 'D', 'E'];

function formatWaktu(detik) {
  const h = Math.floor(detik / 3600).toString().padStart(2, '0');
  const m = Math.floor((detik % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(detik % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function Ujian() {
  const router = useRouter();
  const [peserta, setPeserta] = useState(null);
  const [kodePaket, setKodePaket] = useState(null);
  const [soal, setSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [jawaban, setJawaban] = useState({});
  const [raguRagu, setRaguRagu] = useState({});
  const [sisaWaktu, setSisaWaktu] = useState(DURASI_DETIK);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [showBatal, setShowBatal] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('tryout_peserta');
    const kode = sessionStorage.getItem('tryout_kode_paket');
    if (!raw || !kode) {
      router.replace('/');
      return;
    }
    setPeserta(JSON.parse(raw));
    setKodePaket(kode);

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
      setSoal(ambilSoalPaket(data, kode));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function batalkanUjian() {
    sessionStorage.removeItem('tryout_mulai_ts');
    sessionStorage.removeItem('tryout_jawaban');
    sessionStorage.removeItem('tryout_ragu');
    router.push('/');
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
      noWa: peserta?.noWa,
      paket: kodePaket,
      skor,
      benar,
      salah,
      kosong,
      waktuSelesai: new Date().toISOString(),
      detailJawaban: jawaban,
    });

    sessionStorage.setItem(
      'tryout_hasil',
      JSON.stringify({ skor, benar, salah, kosong, total: soal.length, otomatis, kodePaket })
    );
    sessionStorage.removeItem('tryout_mulai_ts');
    sessionStorage.removeItem('tryout_jawaban');
    sessionStorage.removeItem('tryout_ragu');

    router.push('/hasil');
  }

  if (loading || !soalAktif) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 font-mono text-sm">Memuat soal…</p>
      </div>
    );
  }

  const waktuKritis = sisaWaktu <= 300;

  return (
    <>
      <Head>
        <title>Mengerjakan {formatJudulPaket(kodePaket)}</title>
      </Head>
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Persiapan Mengerjakan', href: '/persiapan' },
              { label: `Mengerjakan ${formatJudulPaket(kodePaket)}` },
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">{formatJudulPaket(kodePaket)}</h1>
          <p className="text-sm text-slate-500 mb-5">
            Kerjakan soal dengan jujur dan sungguh-sungguh untuk mengukur kemampuan kamu.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
            {/* Panel soal */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-navy-800 text-white px-2.5 py-1 rounded">
                    No. {index + 1}
                  </span>
                  <span className="text-xs font-medium bg-slate-100 text-navy-600 px-2.5 py-1 rounded">
                    {soalAktif.kategori}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleRagu}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                      raguRagu[soalAktif.id]
                        ? 'bg-amberx-500 border-amberx-500 text-white'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ⚑ Ragu-ragu
                  </button>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-alarm-500 text-alarm-500 hover:bg-alarm-50">
                    ⚠ Laporkan
                  </button>
                </div>
              </div>

              <p className="text-navy-900 leading-relaxed mb-6 whitespace-pre-line">{soalAktif.soal}</p>

              <div className="space-y-3">
                {PILIHAN.map((huruf) => {
                  const teks = soalAktif[`pilihan${huruf}`];
                  if (!teks) return null;
                  const dipilih = jawaban[soalAktif.id] === huruf;
                  return (
                    <label
                      key={huruf}
                      className={`flex gap-3 items-center border rounded-xl px-4 py-3.5 cursor-pointer transition-colors ${
                        dipilih
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-slate-200 bg-slate-50 hover:border-brand-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`soal-${soalAktif.id}`}
                        checked={dipilih}
                        onChange={() => pilihJawaban(huruf)}
                        className="sr-only"
                      />
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          dipilih ? 'bg-brand-600 text-white' : 'bg-slate-200 text-navy-600'
                        }`}
                      >
                        {huruf}
                      </span>
                      <span className="text-sm text-navy-800">{teks}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                <button
                  onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                  disabled={index === 0}
                  className="px-5 py-2.5 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg disabled:opacity-40"
                >
                  ‹ Sebelumnya
                </button>
                <button
                  onClick={() => setIndex((i) => Math.min(i + 1, soal.length - 1))}
                  disabled={index === soal.length - 1}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-40"
                >
                  Selanjutnya ›
                </button>
              </div>
            </section>

            {/* Sidebar */}
            <aside className="space-y-4 h-fit lg:sticky lg:top-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                <p
                  className={`font-mono text-2xl font-bold ${
                    waktuKritis ? 'text-alarm-500' : 'text-navy-900'
                  }`}
                >
                  {formatWaktu(sisaWaktu)}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-navy-800 mb-3 text-center">Sudah Selesai?</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBatal(true)}
                    className="flex-1 bg-alarm-500 hover:bg-alarm-600 text-white text-sm font-semibold py-2 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setShowKonfirmasi(true)}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 rounded-lg"
                  >
                    Selesai
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-navy-800 mb-3">Nomor Soal</h3>
                <div className="flex gap-3 mb-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-brand-600 inline-block" /> Dijawab
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amberx-500 inline-block" /> Ragu
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded border border-slate-300 inline-block" /> Kosong
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-1">
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
                <p className="text-xs text-slate-500 mt-3">
                  Terjawab: <span className="font-semibold text-navy-800">{totalDijawab}</span> / {soal.length}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showKonfirmasi && (
        <div className="fixed inset-0 bg-navy-900/50 flex items-center justify-center px-4 z-20">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-navy-900 mb-2">Selesaikan ujian sekarang?</h3>
            <p className="text-sm text-slate-500 mb-4">
              Anda telah menjawab <span className="font-semibold">{totalDijawab}</span> dari{' '}
              {soal.length} soal. Jawaban tidak dapat diubah setelah ujian diselesaikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowKonfirmasi(false)}
                className="flex-1 border border-slate-300 text-navy-700 py-2 rounded-lg text-sm font-medium"
              >
                Kembali
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={mengirim}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {mengirim ? 'Menyimpan…' : 'Ya, Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatal && (
        <div className="fixed inset-0 bg-navy-900/50 flex items-center justify-center px-4 z-20">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-navy-900 mb-2">Batalkan try out ini?</h3>
            <p className="text-sm text-slate-500 mb-4">
              Semua jawaban yang sudah diisi tidak akan disimpan. Anda akan kembali ke halaman awal.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBatal(false)}
                className="flex-1 border border-slate-300 text-navy-700 py-2 rounded-lg text-sm font-medium"
              >
                Lanjutkan Ujian
              </button>
              <button
                onClick={batalkanUjian}
                className="flex-1 bg-alarm-500 hover:bg-alarm-600 text-white py-2 rounded-lg text-sm font-medium"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
