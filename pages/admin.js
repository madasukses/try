import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { getPeserta, getHasil, getSoal } from '../lib/sheety';
import { ADMIN_PASSWORD, formatJudulPaket } from '../lib/paketConfig';
import DrawingOverlay from '../components/DrawingOverlay';
import ThemeToggle from '../components/ThemeToggle';

export default function Admin() {
  const [terbuka, setTerbuka] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorPw, setErrorPw] = useState('');

  const [loading, setLoading] = useState(false);
  const [peserta, setPeserta] = useState([]);
  const [hasil, setHasil] = useState([]);
  const [soal, setSoal] = useState([]);
  const [urutBerdasar, setUrutBerdasar] = useState('skor');
  const [tab, setTab] = useState('hasil'); // 'hasil' | 'soal' | 'instan'
  const [filterPaket, setFilterPaket] = useState('semua');
  const [instanPaket, setInstanPaket] = useState(null); // kode paket yang dipilih utk mode instan
  const [instanIndex, setInstanIndex] = useState(0);
  const [instanJawaban, setInstanJawaban] = useState(null); // huruf yg diklik utk soal aktif

  useEffect(() => {
    if (sessionStorage.getItem('tryout_admin_ok') === '1') {
      setTerbuka(true);
    }
  }, []);

  useEffect(() => {
    if (terbuka) muatData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terbuka]);

  function cekPassword(e) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('tryout_admin_ok', '1');
      setTerbuka(true);
      setErrorPw('');
    } else {
      setErrorPw('Password salah.');
    }
  }

  async function muatData() {
    setLoading(true);
    const [p, h, s] = await Promise.all([getPeserta(), getHasil(), getSoal()]);
    setPeserta(p);
    setHasil(h);
    setSoal(s);
    setLoading(false);
  }

  const hasilTerurut = useMemo(() => {
    const arr = [...hasil];
    if (urutBerdasar === 'skor') arr.sort((a, b) => (b.skor || 0) - (a.skor || 0));
    else if (urutBerdasar === 'waktu') arr.sort((a, b) => new Date(b.waktuSelesai) - new Date(a.waktuSelesai));
    else if (urutBerdasar === 'nama') arr.sort((a, b) => String(a.nama).localeCompare(String(b.nama)));
    return arr;
  }, [hasil, urutBerdasar]);

  const daftarKodePaket = useMemo(() => {
    const set = new Set(soal.map((s) => s.kode || 'SOAL1'));
    return Array.from(set).sort();
  }, [soal]);

  const soalTerfilter = useMemo(() => {
    if (filterPaket === 'semua') return soal;
    return soal.filter((s) => (s.kode || 'SOAL1') === filterPaket);
  }, [soal, filterPaket]);

  const soalInstan = useMemo(() => {
    if (!instanPaket) return [];
    return soal.filter((s) => (s.kode || 'SOAL1') === instanPaket);
  }, [soal, instanPaket]);

  const soalInstanAktif = soalInstan[instanIndex];

  function pilihJawabanInstan(huruf) {
    setInstanJawaban(huruf);
  }

  function soalInstanBerikutnya() {
    setInstanIndex((i) => Math.min(i + 1, soalInstan.length - 1));
    setInstanJawaban(null);
  }

  function soalInstanSebelumnya() {
    setInstanIndex((i) => Math.max(i - 1, 0));
    setInstanJawaban(null);
  }

  const rataSkor = hasil.length
    ? Math.round(hasil.reduce((sum, h) => sum + (Number(h.skor) || 0), 0) / hasil.length)
    : 0;

  function logout() {
    sessionStorage.removeItem('tryout_admin_ok');
    setTerbuka(false);
    setPasswordInput('');
  }

  if (!terbuka) {
    return (
      <>
        <Head>
          <title>Admin — Belajar Bareng Mada</title>
        </Head>
        <main className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
          <form
            onSubmit={cekPassword}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
          >
            <h1 className="font-bold text-navy-900 mb-1">Admin</h1>
            <p className="text-sm text-slate-500 mb-4">Masukkan password untuk melihat hasil.</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 focus:border-brand-500"
            />
            {errorPw && <p className="text-alarm-500 text-sm mb-3">{errorPw}</p>}
            <button
              type="submit"
              className="w-full bg-navy-800 hover:bg-navy-900 text-white font-semibold py-2.5 rounded-lg text-sm"
            >
              Masuk
            </button>
          </form>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin — Belajar Bareng Mada</title>
      </Head>
      <main className="min-h-screen bg-slate-50 dark:bg-navy-900 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-slate-100">Belajar Bareng Mada</h1>
            <div className="flex gap-2">
              <ThemeToggle />
              <button
                onClick={muatData}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-navy-600 rounded-lg text-navy-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 disabled:opacity-50"
              >
                {loading ? 'Memuat…' : '↻ Refresh'}
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium bg-alarm-500 hover:bg-alarm-600 text-white rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('hasil')}
              className={`text-sm font-medium px-4 py-2 rounded-lg border ${
                tab === 'hasil'
                  ? 'bg-navy-800 border-navy-800 text-white'
                  : 'border-slate-300 dark:border-navy-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
              }`}
            >
              Hasil Peserta
            </button>
            <button
              onClick={() => setTab('soal')}
              className={`text-sm font-medium px-4 py-2 rounded-lg border ${
                tab === 'soal'
                  ? 'bg-navy-800 border-navy-800 text-white'
                  : 'border-slate-300 dark:border-navy-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
              }`}
            >
              Bank Soal & Kunci
            </button>
            <button
              onClick={() => setTab('instan')}
              className={`text-sm font-medium px-4 py-2 rounded-lg border ${
                tab === 'instan'
                  ? 'bg-navy-800 border-navy-800 text-white'
                  : 'border-slate-300 dark:border-navy-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
              }`}
            >
              Konten
            </button>
          </div>

          {tab === 'hasil' && (
            <>
          {/* Ringkasan */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-navy-900 dark:text-slate-100">{peserta.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Peserta Terdaftar</p>
            </div>
            <div className="bg-white dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-navy-900 dark:text-slate-100">{hasil.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sudah Submit</p>
            </div>
            <div className="bg-white dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-navy-900 dark:text-slate-100">{rataSkor}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rata-rata Skor</p>
            </div>
          </div>

          {/* Urutkan */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Urutkan:</span>
            {[
              { key: 'skor', label: 'Skor tertinggi' },
              { key: 'waktu', label: 'Terbaru' },
              { key: 'nama', label: 'Nama A-Z' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setUrutBerdasar(opt.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                  urutBerdasar === opt.key
                    ? 'bg-navy-800 border-navy-800 text-white'
                    : 'border-slate-300 dark:border-navy-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Tabel hasil */}
          <div className="bg-white dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-left text-xs text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">No. WA</th>
                  <th className="px-4 py-3 font-medium">Paket</th>
                  <th className="px-4 py-3 font-medium text-right">Skor</th>
                  <th className="px-4 py-3 font-medium text-right">Benar</th>
                  <th className="px-4 py-3 font-medium text-right">Salah</th>
                  <th className="px-4 py-3 font-medium text-right">Kosong</th>
                  <th className="px-4 py-3 font-medium">Selesai</th>
                </tr>
              </thead>
              <tbody>
                {hasilTerurut.map((h, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-navy-700 last:border-0">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-navy-900 dark:text-slate-100">{h.nama}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{h.noWa}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatJudulPaket(h.paket)}</td>
                    <td className="px-4 py-3 text-right font-bold text-navy-900 dark:text-slate-100">{h.skor}</td>
                    <td className="px-4 py-3 text-right text-emeraldx-600 dark:text-emeraldx-500">{h.benar}</td>
                    <td className="px-4 py-3 text-right text-alarm-500">{h.salah}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{h.kosong}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                      {h.waktuSelesai ? new Date(h.waktuSelesai).toLocaleString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
                {hasilTerurut.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      Belum ada peserta yang submit hasil.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
            </>
          )}

          {tab === 'soal' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">Paket:</span>
                <button
                  onClick={() => setFilterPaket('semua')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                    filterPaket === 'semua'
                      ? 'bg-navy-800 border-navy-800 text-white'
                      : 'border-slate-300 dark:border-navy-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
                  }`}
                >
                  Semua
                </button>
                {daftarKodePaket.map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilterPaket(k)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                      filterPaket === k
                        ? 'bg-navy-800 border-navy-800 text-white'
                        : 'border-slate-300 dark:border-navy-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
                    }`}
                  >
                    {formatJudulPaket(k)}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {soalTerfilter.map((s, i) => (
                  <div key={s.id ?? i} className="bg-white dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-navy-800 text-white px-2.5 py-1 rounded">
                        No. {i + 1}
                      </span>
                      <span className="text-xs font-medium bg-slate-100 dark:bg-navy-700 text-navy-600 dark:text-slate-300 px-2.5 py-1 rounded">
                        {s.kategori}
                      </span>
                      <span className="text-xs font-medium bg-blue-50 dark:bg-navy-700 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded">
                        {formatJudulPaket(s.kode)}
                      </span>
                    </div>
                    <p className="text-sm text-navy-900 dark:text-slate-100 mb-2 whitespace-pre-line">{s.soal}</p>
                    <div className="grid sm:grid-cols-2 gap-1.5">
                      {['A', 'B', 'C', 'D', 'E'].map((huruf) => {
                        const teks = s[`pilihan${huruf}`];
                        if (!teks && teks !== 0) return null;
                        const benar = huruf === s.kunci;
                        return (
                          <div
                            key={huruf}
                            className={`flex gap-2 items-center text-sm px-3 py-1.5 rounded-lg ${
                              benar ? 'bg-emeraldx-50 dark:bg-navy-700 text-emeraldx-800 dark:text-emeraldx-400 font-medium' : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <span className="font-semibold">{huruf}.</span>
                            <span className="flex-1">{teks}</span>
                            {benar && <span className="text-xs">✓ Kunci</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {soalTerfilter.length === 0 && !loading && (
                  <p className="text-center text-slate-400 py-8">Belum ada soal.</p>
                )}
              </div>
            </>
          )}

          {tab === 'instan' && (
            <>
              {!instanPaket && (
                <div className="bg-white dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm p-6">
                  <h2 className="font-semibold text-navy-900 dark:text-slate-100 mb-1">Pilih paket dulu</h2>
                  <p className="text-sm text-slate-500 mb-4">
                    Soal akan muncul satu-satu. Begitu jawaban diklik, langsung kelihatan benar/salahnya —
                    cocok buat rekam konten sambil menjelaskan.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daftarKodePaket.map((k) => (
                      <button
                        key={k}
                        onClick={() => {
                          setInstanPaket(k);
                          setInstanIndex(0);
                          setInstanJawaban(null);
                        }}
                        className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 text-navy-700 hover:bg-slate-50"
                      >
                        {formatJudulPaket(k)}
                      </button>
                    ))}
                    {daftarKodePaket.length === 0 && (
                      <p className="text-sm text-slate-400">Belum ada soal.</p>
                    )}
                  </div>
                </div>
              )}

              {instanPaket && soalInstanAktif && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setInstanPaket(null)}
                      className="text-sm text-brand-600 font-medium hover:underline"
                    >
                      ← Ganti paket
                    </button>
                    <span className="text-sm text-slate-500">
                      {formatJudulPaket(instanPaket)} — Soal {instanIndex + 1} / {soalInstan.length}
                    </span>
                  </div>

                  <DrawingOverlay resetSignal={`${instanPaket}-${instanIndex}`}>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold bg-navy-800 text-white px-2.5 py-1 rounded">
                        No. {instanIndex + 1}
                      </span>
                      <span className="text-xs font-medium bg-slate-100 text-navy-600 px-2.5 py-1 rounded">
                        {soalInstanAktif.kategori}
                      </span>
                    </div>

                    <p className="text-navy-900 leading-relaxed mb-4 whitespace-pre-line">
                      {soalInstanAktif.soal}
                    </p>

                    <div className="max-w-xs sm:max-w-sm">
                    <div className="space-y-1.5">
                      {['A', 'B', 'C', 'D', 'E'].map((huruf) => {
                        const teks = soalInstanAktif[`pilihan${huruf}`];
                        if (!teks && teks !== 0) return null;
                        const dipilih = instanJawaban === huruf;
                        const iniKunci = huruf === soalInstanAktif.kunci;

                        let kelas = 'border-slate-200 hover:border-brand-300';
                        if (instanJawaban) {
                          if (iniKunci) kelas = 'border-emeraldx-500 bg-emeraldx-50';
                          else if (dipilih) kelas = 'border-alarm-500 bg-alarm-50';
                        }

                        return (
                          <button
                            key={huruf}
                            onClick={() => pilihJawabanInstan(huruf)}
                            disabled={Boolean(instanJawaban)}
                            className={`w-full flex gap-2 items-center border rounded-lg px-2.5 py-2 text-left transition-colors ${kelas}`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                instanJawaban && iniKunci
                                  ? 'bg-emeraldx-500 text-white'
                                  : instanJawaban && dipilih
                                  ? 'bg-alarm-500 text-white'
                                  : 'bg-slate-200 text-navy-600'
                              }`}
                            >
                              {huruf}
                            </span>
                            <span className="text-xs text-navy-800 flex-1">{teks}</span>
                            {instanJawaban && iniKunci && (
                              <span className="text-[10px] font-semibold text-emeraldx-700">✓</span>
                            )}
                            {instanJawaban && dipilih && !iniKunci && (
                              <span className="text-[10px] font-semibold text-alarm-600">✗</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={soalInstanSebelumnya}
                        disabled={instanIndex === 0}
                        className="px-3 py-1.5 text-xs font-medium text-navy-700 border border-slate-300 rounded-lg disabled:opacity-40"
                      >
                        ‹ Sebelumnya
                      </button>
                      <button
                        onClick={soalInstanBerikutnya}
                        disabled={instanIndex === soalInstan.length - 1}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-40"
                      >
                        Berikutnya ›
                      </button>
                    </div>
                    </div>
                  </div>

                  </DrawingOverlay>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
