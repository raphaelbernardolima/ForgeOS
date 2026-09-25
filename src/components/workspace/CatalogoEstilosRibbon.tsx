import React from 'react';
import { Sparkles, Sliders, Plus } from 'lucide-react';
import { useSerralheria } from '../../context/SerralheriaContext';
import { gerarPecaSVG } from '../../lib/proceduralSvg';

export const CatalogoEstilosRibbon: React.FC = () => {
  const { presets, carregarPresetNoSimulador, criarOrcamentoRapidoComPreset } = useSerralheria();

  if (!presets || presets.length === 0) return null;

  return (
    <div className="bg-[#11141c] border border-neutral-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-white">
            Modelos de Estruturas Salvos ({presets.length})
          </h3>
        </div>
        <span className="text-[11px] text-neutral-400">
          Clique para usar em um novo orçamento
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map(preset => {
          const thumb = gerarPecaSVG(preset.tipo, preset.genes, { largura: 140, altura: 70 }, preset.corHex);
          return (
            <div
              key={preset.id}
              className="bg-[#161a25] border border-neutral-800 hover:border-neutral-700 rounded-lg p-3 flex flex-col justify-between transition-colors group"
            >
              <div>
                <div className="w-full h-20 bg-[#0b0d13] rounded border border-neutral-800 mb-2 p-1 flex items-center justify-center relative overflow-hidden">
                  <div
                    className="w-full h-full flex items-center justify-center pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: thumb }}
                  />
                  <span className="absolute top-1 left-1 text-[9px] font-mono capitalize px-1.5 py-0.5 rounded bg-neutral-900/90 text-amber-400 border border-neutral-800">
                    {preset.tipo}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {preset.nome}
                  </h4>
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-neutral-600 shrink-0"
                    style={{ backgroundColor: preset.corHex }}
                    title={preset.corNome}
                  />
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                  {preset.descricao}
                </p>
              </div>

              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => criarOrcamentoRapidoComPreset(preset)}
                  className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Usar Modelo</span>
                </button>
                <button
                  type="button"
                  onClick={() => carregarPresetNoSimulador(preset)}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition-colors cursor-pointer"
                  title="Abrir no simulador para customizar"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
