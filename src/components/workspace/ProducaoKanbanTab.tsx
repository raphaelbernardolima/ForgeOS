import React, { useState } from 'react';
import {
  CheckSquare,
  ArrowRight,
  Search,
  X,
  FileText,
  Clock,
  Inbox,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useSerralheria } from '../../context/SerralheriaContext';
import { StatusOS } from '../../types';
import { gerarPecaSVG } from '../../lib/proceduralSvg';
import { Button } from '../ui/Button';

export const ProducaoKanbanTab: React.FC = () => {
  const {
    ordensServico,
    avancarStatusOS,
    toggleChecklistOS,
    openReceiptModal,
    notify
  } = useSerralheria();

  const [buscaOS, setBuscaOS] = useState<string>('');
  const [osAbertaChecklist, setOsAbertaChecklist] = useState<string | null>(null);
  const [etapaMobileAtiva, setEtapaMobileAtiva] = useState<'todas' | StatusOS>('todas');

  const colunas = [
    {
      status: 'cortando' as const,
      label: 'Corte de Perfis',
      curtoLabel: 'Corte',
      dotCor: 'bg-amber-400',
      proximaEtapa: 'Avançar p/ Solda →',
      emptyHint: 'Nenhum item aguardando corte'
    },
    {
      status: 'soldando' as const,
      label: 'Solda & Montagem',
      curtoLabel: 'Solda',
      dotCor: 'bg-orange-400',
      proximaEtapa: 'Avançar p/ Pintura →',
      emptyHint: 'Nenhum item em montagem'
    },
    {
      status: 'pintando' as const,
      label: 'Pintura Epóxi',
      curtoLabel: 'Pintura',
      dotCor: 'bg-purple-400',
      proximaEtapa: 'Avançar p/ Pronto →',
      emptyHint: 'Nenhum item na cabine de pintura'
    },
    {
      status: 'pronto' as const,
      label: 'Pronto p/ Entrega',
      curtoLabel: 'Pronto',
      dotCor: 'bg-emerald-400',
      proximaEtapa: 'Marcar Entregue ✓',
      emptyHint: 'Nenhum item pronto no estoque'
    },
  ];

  const ordensFiltradas = ordensServico.filter(os => {
    const termo = buscaOS.toLowerCase().trim();
    if (!termo) return true;
    return (
      os.numeroOS.toLowerCase().includes(termo) ||
      os.clienteNome.toLowerCase().includes(termo) ||
      os.tipo.toLowerCase().includes(termo)
    );
  });

  const handleCopiarLinkRastreio = (numeroOS: string, clienteNome: string) => {
    const url = `${window.location.origin}/?rastreio=${numeroOS}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    notify(
      'Link de rastreio copiado!',
      'success',
      `Envie no WhatsApp de ${clienteNome} para ele acompanhar a peça na oficina.`
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Quadro de Produção da Fábrica
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Acompanhe o que está no corte, na solda e na pintura. Avance as peças com 1 toque.
          </p>
        </div>

        {/* Busca rápida */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por O.S. ou cliente..."
            value={buscaOS}
            onChange={(e) => setBuscaOS(e.target.value)}
            className="w-full bg-[#11141c] border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 min-h-[44px] transition-colors"
          />
          {buscaOS && (
            <button
              onClick={() => setBuscaOS('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Seletor de Etapas para Mobile (Evita rolar 4 colunas gigantes na tela pequena) */}
      <div className="md:hidden flex items-center gap-1 p-1 bg-[#11141c] rounded-xl border border-neutral-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setEtapaMobileAtiva('todas')}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold text-center whitespace-nowrap min-h-[44px] transition-colors ${
            etapaMobileAtiva === 'todas'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Todas ({ordensFiltradas.length})
        </button>
        {colunas.map(col => {
          const qtd = ordensFiltradas.filter(os => os.status === col.status).length;
          const isAtiva = etapaMobileAtiva === col.status;
          return (
            <button
              key={col.status}
              onClick={() => setEtapaMobileAtiva(col.status)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold text-center whitespace-nowrap min-h-[44px] transition-colors flex items-center justify-center gap-1.5 ${
                isAtiva
                  ? 'bg-neutral-800 text-white border border-neutral-700 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${col.dotCor}`} />
              <span>{col.curtoLabel}</span>
              <span className="text-[10px] opacity-75">({qtd})</span>
            </button>
          );
        })}
      </div>

      {/* Grid de Colunas Kanban: Adaptável ao Desktop e Filtrado no Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {colunas
          .filter(col => etapaMobileAtiva === 'todas' || col.status === etapaMobileAtiva)
          .map(col => {
            const itensNaColuna = ordensFiltradas.filter(os => os.status === col.status);

            return (
              <div
                key={col.status}
                className="bg-[#0e1118] border border-neutral-800/80 rounded-xl p-3.5 space-y-3 min-h-[380px] flex flex-col"
              >
                {/* Topo da Coluna */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotCor}`} />
                    <span className="text-xs font-bold text-neutral-200">
                      {col.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-300 font-semibold px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 tabular-nums">
                    {itensNaColuna.length}
                  </span>
                </div>

                {/* Lista de Cards da Etapa */}
                <div className="space-y-3 flex-1">
                  {itensNaColuna.length === 0 ? (
                    <div className="h-32 border border-dashed border-neutral-800/60 rounded-lg flex flex-col items-center justify-center text-center p-3 text-neutral-500 my-auto">
                      <Inbox className="w-5 h-5 text-neutral-600 mb-1" />
                      <p className="text-xs text-neutral-400">{col.emptyHint}</p>
                    </div>
                  ) : (
                    itensNaColuna.map(os => {
                      const svgThumb = gerarPecaSVG(os.tipo, os.genes, os.dimensoes, os.corHex);
                      const concluidoChecklist = os.checklist.filter(c => c.concluido).length;
                      const totalChecklist = os.checklist.length;
                      const percChecklist = Math.round((concluidoChecklist / totalChecklist) * 100);
                      const checklistAberto = osAbertaChecklist === os.id;

                      return (
                        <div
                          key={os.id}
                          className="bg-[#141822] border border-neutral-800 hover:border-neutral-700 rounded-xl p-3.5 space-y-3 transition-colors shadow-sm"
                        >
                          {/* Identificação da OS */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-xs font-mono text-amber-400/90 font-bold">
                                {os.numeroOS}
                              </span>
                              <h4 className="text-sm font-bold text-white truncate mt-0.5">
                                {os.clienteNome}
                              </h4>
                              <p className="text-xs text-neutral-400 capitalize">
                                {os.tipo} · {os.dimensoes.largura}×{os.dimensoes.altura} cm
                              </p>
                            </div>

                            {os.prazoApertado && (
                              <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1 shrink-0 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>{os.dataPrometida}</span>
                              </span>
                            )}
                          </div>

                          {/* Miniatura do Desenho */}
                          <div
                            className="w-full h-20 bg-[#0a0c12] rounded-lg border border-neutral-800 flex items-center justify-center p-1 overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: svgThumb }}
                          />

                          {/* Progresso de Tarefas da Peça */}
                          <div>
                            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                              <button
                                type="button"
                                onClick={() => setOsAbertaChecklist(checklistAberto ? null : os.id)}
                                className="hover:text-white cursor-pointer flex items-center gap-1 font-medium"
                              >
                                <span>Checklist ({concluidoChecklist}/{totalChecklist})</span>
                                <span className="text-[10px] text-neutral-500">
                                  {checklistAberto ? '▲ Fechar' : '▼ Ver'}
                                </span>
                              </button>
                              <span className="font-mono text-neutral-200 font-semibold">{percChecklist}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${percChecklist}%` }}
                              />
                            </div>

                            {/* Checklist Expansível */}
                            {checklistAberto && (
                              <div className="mt-2.5 pt-2 border-t border-neutral-800/80 space-y-1.5 animate-in fade-in">
                                {os.checklist.map(check => (
                                  <button
                                    key={check.id}
                                    type="button"
                                    onClick={() => toggleChecklistOS(os.id, check.id)}
                                    className="w-full flex items-center gap-2.5 text-left py-1.5 px-2 rounded-lg hover:bg-neutral-800/60 text-xs transition-colors cursor-pointer select-none"
                                  >
                                    <div
                                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                        check.concluido
                                          ? 'bg-emerald-500 border-emerald-400 text-neutral-950 font-bold'
                                          : 'border-neutral-700 bg-neutral-900'
                                      }`}
                                    >
                                      {check.concluido && <CheckSquare className="w-3.5 h-3.5" />}
                                    </div>
                                    <span
                                      className={`text-xs truncate ${
                                        check.concluido ? 'line-through text-neutral-500' : 'text-neutral-200'
                                      }`}
                                    >
                                      {check.descricao}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Ações da OS: Botão Grande com Nome Claro da Próxima Etapa */}
                          <div className="pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openReceiptModal(os, 'os')}
                                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1 cursor-pointer min-h-[44px]"
                                title="Ficha de produção / corte"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-xs">Ficha</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopiarLinkRastreio(os.numeroOS, os.clienteNome)}
                                className="p-2 text-neutral-400 hover:text-emerald-400 rounded-lg hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1 cursor-pointer min-h-[44px]"
                                title="Copiar link de rastreio para o cliente"
                              >
                                <Send className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs hidden sm:inline">Rastreio</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => avancarStatusOS(os.id)}
                              className="min-h-[44px] px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ml-auto"
                            >
                              <span>{col.proximaEtapa}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
