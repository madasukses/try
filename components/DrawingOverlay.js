import { useCallback, useEffect, useRef, useState } from 'react';

const WARNA_PRESET = ['#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#0f172a'];
const MAKS_HISTORI = 30;

export default function DrawingOverlay({ resetSignal, children }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const [aktif, setAktif] = useState(false);
  const [tool, setTool] = useState('pensil'); // 'pensil' | 'hapus'
  const [warna, setWarna] = useState('#dc2626');
  const [ketebalan, setKetebalan] = useState(4);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const resizeCanvas = useCallback(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const rect = wrapper.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const bersihkan = useCallback((simpanDuluKeHistori) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (simpanDuluKeHistori) simpanHistori();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redoStack.current = [];
    setCanRedo(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset coretan tiap pindah soal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    undoStack.current = [];
    redoStack.current = [];
    setCanUndo(false);
    setCanRedo(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  function simpanHistori() {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

  function undo() {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(canvasRef.current.toDataURL());
    const prev = undoStack.current.pop();
    muatDataUrl(prev);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }

  function redo() {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(canvasRef.current.toDataURL());
    const next = redoStack.current.pop();
    muatDataUrl(next);
    setCanRedo(redoStack.current.length > 0);
    setCanUndo(true);
  }

  function posisiDariEvent(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function mulaiGambar(e) {
    if (!aktif) return;
    simpanHistori();
    isDrawing.current = true;
    lastPos.current = posisiDariEvent(e);
  }

  function gambar(e) {
    if (!aktif || !isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = posisiDariEvent(e);

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
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }

  function selesaiGambar() {
    isDrawing.current = false;
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3 bg-white rounded-xl border border-slate-200 shadow-sm p-3">
        <button
          onClick={() => setAktif((a) => !a)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
            aktif
              ? 'bg-emeraldx-500 border-emeraldx-500 text-white'
              : 'bg-slate-100 border-slate-300 text-slate-600'
          }`}
        >
          {aktif ? '🖊️ Mode Gambar: ON' : '🖱️ Mode Gambar: OFF'}
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        <button
          onClick={() => setTool('pensil')}
          disabled={!aktif}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border disabled:opacity-40 ${
            tool === 'pensil' && aktif
              ? 'bg-navy-800 border-navy-800 text-white'
              : 'border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          ✏️ Pensil
        </button>
        <button
          onClick={() => setTool('hapus')}
          disabled={!aktif}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border disabled:opacity-40 ${
            tool === 'hapus' && aktif
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
              disabled={!aktif}
              onClick={() => {
                setWarna(w);
                setTool('pensil');
              }}
              className={`w-6 h-6 rounded-full border-2 disabled:opacity-40 ${
                warna === w && tool === 'pensil' ? 'border-navy-800' : 'border-white'
              }`}
              style={{ backgroundColor: w }}
            />
          ))}
          <input
            type="color"
            value={warna}
            disabled={!aktif}
            onChange={(e) => {
              setWarna(e.target.value);
              setTool('pensil');
            }}
            className="w-6 h-6 rounded-full border-0 cursor-pointer disabled:opacity-40"
            title="Warna custom"
          />
        </div>

        <div className="flex items-center gap-2 ml-1">
          <span className="text-xs text-slate-500">Tebal</span>
          <input
            type="range"
            min="1"
            max="20"
            value={ketebalan}
            disabled={!aktif}
            onChange={(e) => setKetebalan(Number(e.target.value))}
            className="w-20 disabled:opacity-40"
          />
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1" />

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
          onClick={() => bersihkan(true)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 ml-auto"
        >
          Bersihkan
        </button>
      </div>

      {/* Konten asli + canvas transparan menempel di atasnya */}
      <div ref={wrapperRef} className="relative">
        {children}
        <canvas
          ref={canvasRef}
          onPointerDown={mulaiGambar}
          onPointerMove={gambar}
          onPointerUp={selesaiGambar}
          onPointerLeave={selesaiGambar}
          className="absolute inset-0 w-full h-full touch-none"
          style={{ pointerEvents: aktif ? 'auto' : 'none', cursor: aktif ? 'crosshair' : 'default' }}
        />
      </div>
    </div>
  );
}
