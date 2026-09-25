import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  ChevronDown,
  Info,
  Copy
} from 'lucide-react';
import { useSerralheria } from '../../context/SerralheriaContext';
import { gerarPecaSVG, seedParaGenes } from '../../lib/proceduralSvg';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const PortalClienteTab: React.FC = () => {
  const { ordensServico, notify } = useSerralheria();

  // Selecionar qual O.S. simular a visão do cliente (UX Lei 6: reduzir carga de memória e permitir testes reais)
  const [selectedOSId, setSelectedOSId] = useState<string>(() => {
    return ordensServico[0]?.id || '';
  });

  const selectedOS = ordensServico.find(o => o.id === selectedOSId) || ordensServico[0];

  const handleCopiarLinkWhatsApp = () => {
    if (!selectedOS) return;
    const url = `${window.location.origin}/?rastreio=${selectedOS.numeroOS}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    notify(
      'Link copiado com sucesso!',
      'success',
      `Envie para ${selectedOS.clienteNome} no WhatsApp. Ele não precisa de senha para acompanhar!`
    );
  };

  const handleContatoSuporte = () => {
    if (!selectedOS) return;
    const msg = encodeURIComponent(
      `Olá! Sou o cliente ${selectedOS.clienteNome} e estou acompanhando a produção da minha O.S. #${selectedOS.numeroOS} (${selectedOS.titulo}). Poderiam me passar uma atualização?`
    );
    const link = document.createElement('a');
    link.href = `https://wa.me/?text=${msg}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify('Canal do cliente conectado', 'success', 'WhatsApp direto com a coordenação da fábrica aberto.');
  };

  if (!selectedOS) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-neutral-400">
        Nenhuma Ordem de Serviço cadastrada para visualização do Portal.
      </div>
    );
  }

  const etapas = [
    { id: 'cortando', label: '1. Corte & Esquadro', desc: 'Metalon serrado no grau exato' },
    { id: 'soldando', label: '2. Solda & Montagem', desc: 'Ponteamento e cordão contínuo' },
    { id: 'pintando', label: '3. Pintura Epóxi', desc: 'Cabine a pó e forno de cura 200°C' },
    { id: 'pronto', label: '4. Pronto para Entrega', desc: 'Embalado e pronto para o caminhão' },
  ];

  const indexStatusAtual = etapas.findIndex(e => e.id === selectedOS.status);

  const svgVisualizacao = gerarPecaSVG(
    selectedOS.tipo,
    selectedOS.genes,
    selectedOS.dimensoes,
    selectedOS.corHex
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner Explicativo de Papéis no ERP */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Como funciona o rastreio do cliente no ERP?</h3>
            <p className="text-xs text-neutral-300 mt-0.5 max-w-xl leading-relaxed">
              O cliente <strong>não precisa de login nem senha</strong> no sistema. Quando você manda o orçamento no WhatsApp ou clica em <em>"Copiar Link de Rastreio"</em>, ele abre exatamente esta tela pública no celular dele para ver se o portão já está no corte, na solda ou pronto.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopiarLinkWhatsApp}
          className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 whitespace-nowrap shadow-md cursor-pointer transition-all self-stretch sm:self-auto justify-center active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Copiar Link p/ WhatsApp</span>
        </button>
      </div>

      {/* Seletor de Simulação do Portal (Para o operador testar a visão de cada cliente) */}
      <div className="bg-[#11141c] border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Simulando a tela que este cliente enxerga no celular:</span>
        </div>

        <div className="relative w-full sm:w-72">
          <select
            value={selectedOS.id}
            onChange={(e) => setSelectedOSId(e.target.value)}
            className="w-full bg-[#161a25] border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400 min-h-[44px] cursor-pointer"
          >
            {ordensServico.map(os => (
              <option key={os.id} value={os.id}>
                {os.clienteNome} ({os.numeroOS})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartão Master do Portal do Cliente */}
      <div className="bg-[#141824] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Top Header do Portal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-5 gap-3">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block mb-1">
              Portal do Cliente · Rastreabilidade em Tempo Real
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              {selectedOS.titulo || `${selectedOS.tipo.toUpperCase()} sob medida`}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400 font-mono">
              <span>Cliente: <strong className="text-white">{selectedOS.clienteNome}</strong></span>
              <span className="text-neutral-600">·</span>
              <span>Pedido: <strong className="text-amber-400">{selectedOS.numeroOS}</strong></span>
            </div>
          </div>

          <Badge variant="warning" dot className="self-start sm:self-auto py-1 px-3">
            Fase Atual: {selectedOS.status.toUpperCase()}
          </Badge>
        </div>

        {/* Desenho Técnico da Peça Aprovada */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Renderização Vetorial do Seu Projeto Aprovado:</span>
            <span>{selectedOS.dimensoes.largura} x {selectedOS.dimensoes.altura} cm</span>
          </div>

          <div
            className="w-full h-64 sm:h-72 bg-[#090b10] rounded-2xl border border-neutral-800/90 p-4 flex items-center justify-center overflow-hidden shadow-inner"
            dangerouslySetInnerHTML={{ __html: svgVisualizacao }}
          />

          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-neutral-600"
                style={{ backgroundColor: selectedOS.corHex }}
              />
              Acabamento: <strong className="text-white">{selectedOS.corNome}</strong>
            </span>
            <span>Previsão de Instalação: <strong className="text-amber-400">{selectedOS.dataPrometida}</strong></span>
          </div>
        </div>

        {/* Linha do Tempo da Produção Fabril */}
        <div className="space-y-3 pt-2 border-t border-neutral-800/80">
          <span className="text-xs font-mono text-neutral-400 block font-semibold uppercase tracking-wider">
            Linha de Montagem da Sua Peça na Oficina:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
            {etapas.map((etapa, idx) => {
              const isPassed = indexStatusAtual > idx;
              const isCurrent = indexStatusAtual === idx;

              return (
                <div
                  key={etapa.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isPassed
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      : isCurrent
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-neutral-700" />
                    )}
                  </div>
                  <span className="block font-bold text-xs sm:text-sm">{etapa.label}</span>
                  <span className="text-[10px] block mt-0.5 opacity-80">{etapa.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Garantia & Atendimento Direto */}
        <div className="p-5 bg-[#0d1017] rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-xs font-mono text-neutral-400 text-center sm:text-left">
            <div className="text-white font-semibold flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantia Estrutural ForjaOS de 5 Anos Ativa</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Sua peça conta com cobertura completa contra corrosão, trincas de solda e fixações no seu imóvel.
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={handleContatoSuporte}
            leftIcon={<Send className="w-4 h-4 text-emerald-400" />}
            className="w-full sm:w-auto shrink-0"
          >
            Falar com a Serralheria
          </Button>
        </div>
      </div>
    </div>
  );
};
