import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool } from 'lucide-react';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  titulo?: string;
  subtitulo?: string;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  titulo = 'Assinatura Digital de Aprovação',
  subtitulo = 'Desenhe sua assinatura com o dedo ou mouse para validar este documento legalmente.'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#f97316'; // Laranja âmbar Forja
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          }
        }
        setHasSignature(false);
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#12161f] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold uppercase">
              <PenTool className="w-3.5 h-3.5" />
              <span>Conformidade Digital</span>
            </div>
            <h3 className="text-xl font-display font-bold text-white">{titulo}</h3>
            <p className="text-xs text-neutral-400">{subtitulo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quadro de Assinatura */}
        <div className="relative border-2 border-dashed border-neutral-700 rounded-xl bg-[#090b10] overflow-hidden">
          <canvas
            ref={canvasRef}
            width={460}
            height={200}
            className="w-full h-[200px] cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono text-neutral-600">
            Linha de base de assinatura digital ------------------------------------------
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border border-neutral-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Traço</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasSignature}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                hasSignature
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Salvar Assinatura</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
