import { useEffect, useRef, useState } from 'react';

const WARNA_PRESET = ['#dc2626', '#2563eb', '#16a34a', '#0f172a', '#f59e0b'];

export default function DrawingCanvas({ resetSignal }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [tool, setTool] = useState('pensil'); // 'pensil' | 'hapus'
  const [warna, setWarna] = useState('#dc2626');
  const [ketebalan, setKetebalan] = useState(4);

  function bersihkanCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Set resolusi canvas sesuai ukuran wadahnya, isi putih di awal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    bersihkanCanvas();
  }, []);

  // Bersihkan otomatis tiap pindah soal
  useEffect(() => {
    bersihkanCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  function posisiDariEvent(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function mulaiGambar(e) {
    isDrawing.current = true;
    lastPos.current = posisiDariEvent(e);
  }

  function gambar(e) {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = posisiDariEvent(e);

    ctx.strokeStyle = tool === 'hapus' ? '#ffffff' : warna;
    ctx.lineWidth = tool === 'hapus' ? ketebalan * 4 : ketebalan;
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-slate-100">
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
              style={{ backgroundColor: w }}
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

        <div className="flex items-center gap-2 ml-1">
          <span className="text-xs text-slate-500">Tebal</span>
          <input
            type="range"
            min="1"
            max="20"
            value={ketebalan}
            onChange={(e) => setKetebalan(Number(e.target.value))}
            className="w-20"
          />
        </div>

        <button
          onClick={bersihkanCanvas}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 ml-auto"
        >
          Bersihkan
        </button>
      </div>

      {/* Kanvas */}
      <div className="flex-1 min-h-[320px] relative rounded-lg overflow-hidden border border-slate-200">
        <canvas
          ref={canvasRef}
          onPointerDown={mulaiGambar}
          onPointerMove={gambar}
          onPointerUp={selesaiGambar}
          onPointerLeave={selesaiGambar}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
        />
      </div>
    </div>
  );
}
