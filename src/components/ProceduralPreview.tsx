import React, { useState } from 'react';
import { TipoPeca, GenesPeca, DimensoesPeca } from '../types';
import { gerarPecaSVG } from '../lib/proceduralSvg';
import { Download, Copy, Check, ZoomIn, ZoomOut, RotateCcw, Ruler, Eye } from 'lucide-react';

interface ProceduralPreviewProps {
  tipo: TipoPeca;
  genes: GenesPeca;
  dimensoes: DimensoesPeca;
  corHex: string;
  corNome: string;
  className?: string;
  showTechnicalControls?: boolean;
}

export const ProceduralPreview: React.FC<ProceduralPreviewProps> = ({
  tipo,
  genes,
  dimensoes,
  corHex,
  corNome,
  className = '',
  showTechnicalControls = true
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const svgRaw = gerarPecaSVG(tipo, genes, dimensoes, corHex);

  const handleCopySvg = () => {
    navigator.clipboard.writeText(svgRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgRaw], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peca-${tipo}-${dimensoes.largura}x${dimensoes.altura}cm.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`relative flex flex-col bg-[#0b0e14] rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl ${className}`}>
      {/* Barra Superior Técnica Responsiva */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-neutral-800/80 bg-[#12161f]/90 backdrop-blur text-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-mono text-neutral-400 font-medium text-[11px] sm:text-xs">CAD 2D</span>
          <span className="text-neutral-600">|</span>
          <span className="text-amber-500/90 font-mono uppercase tracking-wider font-semibold text-[11px] sm:text-xs">
            {tipo.toUpperCase()}
          </span>
          <span className="text-neutral-300 font-mono tabular-nums text-[11px] sm:text-xs">
            {dimensoes.largura} × {dimensoes.altura} cm
          </span>
        </div>

        {showTechnicalControls && (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {/* Toggle Grid */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              title="Alternar grade milimetrada"
              className={`px-2 py-1 rounded transition-colors text-[11px] font-mono flex items-center gap-1 cursor-pointer ${
                showGrid ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grade</span>
            </button>

            {/* Toggle Cotas */}
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              title="Alternar cotas de medição"
              className={`px-2 py-1 rounded transition-colors text-[11px] font-mono flex items-center gap-1 cursor-pointer ${
                showDimensions ? 'bg-neutral-800 text-emerald-400 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cotas</span>
            </button>

            {/* Controles de Zoom */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded px-1">
              <button
                onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
                title="Reduzir zoom"
                className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-neutral-400 px-0.5 sm:px-1 tabular-nums w-8 sm:w-9 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
                title="Aumentar zoom"
                className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                title="Resetar visualização"
                className="p-1 text-neutral-400 hover:text-white transition-colors border-l border-neutral-800 ml-0.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Ações Exportação */}
            <button
              onClick={handleCopySvg}
              title="Copiar código SVG"
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDownloadSvg}
              title="Baixar arquivo SVG para corte CNC"
              className="p-1.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Área Gráfica Interativa com Fundo Técnico de Forja / Blueprint */}
      <div className="relative flex-1 w-full min-h-[320px] max-h-[500px] flex items-center justify-center p-6 overflow-hidden select-none bg-[#090b10]">
        {/* Grade de engenharia estilizada */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #38bdf8 1px, transparent 1px),
                linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px'
            }}
          />
        )}

        {/* Cota Superior (Largura) */}
        {showDimensions && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#12161f]/90 border border-neutral-700/80 px-2.5 py-1 rounded text-[11px] font-mono text-neutral-300 shadow z-10">
            <span className="text-neutral-500">◀</span>
            <span className="font-semibold text-amber-400">{dimensoes.largura} cm</span>
            <span className="text-neutral-400 text-[10px]">({(dimensoes.largura / 100).toFixed(2)}m)</span>
            <span className="text-neutral-500">▶</span>
          </div>
        )}

        {/* Cota Lateral (Altura) */}
        {showDimensions && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 flex items-center gap-2 bg-[#12161f]/90 border border-neutral-700/80 px-2.5 py-1 rounded text-[11px] font-mono text-neutral-300 shadow z-10 origin-center">
            <span className="text-neutral-500">◀</span>
            <span className="font-semibold text-amber-400">{dimensoes.altura} cm</span>
            <span className="text-neutral-400 text-[10px]">({(dimensoes.altura / 100).toFixed(2)}m)</span>
            <span className="text-neutral-500">▶</span>
          </div>
        )}

        {/* Conteúdo SVG renderizado com zoom suave */}
        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{
            transform: `scale(${zoom})`,
            width: '90%',
            height: '85%'
          }}
          dangerouslySetInnerHTML={{ __html: svgRaw }}
        />

        {/* Selo de Norma ou Acabamento no canto inferior */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#12161f]/90 border border-neutral-800 px-2.5 py-1 rounded text-[10px] font-mono text-neutral-400">
          <div className="w-2.5 h-2.5 rounded-full border border-neutral-600" style={{ backgroundColor: corHex }} />
          <span>{corNome}</span>
          {tipo === 'guarda-corpo' && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="text-emerald-400 font-medium">NBR 14718 (OK)</span>
            </>
          )}
          {tipo === 'corrimao' && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="text-emerald-400 font-medium">NBR 9050 (OK)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
