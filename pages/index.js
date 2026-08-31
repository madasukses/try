import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Breadcrumb from '../components/Breadcrumb';
import { getSoal, catatPeserta } from '../lib/sheety';
import { formatJudulPaket, groupSoalByPaket } from '../lib/paketConfig';

export default function PilihPaket() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [noWa, setNoWa] = useState('');
  const [identitasTersimpan, setIdentitasTersimpan] = useState(false);
  const [daftarPaket, setDaftarPaket] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('tryout_peserta');
    if (raw) {
      const p = JSON.parse(raw);
      setNama(p.nama);
      setNoWa(p.noWa);
      setIdentitasTersimpan(true);
    }
    getSoal().then((data) => setDaftarPaket(groupSoalByPaket(data)));
  }, []);

  async function simpanIdentitas(e) {
    e.preventDefault();
    if (!nama.trim() || !noWa.trim()) {
      setError('Nama dan nomor WhatsApp wajib diisi.');
      return;
    }
    setError('');
    const peserta = { nama: nama.trim(), noWa: noWa.trim(), waktuMulai: new Date().toISOString() };
    sessionStorage.setItem('tryout_peserta', JSON.stringify(peserta));
    setIdentitasTersimpan(true);
    catatPeserta(peserta); // dikirim ke Sheet di belakang layar, tidak menghalangi peserta lanjut
  }

  function pilihPaket(kode) {
    if (!identitasTersimpan) {
      setError('Isi nama dan nomor WhatsApp terlebih dahulu.');
      return;
    }
    sessionStorage.setItem('tryout_kode_paket', kode);
    router.push('/persiapan');
  }

  return (
    <>
      <Head>
        <title>Try Out dan Latihan SKD</title>
      </Head>
      <main className="min-h-screen bg-slate-50 px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Try Out dan Latihan SKD' }]} />
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">Try Out dan Latihan SKD</h1>

          {!identitasTersimpan && (
            <form
              onSubmit={simpanIdentitas}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6"
            >
              <h2 className="font-semibold text-navy-800 mb-1">Data Peserta</h2>
              <p className="text-sm text-slate-500 mb-4">Isi identitas sekali saja sebelum memilih paket.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Sesuai identitas"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={noWa}
                    onChange={(e) => setNoWa(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-500"
                  />
                </div>
              </div>
              {error && <p className="text-alarm-500 text-sm mt-3">{error}</p>}
              <button
                type="submit"
                className="mt-4 bg-navy-800 hover:bg-navy-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
              >
                Simpan & Lanjutkan
              </button>
            </form>
          )}

          {identitasTersimpan && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 mb-6 flex items-center justify-between">
              <p className="text-sm text-navy-700">
                Peserta: <span className="font-semibold">{nama}</span>
              </p>
              <button
                onClick={() => setIdentitasTersimpan(false)}
                className="text-sm text-brand-600 font-medium hover:underline"
              >
                Ganti
              </button>
            </div>
          )}

          <h2 className="text-sm font-semibold text-slate-500 mb-3 tracking-wide">PAKET TERSEDIA</h2>

          {daftarPaket === null && (
            <p className="text-sm text-slate-400">Memuat daftar paket…</p>
          )}

          {daftarPaket !== null && daftarPaket.length === 0 && (
            <p className="text-sm text-slate-400">Belum ada soal di Sheet.</p>
          )}

          <div className="space-y-3">
            {daftarPaket?.map(({ kode, jumlah }) => (
              <button
                key={kode}
                onClick={() => pilihPaket(kode)}
                className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all p-5 sm:p-6"
              >
                <h3 className="text-lg sm:text-xl font-bold text-navy-900 mb-1">{formatJudulPaket(kode)}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Simulasi ujian Computer Assisted Test — TWK, TIU, dan TKP.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                    <p className="text-xs text-slate-500 mb-1">JUMLAH SOAL</p>
                    <p className="text-xl font-bold text-navy-900">{jumlah} soal</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                    <p className="text-xs text-slate-500 mb-1">DURASI</p>
                    <p className="text-xl font-bold text-navy-900">30 menit</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <p className="text-alarm-500 text-sm mt-4">{error}</p>
          )}
        </div>
      </main>
    </>
  );
}
