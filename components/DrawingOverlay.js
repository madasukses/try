import { useEffect, useRef, useState } from 'react';

const WARNA_PRESET = ['#000000', '#dc2626', '#2563eb', '#16a34a', '#f59e0b'];
const UKURAN = [
  { key: 'tipis', label: 'Tipis', nilai: 2 },
  { key: 'normal', label: 'Normal', nilai: 5 },
  { key: 'tebal', label: 'Tebal', nilai: 10 },
];
const AMBANG_KLIK = 4; // px — gerakan di bawah ini dianggap klik, bukan gambar
const MAKS_HISTORI = 30;

export default function DrawingOverlay({ resetSignal, children }) {
  const canvasRef = useRef(null);
  const menggambar = useRef(false); // sedang menggambar beneran (sudah lewat ambang klik)
  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const historiTersimpanUntukStroke = useRef(false);
  const elemHover = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const [tool, setTool] = useState('pensil'); // 'pensil' | 'hapus'
  const [warna, setWarna] = useState('#000000');
  const [ukuranKey, setUkuranKey] = useState('normal');
  const ketebalan = UKURAN.find((u) => u.key === ukuranKey).nilai;
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Bersihkan + reset riwayat tiap pindah soal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    undoStack.current = [];
    redoStack.current = [];
    setCanUndo(false);
    setCanRedo(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  function simpanHistori() {
    const canvas = canvasRef.current;
    undoStack.current.push(canvas.toDataURL());
    if (undoStack.current.length > MAKS_HISTORI) undoStack.current.shift();
    setCanUndo(true);
  }

  function muatDataUrl(dataUrl) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = dataUrl;
  }

  function bersihkan() {
    simpanHistori();
    canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redoStack.current = [];
    setCanRedo(false);
  }

  function undo() {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(canvasRef.current.toDataURL());
    muatDataUrl(undoStack.current.pop());
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }

  function redo() {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(canvasRef.current.toDataURL());
    muatDataUrl(redoStack.current.pop());
    setCanRedo(redoStack.current.length > 0);
    setCanUndo(true);
  }

  // Cari elemen (di luar kanvas) persis di titik x,y — dipakai buat "tembus klik" & hover
  function cariElemenDiBawah(x, y) {
    const semua = document.elementsFromPoint(x, y);
    for (const el of semua) {
      if (el === canvasRef.current) continue;
      const tombol = el.closest && el.closest('button, a, input, select, label');
      if (tombol) return tombol;
    }
    return null;
  }

  function gambarGaris(dariX, dariY, keX, keY) {
    const ctx = canvasRef.current.getContext('2d');
    if (tool === 'hapus') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = ketebalan * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = warna;
      ctx.lineWidth = ketebalan;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(dariX, dariY);
    ctx.lineTo(keX, keY);
    ctx.stroke();
  }

  function handlePointerDown(e) {
    startPos.current = { x: e.clientX, y: e.clientY };
    lastPos.current = { x: e.clientX, y: e.clientY };
    menggambar.current = true;
    historiTersimpanUntukStroke.current = false;
  }

  function handlePointerMove(e) {
    const x = e.clientX;
    const y = e.clientY;

    // Tombol kiri/jari sedang ditekan -> mode gambar/drag
    if (menggambar.current) {
      const jarak = Math.hypot(x - startPos.current.x, y - startPos.current.y);
      if (jarak > AMBANG_KLIK) {
        if (!historiTersimpanUntukStroke.current) {
          simpanHistori();
          historiTersimpanUntukStroke.current = true;
        }
        gambarGaris(lastPos.current.x, lastPos.current.y, x, y);
        lastPos.current = { x, y };
      }
      return;
    }

    // Tidak sedang menekan -> simulasikan hover ke elemen di bawah kanvas
    const target = cariElemenDiBawah(x, y);
    if (target !== elemHover.current) {
      if (elemHover.current) elemHover.current.classList.remove('canvas-hover-aktif');
      if (target) target.classList.add('canvas-hover-aktif');
      elemHover.current = target;
    }
  }

  function handlePointerUp(e) {
    const jarak = Math.hypot(e.clientX - startPos.current.x, e.clientY - startPos.current.y);
    if (jarak <= AMBANG_KLIK) {
      // dianggap klik biasa -> teruskan ke elemen di bawah kanvas
      const target = cariElemenDiBawah(e.clientX, e.clientY);
      if (target) target.click();
    }
    menggambar.current = false;
    historiTersimpanUntukStroke.current = false;
  }

  function handlePointerLeave() {
    menggambar.current = false;
    if (elemHover.current) {
      elemHover.current.classList.remove('canvas-hover-aktif');
      elemHover.current = null;
    }
  }

  return (
    <div>
      <style jsx global>{`
        .canvas-hover-aktif {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
      `}</style>

      {/* Toolbar — sticky di atas, z-index lebih tinggi dari kanvas jadi selalu bisa diklik normal */}
      <div className="sticky top-2 z-50 flex flex-wrap items-center gap-2 mb-3 bg-white rounded-xl border border-slate-200 shadow-md p-3">
        <button
          onClick={() => setTool('pensil')}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
            tool === 'pensil'
              ? 'bg-navy-800 border-navy-800 text-white'
              : 'border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          ✏️ Pensil
        </button>
        <button
          onClick={() => setTool('hapus')}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
            tool === 'hapus'
              ? 'bg-navy-800 border-navy-800 text-white'
              : 'border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          🧽 Hapus
        </button>

        <div className="flex items-center gap-1 ml-1">
          {WARNA_PRESET.map((w) => (
            <button
              key={w}
              onClick={() => {
                setWarna(w);
                setTool('pensil');
              }}
              className={`w-6 h-6 rounded-full border-2 ${
                warna === w && tool === 'pensil' ? 'border-navy-800' : 'border-white'
              }`}
              style={{ backgroundColor: w, boxShadow: '0 0 0 1px #e2e8f0' }}
            />
          ))}
          <input
            type="color"
            value={warna}
            onChange={(e) => {
              setWarna(e.target.value);
              setTool('pensil');
            }}
            className="w-6 h-6 rounded-full border-0 cursor-pointer"
            title="Warna custom"
          />
        </div>

        <div className="flex items-center gap-1 ml-1">
          {UKURAN.map((u) => (
            <button
              key={u.key}
              onClick={() => setUkuranKey(u.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                ukuranKey === u.key
                  ? 'bg-navy-800 border-navy-800 text-white'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>

        <button
          onClick={undo}
          disabled={!canUndo}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          ↶ Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          ↷ Redo
        </button>

        <button
          onClick={bersihkan}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 ml-auto"
        >
          Bersihkan
        </button>
      </div>

      {children}

      {/* Kanvas menutupi SELURUH layar (fixed), bukan cuma area soal */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="fixed inset-0 touch-none z-40"
        style={{ cursor: 'crosshair' }}
      />
    </div>
  );
}
