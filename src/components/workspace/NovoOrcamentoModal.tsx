import React, { useState } from 'react';
import {
  X,
  Send,
  Check,
  Sparkles,
  Sliders,
  DollarSign,
  User,
  Phone,
  Ruler,
  Palette,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Wrench,
  Scale,
  Clock,
  Flame,
  Building2,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';
import { TipoPeca, GenesPeca, DimensoesPeca, OrçamentoItem, FamiliaPadrao, EstiloMoldura } from '../../types';
import { gerarPecaSVG, calcularMetricas, CORES_PINTURA } from '../../lib/proceduralSvg';
import { useSerralheria } from '../../context/SerralheriaContext';
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
  const { modoSimplificado, setModoSimplificado } = useSerralheria();

  if (!isOpen) return null;

  // 1. Tipo de Peça
  const [tipo, setTipo] = useState<TipoPeca>('portao');

  // 2. Modelo / Estilo visual das barras
  const [estiloVisual, setEstiloVisual] = useState<'reto' | 'moderno' | 'gradeado' | 'ondulado'>('reto');

  // 3. Medidas em centímetros
  const [largura, setLargura] = useState<number>(300);
  const [altura, setAltura] = useState<number>(220);

  // 4. Cor e acabamento
  const [corIndex, setCorIndex] = useState<number>(0);
  const corSelecionada = CORES_PINTURA[corIndex] || CORES_PINTURA[0];

  // 5. Dados do Cliente
  const [clienteNome, setClienteNome] = useState<string>('');
  const [clienteTelefone, setClienteTelefone] = useState<string>('');
  const [enderecoObra, setEnderecoObra] = useState<string>('');
  const [validadeDias, setValidadeDias] = useState<number>(15);

  // 6. Preço customizado / editável
  const [valorCustomizado, setValorCustomizado] = useState<string>('');

  // 7. Controle de exibição das Configurações Avançadas
  // Por padrão no Modo Simplificado, começa recolhido (fechado)
  const [mostrarConfigAvancadas, setMostrarConfigAvancadas] = useState<boolean>(!modoSimplificado);

  // Parâmetros avançados específicos
  const [espacamentoBarras, setEspacamentoBarras] = useState<number>(12);
  const [espessuraPerfil, setEspessuraPerfil] = useState<number>(3.0);
  const [anguloBarras, setAnguloBarras] = useState<number>(0);
  const [temMoldura, setTemMoldura] = useState<boolean>(true);
  const [estiloMoldura, setEstiloMoldura] = useState<EstiloMoldura>('tubular');

  // Genes gerados (combinando opções simples e avançadas)
  const familiaCalculada: FamiliaPadrao =
    estiloVisual === 'reto'
      ? 'reto'
      : estiloVisual === 'gradeado'
      ? 'geometrico'
      : estiloVisual === 'ondulado'
      ? 'ondulado'
      : 'cruzado';

  const genes: GenesPeca = {
    familia: familiaCalculada,
    espacamento: mostrarConfigAvancadas ? espacamentoBarras : estiloVisual === 'reto' ? 12 : estiloVisual === 'gradeado' ? 15 : 18,
    espessura: mostrarConfigAvancadas ? espessuraPerfil : 3.0,
    angulo: mostrarConfigAvancadas ? anguloBarras : estiloVisual === 'reto' ? 0 : estiloVisual === 'gradeado' ? 0 : 45,
    amplitude: estiloVisual === 'ondulado' ? 12 : 0,
    frequencia: 1,
    assimetria: 0,
    temMoldura,
    estiloMoldura
  };

  const dimensoes: DimensoesPeca = { largura, altura };
  const metricas = calcularMetricas(tipo, genes, dimensoes);
  const precoSugerido = metricas.precoVendaSugerido;
  const valorFinal = valorCustomizado !== '' ? parseFloat(valorCustomizado) || 0 : precoSugerido;

  // Miniatura SVG em tempo real
  const svgPreview = gerarPecaSVG(tipo, genes, dimensoes, corSelecionada.hex);

  // Medidas padrão comuns na rotina de serralheria brasileira (1 toque)
  const medidasRapidas: Record<TipoPeca, { l: number; a: number; label: string; desc: string }[]> = {
    portao: [
      { l: 250, a: 220, label: '2,50 × 2,20m', desc: 'Padrão 1 Carro' },
      { l: 300, a: 220, label: '3,00 × 2,20m', desc: 'Padrão 2 Carros' },
      { l: 350, a: 240, label: '3,50 × 2,40m', desc: 'Vão Grande / Camionete' }
    ],
    grade: [
      { l: 120, a: 120, label: '1,20 × 1,20m', desc: 'Janela Quarto' },
      { l: 150, a: 120, label: '1,50 × 1,20m', desc: 'Janela Sala' },
      { l: 200, a: 150, label: '2,00 × 1,50m', desc: 'Muro / Fachada' }
    ],
    'guarda-corpo': [
      { l: 200, a: 110, label: '2,00 × 1,10m', desc: 'Sacada Pequena' },
      { l: 300, a: 110, label: '3,00 × 1,10m', desc: 'Sacada Padrão' },
      { l: 400, a: 110, label: '4,00 × 1,10m', desc: 'Varanda Ampla' }
    ],
    corrimao: [
      { l: 200, a: 95, label: '2,00 × 0,95m', desc: '1 Lance de Escada' },
      { l: 300, a: 95, label: '3,00 × 0,95m', desc: 'Escada Padrão' },
      { l: 400, a: 95, label: '4,00 × 0,95m', desc: 'Rampa / Escada Longa' }
    ]
  };

  const handleMudarTipo = (novoTipo: TipoPeca) => {
    setTipo(novoTipo);
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

  const handleAjustarMedida = (dim: 'largura' | 'altura', delta: number) => {
    if (dim === 'largura') {
      setLargura(prev => Math.max(50, Math.min(1200, prev + delta)));
    } else {
      const minAlt = tipo === 'guarda-corpo' ? 110 : 30;
      setAltura(prev => Math.max(minAlt, Math.min(600, prev + delta)));
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
      endereco: enderecoObra.trim() || 'Rua do Cliente - Obra Local',
      tipo,
      descricao: `${tipo.toUpperCase()} sob medida ${(largura / 100).toFixed(2)}x${(altura / 100).toFixed(2)}m com acabamento ${corSelecionada.nome}`,
      dimensoes,
      genes,
      corHex: corSelecionada.hex,
      corNome: corSelecionada.nome,
      valor: valorFinal,
      custoPrevisto: metricas.custoTotalProducao,
      dataCriacao: new Date().toISOString().split('T')[0],
      validadeDias: validadeDias || 15,
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
        className="bg-[#12151f] border-t md:border border-neutral-700/80 rounded-t-3xl md:rounded-2xl max-w-2xl w-full mx-auto shadow-2xl flex flex-col max-h-[94vh] md:max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Topo Limpo com Seletor de Modo Simplificado vs Avançado */}
        <div className="px-4 py-3 border-b border-neutral-800 bg-[#0d1017] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                {modoSimplificado ? <Zap className="w-4 h-4 text-amber-400" /> : <Sliders className="w-4 h-4 text-amber-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white leading-tight">
                    {modoSimplificado ? 'Novo Orçamento Rápido' : 'Novo Orçamento Técnico (CAD)'}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                    {modoSimplificado ? '⚡ Simplificado' : '📐 Completo'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {modoSimplificado
                    ? 'Preencha o essencial e envie no WhatsApp em segundos'
                    : 'Configurações milimétricas, nós estruturais e engenharia'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Botão de Troca Rápida de Modo */}
              <button
                type="button"
                onClick={() => setModoSimplificado(prev => !prev)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-neutral-700 text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Alternar entre Interface Simplificada e Interface Técnica"
              >
                <span>{modoSimplificado ? 'Ver Modo Técnico' : 'Usar Modo Simplificado'}</span>
              </button>

              <button
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Banner Explicativo Aconchegante no Modo Simplificado */}
        {modoSimplificado && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><strong>Interface Simplificada:</strong> Apenas o que importa para fechar a venda com o cliente.</span>
            </span>
            <button
              type="button"
              onClick={() => setMostrarConfigAvancadas(prev => !prev)}
              className="text-[11px] font-bold underline hover:text-amber-200 cursor-pointer shrink-0 ml-2"
            >
              {mostrarConfigAvancadas ? 'Ocultar Avançados' : 'Configurações Técnicas'}
            </button>
          </div>
        )}

        {/* Corpo do Formulário com Scroll Suave */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. Miniatura Visual e Resumo de Preço */}
          <div className="bg-[#0b0d13] border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3.5">
            <div
              className="w-20 h-18 bg-[#06080c] rounded-lg border border-neutral-800 flex items-center justify-center p-1 shrink-0 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: svgPreview }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-mono uppercase text-amber-400 font-bold block truncate">
                {tipo.toUpperCase()} · {(largura / 100).toFixed(2)}m × {(altura / 100).toFixed(2)}m
              </span>
              <div className="text-xs text-neutral-400 mt-0.5 truncate">
                {metricas.pesoEstimadoKg} kg aço · {metricas.metrosLinearTotal}m de perfis
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[10px] text-neutral-400 font-mono">Preço Sugerido:</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">
                  R$ {precoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">(Custo: R$ {metricas.custoTotalProducao.toFixed(0)})</span>
              </div>
            </div>
          </div>

          {/* 2. Seleção Clara do Tipo de Peça */}
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
                    className={`min-h-[46px] py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
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

          {/* 3. Tamanho da Peça com Atalhos Rápidos da Vida Real */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                2. Tamanho da Peça (Largura × Altura)
              </label>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {(largura / 100).toFixed(2)}m × {(altura / 100).toFixed(2)}m ({largura}×{altura} cm)
              </span>
            </div>

            {/* Atalhos Rápidos com Descrição da Obra */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              {medidasRapidas[tipo]?.map(m => {
                const isSelected = largura === m.l && altura === m.a;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => {
                      setLargura(m.l);
                      setAltura(m.a);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-xs'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">{m.label}</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">{m.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Ajuste Rápido de Metros com Botões Mais/Menos (Ótimo para Mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-400 font-mono">Largura:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAjustarMedida('largura', -10)}
                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-18 text-center text-xs font-mono font-bold text-white tabular-nums">
                    {(largura / 100).toFixed(2)}m
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAjustarMedida('largura', 10)}
                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-400 font-mono">Altura:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAjustarMedida('altura', -10)}
                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-18 text-center text-xs font-mono font-bold text-white tabular-nums">
                    {(altura / 100).toFixed(2)}m
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAjustarMedida('altura', 10)}
                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Cor do Acabamento (Direto e Fácil de Entender) */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-semibold">
              3. Cor da Pintura ({corSelecionada.nome})
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
                        ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400 shadow-sm'
                        : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-neutral-600 shadow-xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-neutral-300 truncate w-full text-center font-medium">
                      {c.nome.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Dados do Cliente */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
              4. Dados do Cliente (para envio da proposta no WhatsApp)
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
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
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

          {/* 6. Preço Final Proposto */}
          <div className="p-3.5 bg-gradient-to-r from-neutral-900 to-[#151924] border border-neutral-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block font-semibold">
                5. Valor Proposto para o Cliente
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Sugerido: R$ {precoSugerido.toFixed(2)} (ajuste se quiser arredondar ou somar frete)
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

          {/* BOTÃO PRINCIPAL DE CONFIGURAÇÕES AVANÇADAS */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setMostrarConfigAvancadas(prev => !prev)}
              className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                mostrarConfigAvancadas
                  ? 'bg-neutral-800/80 border-amber-500/60 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold block">
                    {mostrarConfigAvancadas ? 'Configurações Avançadas (Abertas)' : 'Configurações Avançadas'}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    {mostrarConfigAvancadas
                      ? 'Clique para recolher e simplificar a tela'
                      : 'Espaçamento milimétrico, moldura perimetral, consumo de solda e CAD'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                  {mostrarConfigAvancadas ? 'Recolher' : 'Expandir'}
                </span>
                {mostrarConfigAvancadas ? (
                  <ChevronUp className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </div>
            </button>

            {/* CONTEÚDO AVANÇADO (EXPANSÍVEL) */}
            {mostrarConfigAvancadas && (
              <div className="mt-3 p-4 bg-[#0a0c12] border border-neutral-800 rounded-2xl space-y-4 animate-in fade-in duration-200">
                
                {/* Cabeçalho do Bloco Avançado */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Ajustes Técnicos de Engenharia</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Modo Especialista</span>
                </div>

                {/* Modelo de Barras Avançado */}
                <div>
                  <label className="text-xs font-mono uppercase text-neutral-400 block mb-1.5 font-semibold">
                    Desenho Geométrico das Barras
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'reto', label: 'Barras Retas' },
                      { id: 'moderno', label: 'Cruzado / X' },
                      { id: 'gradeado', label: 'Gradeado / Quadros' },
                      { id: 'ondulado', label: 'Ondulado / Curvas' }
                    ].map(est => (
                      <button
                        key={est.id}
                        type="button"
                        onClick={() => setEstiloVisual(est.id as any)}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium transition-all text-center cursor-pointer min-h-[38px] ${
                          estiloVisual === est.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {est.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inputs Milimétricos Diretos em Centímetros */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-mono">Largura Exata (cm)</label>
                    <input
                      type="number"
                      min={30}
                      max={1200}
                      step={1}
                      value={largura}
                      onChange={e => setLargura(Math.max(20, parseInt(e.target.value) || 100))}
                      className="w-full min-h-[42px] bg-neutral-900 border border-neutral-700 rounded-xl px-3 text-sm text-white font-mono font-bold focus:border-amber-400 focus:outline-none tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1 font-mono">Altura Exata (cm)</label>
                    <input
                      type="number"
                      min={tipo === 'guarda-corpo' ? 110 : 30}
                      max={600}
                      step={1}
                      value={altura}
                      onChange={e => setAltura(Math.max(30, parseInt(e.target.value) || 100))}
                      className="w-full min-h-[42px] bg-neutral-900 border border-neutral-700 rounded-xl px-3 text-sm text-white font-mono font-bold focus:border-amber-400 focus:outline-none tabular-nums"
                    />
                  </div>
                </div>

                {/* Sliders Técnicos: Espaçamento e Espessura */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-1">
                      <span>Espaçamento entre barras:</span>
                      <span className="text-amber-400 font-bold">{espacamentoBarras} cm</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={25}
                      step={0.5}
                      value={espacamentoBarras}
                      onChange={e => setEspacamentoBarras(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-6"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-1">
                      <span>Espessura da barra/tubo:</span>
                      <span className="text-amber-400 font-bold">{espessuraPerfil} cm</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={0.2}
                      value={espessuraPerfil}
                      onChange={e => setEspessuraPerfil(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-6"
                    />
                  </div>
                </div>

                {/* Requadro e Moldura Estrutural */}
                <div className="pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-300 font-medium">Requadro / Moldura Perimetral</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={temMoldura}
                        onChange={e => setTemMoldura(e.target.checked)}
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-neutral-400">Incluir Requadro</span>
                    </label>
                  </div>

                  {temMoldura && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(['tubular', 'cantoneira', 'industrial', 'minimalista'] as EstiloMoldura[]).map(est => (
                        <button
                          key={est}
                          type="button"
                          onClick={() => setEstiloMoldura(est)}
                          className={`text-xs py-1.5 px-2 rounded-lg border font-mono capitalize cursor-pointer ${
                            estiloMoldura === est
                              ? 'bg-neutral-800 border-amber-400 text-amber-300 font-bold'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {est}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Raio-X Detalhado de Engenharia e Consumo da Oficina */}
                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-[11px] font-mono uppercase text-neutral-400 block mb-2 font-semibold">
                    Consumo Previsto de Insumos & Oficina
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 bg-neutral-900/90 rounded-lg border border-neutral-800">
                      <div className="flex items-center gap-1 text-neutral-400 text-[10px] font-mono">
                        <Scale className="w-3 h-3 text-neutral-400" />
                        <span>Peso Aço</span>
                      </div>
                      <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                        {metricas.pesoEstimadoKg} kg
                      </span>
                    </div>

                    <div className="p-2.5 bg-neutral-900/90 rounded-lg border border-neutral-800">
                      <div className="flex items-center gap-1 text-neutral-400 text-[10px] font-mono">
                        <Ruler className="w-3 h-3 text-neutral-400" />
                        <span>Metragem</span>
                      </div>
                      <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                        {metricas.metrosLinearTotal}m
                      </span>
                    </div>

                    <div className="p-2.5 bg-neutral-900/90 rounded-lg border border-neutral-800">
                      <div className="flex items-center gap-1 text-neutral-400 text-[10px] font-mono">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Solda</span>
                      </div>
                      <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">
                        {metricas.cordaoSoldaCm} cm
                      </span>
                    </div>

                    <div className="p-2.5 bg-neutral-900/90 rounded-lg border border-neutral-800">
                      <div className="flex items-center gap-1 text-neutral-400 text-[10px] font-mono">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>Horas Oficina</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                        {metricas.tempoProducaoHoras} h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Endereço e Validade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Endereço da Obra</label>
                    <input
                      type="text"
                      placeholder="Ex: Rua das Flores, 120 - Centro"
                      value={enderecoObra}
                      onChange={e => setEnderecoObra(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Validade da Proposta</label>
                    <select
                      value={validadeDias}
                      onChange={e => setValidadeDias(parseInt(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value={7}>7 dias corridos</option>
                      <option value={15}>15 dias corridos (Padrão)</option>
                      <option value={30}>30 dias corridos</option>
                    </select>
                  </div>
                </div>

                {/* Atalho para Abrir no Simulador CAD Paramétrico */}
                {onAbrirNoCad && (
                  <div className="pt-2 text-center border-t border-neutral-800/80">
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
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer py-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Abrir no Simulador CAD 2D completo para nós e ângulos finos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Fixo com Botões Grandes (Ergonomia do Polegar) */}
        <div className="p-4 border-t border-neutral-800 bg-[#0d1017] flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSalvar(true)}
            className="w-full sm:flex-1 min-h-[48px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Criar e Mandar no WhatsApp</span>
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
