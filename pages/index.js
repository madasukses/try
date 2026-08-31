import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Breadcrumb from '../components/Breadcrumb';
import { getSoal } from '../lib/sheety';
import { PAKET, DURASI_MENIT } from '../lib/paketConfig';

export default function PilihPaket() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [identitasTersimpan, setIdentitasTersimpan] = useState(false);
  const [jumlahSoal, setJumlahSoal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('tryout_peserta');
    if (raw) {
      const p = JSON.parse(raw);
      setNama(p.nama);
      setEmail(p.email);
      setIdentitasTersimpan(true);
    }
    getSoal().then((data) => setJumlahSoal(data.length));
  }, []);

  function simpanIdentitas(e) {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) {
      setError('Nama dan email wajib diisi.');
      return;
    }
    setError('');
    sessionStorage.setItem(
      'tryout_peserta',
      JSON.stringify({ nama: nama.trim(), email: email.trim() })
    );
    setIdentitasTersimpan(true);
  }

  function pilihPaket() {
    if (!identitasTersimpan) {
      setError('Isi nama dan email terlebih dahulu.');
      return;
    }
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
                  <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
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

          <button
            onClick={pilihPaket}
            className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all p-5 sm:p-6"
          >
            <span className="inline-block text-xs font-bold bg-navy-700 text-white px-2.5 py-1 rounded mb-3">
              {PAKET.badge}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-navy-900 mb-1">{PAKET.judul}</h3>
            <p className="text-sm text-slate-500 mb-4">{PAKET.deskripsi}</p>
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
            {error && identitasTersimpan === false && (
              <p className="text-alarm-500 text-sm mt-3">{error}</p>
            )}
          </button>
        </div>
      </main>
    </>
  );
}
