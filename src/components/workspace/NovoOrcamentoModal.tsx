import React, { useState } from 'react';
import {
  X,
  Send,
  Check,
  Sparkles,
  Maximize2,
  Sliders,
  DollarSign,
  User,
  Phone,
  Ruler,
  Palette,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TipoPeca, GenesPeca, DimensoesPeca, OrçamentoItem } from '../../types';
import { gerarPecaSVG, calcularMetricas, CORES_PINTURA } from '../../lib/proceduralSvg';
import { Button } from '../ui/Button';

interface NovoOrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (novoOrcamento: OrçamentoItem, enviarZap?: boolean) => void;
  onAbrirNoCad?: (config: {
    tipo: TipoPeca;
    dimensoes: DimensoesPeca;
    genes: GenesPeca;
    corHex: string;
    corNome: string;
    clienteNome?: string;
  }) => void;
}

export const NovoOrcamentoModal: React.FC<NovoOrcamentoModalProps> = ({
  isOpen,
  onClose,
  onSalvar,
  onAbrirNoCad
}) => {
  if (!isOpen) return null;

  // 1. Tipo de Peça
  const [tipo, setTipo] = useState<TipoPeca>('portao');

  // 2. Modelo / Estilo simplificado para o serralheiro
  const [estiloVisual, setEstiloVisual] = useState<'reto' | 'moderno' | 'gradeado'>('reto');

  // 3. Medidas em centímetros
  const [largura, setLargura] = useState<number>(300);
  const [altura, setAltura] = useState<number>(220);

  // 4. Cor e acabamento
  const [corIndex, setCorIndex] = useState<number>(0);
  const corSelecionada = CORES_PINTURA[corIndex] || CORES_PINTURA[0];

  // 5. Dados do Cliente
  const [clienteNome, setClienteNome] = useState<string>('');
  const [clienteTelefone, setClienteTelefone] = useState<string>('');

  // 6. Preço customizado / editável
  const [valorCustomizado, setValorCustomizado] = useState<string>('');

  // Genes derivados do estilo simplificado
  const genes: GenesPeca = {
    familia: estiloVisual === 'reto' ? 'reto' : estiloVisual === 'gradeado' ? 'geometrico' : 'cruzado',
    espacamento: estiloVisual === 'reto' ? 12 : estiloVisual === 'gradeado' ? 15 : 18,
    espessura: 3.0,
    angulo: estiloVisual === 'reto' ? 0 : estiloVisual === 'gradeado' ? 0 : 45,
    amplitude: 0,
    frequencia: 1,
    assimetria: 0,
    temMoldura: true,
    estiloMoldura: 'tubular'
  };

  const dimensoes: DimensoesPeca = { largura, altura };
  const metricas = calcularMetricas(tipo, genes, dimensoes);
  const precoSugerido = metricas.precoVendaSugerido;
  const valorFinal = valorCustomizado !== '' ? parseFloat(valorCustomizado) || 0 : precoSugerido;

  // Miniatura SVG em tempo real
  const svgPreview = gerarPecaSVG(tipo, genes, dimensoes, corSelecionada.hex);

  // Botões de medidas padrão rápidas para facilitar no celular com 1 toque
  const medidasRapidas: Record<TipoPeca, { l: number; a: number; label: string }[]> = {
    portao: [
      { l: 250, a: 220, label: '2,50 × 2,20m (Padrão)' },
      { l: 300, a: 220, label: '3,00 × 2,20m (2 Carros)' },
      { l: 350, a: 240, label: '3,50 × 2,40m (Grande)' }
    ],
    grade: [
      { l: 120, a: 120, label: '1,20 × 1,20m (Janela)' },
      { l: 150, a: 120, label: '1,50 × 1,20m (Janela)' },
      { l: 200, a: 150, label: '2,00 × 1,50m (Muro)' }
    ],
    'guarda-corpo': [
      { l: 200, a: 110, label: '2,00 × 1,10m' },
      { l: 300, a: 110, label: '3,00 × 1,10m' },
      { l: 400, a: 110, label: '4,00 × 1,10m' }
    ],
    corrimao: [
      { l: 200, a: 95, label: '2,00 × 0,95m' },
      { l: 300, a: 95, label: '3,00 × 0,95m' },
      { l: 400, a: 95, label: '4,00 × 0,95m' }
    ]
  };

  const handleMudarTipo = (novoTipo: TipoPeca) => {
    setTipo(novoTipo);
    // Ajustar dimensões sugeridas para a peça
    if (novoTipo === 'portao') {
      setLargura(300);
      setAltura(220);
    } else if (novoTipo === 'grade') {
      setLargura(150);
      setAltura(120);
    } else if (novoTipo === 'guarda-corpo') {
      setLargura(300);
      setAltura(110);
    } else if (novoTipo === 'corrimao') {
      setLargura(300);
      setAltura(95);
    }
  };

  const handleSalvar = (enviarZap = false) => {
    const nome = clienteNome.trim() || 'Cliente sem Nome';
    const tel = clienteTelefone.trim() || '(11) 98765-4321';

    const novoOrc: OrçamentoItem = {
      id: `orc-${Date.now().toString().slice(-4)}`,
      clienteNome: nome,
      clienteTelefone: tel,
      clienteEmail: 'cliente@contato.com.br',
      endereco: 'Rua do Cliente - Obra Local',
      tipo,
      descricao: `${tipo.toUpperCase()} sob medida ${(largura / 100).toFixed(2)}x${(altura / 100).toFixed(2)}m com acabamento ${corSelecionada.nome}`,
      dimensoes,
      genes,
      corHex: corSelecionada.hex,
      corNome: corSelecionada.nome,
      valor: valorFinal,
      custoPrevisto: metricas.custoTotalProducao,
      dataCriacao: new Date().toISOString().split('T')[0],
      validadeDias: 15,
      status: 'pendente',
      diasSemResposta: 0
    };

    onSalvar(novoOrc, enviarZap);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end md:justify-center p-0 md:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12151f] border-t md:border border-neutral-700/80 rounded-t-3xl md:rounded-2xl max-w-2xl w-full mx-auto shadow-2xl flex flex-col max-h-[92vh] md:max-h-[88vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Topo Limpo e Aderente ao Polegar */}
        <div className="px-4 py-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-[#0d1017]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Novo Orçamento Rápido
              </h3>
              <p className="text-[11px] text-neutral-400">
                Preencha as medidas e o cliente para gerar a proposta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário com Scroll Suave */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. Miniatura Visual e Resumo de Preço */}
          <div className="bg-[#0b0d13] border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3.5">
            <div
              className="w-20 h-18 bg-[#06080c] rounded-lg border border-neutral-800 flex items-center justify-center p-1 shrink-0 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: svgPreview }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-mono uppercase text-amber-400 font-semibold block truncate">
                {tipo.toUpperCase()} · {(largura / 100).toFixed(2)}m × {(altura / 100).toFixed(2)}m
              </span>
              <div className="text-xs text-neutral-400 mt-0.5 truncate">
                {metricas.pesoEstimadoKg} kg aço · {metricas.metrosLinearTotal}m perfis
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[10px] text-neutral-500 font-mono">Sugestão:</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">
                  R$ {precoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">(Custo: R$ {metricas.custoTotalProducao.toFixed(0)})</span>
              </div>
            </div>
          </div>

          {/* 2. Seleção de Tipo de Peça */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-semibold">
              1. O que você vai fabricar?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'portao' as TipoPeca, label: 'Portão' },
                { id: 'grade' as TipoPeca, label: 'Grade' },
                { id: 'guarda-corpo' as TipoPeca, label: 'Guarda-corpo' },
                { id: 'corrimao' as TipoPeca, label: 'Corrimão' }
              ].map(item => {
                const ativo = tipo === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMudarTipo(item.id)}
                    className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      ativo
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Estilo / Modelo Simples */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-semibold">
              2. Modelo / Desenho das Barras
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'reto', label: 'Barras Retas' },
                { id: 'moderno', label: 'Cruzado / X' },
                { id: 'gradeado', label: 'Gradeado / Quadros' }
              ].map(est => (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => setEstiloVisual(est.id as any)}
                  className={`min-h-[44px] py-2 px-2.5 rounded-xl border text-[11px] font-medium transition-all text-center flex items-center justify-center cursor-pointer ${
                    estiloVisual === est.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {est.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Dimensões e Atalhos Rápidos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                3. Medidas da Peça (em metros ou cm)
              </label>
              <span className="text-[11px] font-mono text-amber-400/90">
                {(largura / 100).toFixed(2)}m × {(altura / 100).toFixed(2)}m
              </span>
            </div>

            {/* Atalhos Rápidos de 1 Toque */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 scrollbar-none">
              {medidasRapidas[tipo]?.map(m => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => {
                    setLargura(m.l);
                    setAltura(m.a);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap border transition-colors cursor-pointer ${
                    largura === m.l && altura === m.a
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Inputs Diretos de Largura e Altura */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1 font-mono">Largura (cm)</span>
                <input
                  type="number"
                  min={30}
                  max={1200}
                  step={5}
                  value={largura}
                  onChange={e => setLargura(Math.max(20, parseInt(e.target.value) || 100))}
                  className="w-full min-h-[44px] bg-neutral-900 border border-neutral-700 rounded-xl px-3 text-sm text-white font-mono font-bold focus:border-amber-400 focus:outline-none tabular-nums"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1 font-mono">Altura (cm)</span>
                <input
                  type="number"
                  min={tipo === 'guarda-corpo' ? 110 : 30}
                  max={600}
                  step={5}
                  value={altura}
                  onChange={e => setAltura(Math.max(30, parseInt(e.target.value) || 100))}
                  className="w-full min-h-[44px] bg-neutral-900 border border-neutral-700 rounded-xl px-3 text-sm text-white font-mono font-bold focus:border-amber-400 focus:outline-none tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* 5. Cores Principais */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-semibold">
              4. Cor do Acabamento ({corSelecionada.nome})
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CORES_PINTURA.map((c, idx) => {
                const selecionada = corIndex === idx;
                return (
                  <button
                    key={c.nome}
                    type="button"
                    onClick={() => setCorIndex(idx)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selecionada
                        ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400'
                        : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-neutral-600 shadow-xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-neutral-300 truncate w-full text-center">
                      {c.nome.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Dados do Cliente */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
              5. Dados do Cliente (para envio no WhatsApp)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">Nome do Cliente</span>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Ex: Seu Carlos Roberto"
                    value={clienteNome}
                    onChange={e => setClienteNome(e.target.value)}
                    className="w-full min-h-[44px] bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">Telefone / WhatsApp</span>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="tel"
                    placeholder="Ex: (11) 98765-4321"
                    value={clienteTelefone}
                    onChange={e => setClienteTelefone(e.target.value)}
                    className="w-full min-h-[44px] bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 7. Valor Final Proposto (Editável) */}
          <div className="p-3.5 bg-gradient-to-r from-neutral-900 to-[#151924] border border-neutral-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                Valor Final da Proposta (R$)
              </span>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Sugerido: R$ {precoSugerido.toFixed(2)} (ajuste se quiser arredondar ou cobrar instalação)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">R$</span>
              <input
                type="number"
                step={10}
                value={valorCustomizado !== '' ? valorCustomizado : precoSugerido}
                onChange={e => setValorCustomizado(e.target.value)}
                className="w-36 min-h-[44px] bg-[#0c0e14] border border-neutral-600 rounded-xl px-3 text-lg font-mono font-bold text-amber-400 focus:border-amber-400 focus:outline-none tabular-nums text-right"
              />
            </div>
          </div>

          {/* Atalho Opcional para o Simulador CAD */}
          {onAbrirNoCad && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  onAbrirNoCad({
                    tipo,
                    dimensoes,
                    genes,
                    corHex: corSelecionada.hex,
                    corNome: corSelecionada.nome,
                    clienteNome: clienteNome.trim() || undefined
                  });
                  onClose();
                }}
                className="text-xs text-neutral-400 hover:text-amber-400 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Precisa de desenho avançado com ângulos e nós? Abrir no CAD 2D</span>
              </button>
            </div>
          )}
        </div>

        {/* Rodapé Fixo com Botões Grandes (Ergonomia do Polegar) */}
        <div className="p-4 border-t border-neutral-800 bg-[#0d1017] flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSalvar(true)}
            className="w-full sm:flex-1 min-h-[48px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Criar e Mandar no Zap</span>
          </button>

          <Button
            type="button"
            variant="primary"
            onClick={() => handleSalvar(false)}
            className="w-full sm:w-auto min-h-[48px] px-5 font-bold"
          >
            Salvar Orçamento
          </Button>
        </div>
      </div>
    </div>
  );
};
