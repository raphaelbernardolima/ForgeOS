import React, { useState, useId } from 'react';
import { TipoPeca, GenesPeca, DimensoesPeca, FamiliaPadrao, EstiloMoldura, PresetEstilo } from '../types';
import { seedParaGenes, calcularMetricas, CORES_PINTURA, gerarPecaSVG } from '../lib/proceduralSvg';
import { INITIAL_PRESETS } from '../lib/mockData';
import { ProceduralPreview } from './ProceduralPreview';
import {
  Dices,
  Sparkles,
  Sliders,
  ShieldCheck,
  ArrowRight,
  Layers,
  FileText,
  Bookmark,
  BookmarkCheck,
  Star,
  Trash2,
  Check,
  X,
  Tag,
  Plus,
  Palette,
  Eye,
  Ruler
} from 'lucide-react';

interface SimulatorSectionProps {
  initialConfig?: {
    tipo: TipoPeca;
    genes: GenesPeca;
    dimensoes: DimensoesPeca;
    corHex: string;
    corNome: string;
    orcamentoId?: string;
    clienteNome?: string;
    presetAtivoId?: string;
  } | null;
  onCriarOrcamento?: (dados: {
    tipo: TipoPeca;
    genes: GenesPeca;
    dimensoes: DimensoesPeca;
    corHex: string;
    corNome: string;
    valor: number;
    custoPrevisto: number;
    orcamentoId?: string;
  }) => void;
  onCancelarEdicao?: () => void;
  presetsCustom?: PresetEstilo[];
  onSalvarPreset?: (novoPreset: PresetEstilo) => void;
  onExcluirPreset?: (id: string) => void;
}

export const SimulatorSection: React.FC<SimulatorSectionProps> = ({
  initialConfig,
  onCriarOrcamento,
  onCancelarEdicao,
  presetsCustom,
  onSalvarPreset,
  onExcluirPreset
}) => {
  const [tipo, setTipo] = useState<TipoPeca>(() => initialConfig?.tipo || 'portao');
  const [seed, setSeed] = useState<number>(4820);
  const [genes, setGenes] = useState<GenesPeca>(() => initialConfig?.genes || seedParaGenes(4820, 'portao'));
  const [dimensoes, setDimensoes] = useState<DimensoesPeca>(() => initialConfig?.dimensoes || { largura: 300, altura: 220 });
  const [corIndex, setCorIndex] = useState<number>(() => {
    if (initialConfig?.corHex) {
      const idx = CORES_PINTURA.findIndex(c => c.hex.toLowerCase() === initialConfig.corHex.toLowerCase());
      if (idx !== -1) return idx;
    }
    return 0;
  });
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  // Estado dos Presets de Estilo
  const [presets, setPresets] = useState<PresetEstilo[]>(() => presetsCustom || INITIAL_PRESETS);
  const [modalSalvarEstiloOpen, setModalSalvarEstiloOpen] = useState<boolean>(false);
  const [nomeNovoEstilo, setNomeNovoEstilo] = useState<string>('');
  const [descricaoNovoEstilo, setDescricaoNovoEstilo] = useState<string>('');
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>([]);
  const [feedbackPresetSalvo, setFeedbackPresetSalvo] = useState<string | null>(null);
  const [presetAtivoId, setPresetAtivoId] = useState<string | null>(() => initialConfig?.presetAtivoId || null);
  const [filtroTipoPreset, setFiltroTipoPreset] = useState<'todos' | TipoPeca | 'custom'>('todos');
  const [mostrarPresets, setMostrarPresets] = useState<boolean>(false);
  const [abaMobileSimulador, setAbaMobileSimulador] = useState<'visual' | 'medidas' | 'avancado'>('visual');

  const TAGS_SUGERIDAS = [
    'Minimalista',
    'Industrial',
    'Residencial',
    'Alto Padrão',
    'Econômico',
    'Aço Corten',
    'NBR 14718',
    'Fachada Nobre'
  ];

  // Sincronizar presets se fornecido por props
  React.useEffect(() => {
    if (presetsCustom) {
      setPresets(presetsCustom);
    }
  }, [presetsCustom]);

  // Sincronizar quando initialConfig mudar (ex: ao carregar de volta do AppWorkspace)
  React.useEffect(() => {
    if (initialConfig) {
      setTipo(initialConfig.tipo);
      setGenes(initialConfig.genes);
      setDimensoes(initialConfig.dimensoes);
      if (initialConfig.corHex) {
        const idx = CORES_PINTURA.findIndex(c => c.hex.toLowerCase() === initialConfig.corHex.toLowerCase());
        if (idx !== -1) setCorIndex(idx);
      }
      setPresetAtivoId(initialConfig.presetAtivoId || null);
    }
  }, [initialConfig]);

  // Generate unique IDs for form controls
  const larguraId = useId();
  const alturaId = useId();
  const espacamentoId = useId();
  const espessuraId = useId();
  const anguloId = useId();
  const assimetriaId = useId();
  const amplitudeId = useId();
  const frequenciaId = useId();
  const inclinacaoId = useId();
  const seedInputId = useId();

  const corSelecionada = CORES_PINTURA[corIndex];
  const metricas = calcularMetricas(tipo, genes, dimensoes);

  // Altera o tipo e regenera genes coerentes
  const handleTipoChange = (novoTipo: TipoPeca) => {
    setTipo(novoTipo);
    // Dimensões recomendadas por tipo
    let novaLargura = dimensoes.largura;
    let novaAltura = dimensoes.altura;

    if (novoTipo === 'corrimao') {
      novaLargura = 350;
      novaAltura = 95;
    } else if (novoTipo === 'guarda-corpo') {
      novaLargura = 400;
      novaAltura = 110; // NBR 14718
    } else if (novoTipo === 'grade') {
      novaLargura = 200;
      novaAltura = 150;
    } else if (novoTipo === 'portao') {
      novaLargura = 320;
      novaAltura = 230;
    }

    setDimensoes({ largura: novaLargura, altura: novaAltura });
    setGenes(seedParaGenes(seed, novoTipo));
    setPresetAtivoId(null);
  };

  const handleSeedRandom = () => {
    const novaSeed = Math.floor(Math.random() * 90000) + 1000;
    setSeed(novaSeed);
    setGenes(seedParaGenes(novaSeed, tipo));
    setPresetAtivoId(null);
  };

  const handleGeneChange = <K extends keyof GenesPeca>(key: K, value: GenesPeca[K]) => {
    setGenes(prev => ({
      ...prev,
      [key]: value
    }));
    setPresetAtivoId(null);
  };

  // Aplicar um Preset de Estilo selecionado
  const handleAplicarPreset = (preset: PresetEstilo) => {
    setTipo(preset.tipo);
    setGenes(preset.genes);
    if (preset.corHex) {
      const idx = CORES_PINTURA.findIndex(c => c.hex.toLowerCase() === preset.corHex.toLowerCase());
      if (idx !== -1) setCorIndex(idx);
    }
    setPresetAtivoId(preset.id);
  };

  // Salvar a combinação atual como um novo Preset
  const handleConfirmarSalvarPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovoEstilo.trim()) return;

    const novoPreset: PresetEstilo = {
      id: `preset-${Date.now().toString().slice(-6)}`,
      nome: nomeNovoEstilo.trim(),
      tipo,
      genes: { ...genes },
      corHex: corSelecionada.hex,
      corNome: corSelecionada.nome,
      dataCriacao: new Date().toISOString().split('T')[0],
      descricao: descricaoNovoEstilo.trim() || `Estilo ${tipo.toUpperCase()} (${genes.familia}) com espessura ${genes.espessura}cm e acabamento ${corSelecionada.nome}`,
      tags: tagsSelecionadas.length > 0 ? tagsSelecionadas : [genes.familia, tipo],
      isCustom: true
    };

    setPresets(prev => [novoPreset, ...prev]);
    setPresetAtivoId(novoPreset.id);
    if (onSalvarPreset) {
      onSalvarPreset(novoPreset);
    }

    setFeedbackPresetSalvo(`Estilo "${novoPreset.nome}" salvo nos favoritos com sucesso!`);
    setNomeNovoEstilo('');
    setDescricaoNovoEstilo('');
    setTagsSelecionadas([]);
    setModalSalvarEstiloOpen(false);

    setTimeout(() => {
      setFeedbackPresetSalvo(null);
    }, 3800);
  };

  // Excluir um preset customizado com confirmação explícita (UX Lei 7)
  const handleExcluirPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExcluirPreset) {
      onExcluirPreset(id);
    } else {
      setPresets(prev => prev.filter(p => p.id !== id));
      if (presetAtivoId === id) setPresetAtivoId(null);
    }
  };

  const isEditandoOrcamento = Boolean(initialConfig?.orcamentoId);

  const handleGerarOrcamentoClick = () => {
    if (onCriarOrcamento) {
      onCriarOrcamento({
        tipo,
        genes,
        dimensoes,
        corHex: corSelecionada.hex,
        corNome: corSelecionada.nome,
        valor: metricas.precoVendaSugerido,
        custoPrevisto: metricas.custoTotalProducao,
        orcamentoId: initialConfig?.orcamentoId
      });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    }
  };

  return (
    <div id="simulador-section" className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Banner de Ajuste de Orçamento Existente */}
      {isEditandoOrcamento && (
        <div className="mb-6 p-4 rounded-xl border border-amber-500/50 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-amber-400">Ajuste de Orçamento Carregado</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
                  #{initialConfig?.orcamentoId}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Editando especificações de <strong>{initialConfig?.clienteNome || 'Cliente'}</strong>. Ajuste os parâmetros abaixo para recalcular as métricas mantendo a integridade do cadastro.
              </p>
            </div>
          </div>
          {onCancelarEdicao && (
            <button
              onClick={onCancelarEdicao}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-700 transition-colors whitespace-nowrap"
            >
              Cancelar Ajuste
            </button>
          )}
        </div>
      )}

      {/* Cabeçalho da Seção */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-neutral-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador Técnico 2D</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
            {isEditandoOrcamento ? 'Ajustar parâmetros técnicos da peça' : 'Configure e orce peças de serralheria em tempo real'}
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-1.5 max-w-2xl">
            {isEditandoOrcamento
              ? 'Modifique medidas, padrões ou acabamentos. O novo custo e proposta serão recalculados com precisão.'
              : 'Ajuste dimensões, espaçamento e espessuras. O sistema recalcula automaticamente a quantidade de barras, nós de solda, peso e custos.'}
          </p>
        </div>

        {/* Ações Rápidas: Modelos Prontos + Salvar Estilo + Semente Aleatória */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botão Ver Modelos Prontos */}
          <button
            onClick={() => setMostrarPresets(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              mostrarPresets
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>{mostrarPresets ? 'Ocultar Modelos' : `Modelos Prontos (${presets.length})`}</span>
          </button>

          {/* Botão Salvar Estilo Favorito */}
          <button
            onClick={() => {
              setNomeNovoEstilo(`Estilo ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${genes.familia.charAt(0).toUpperCase() + genes.familia.slice(1)}`);
              setModalSalvarEstiloOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 rounded-lg text-xs font-medium transition-colors"
            title="Salvar este desenho e acabamento na biblioteca de modelos favoritos"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Salvar como Modelo</span>
          </button>

          {/* Seed Input */}
          <div className="flex items-center bg-[#12161f] border border-neutral-800 rounded-lg px-2.5 py-1 text-xs font-mono">
            <label htmlFor={seedInputId} className="text-neutral-500 mr-2">Variação:</label>
            <input
              id={seedInputId}
              type="number"
              value={seed}
              onChange={(e) => {
                const s = parseInt(e.target.value) || 1;
                setSeed(s);
                setGenes(seedParaGenes(s, tipo));
                setPresetAtivoId(null);
              }}
              className="w-14 bg-transparent text-amber-400 font-semibold focus:outline-none tabular-nums"
            />
          </div>

          {/* Gerar Design Único */}
          <button
            onClick={() => {
              handleSeedRandom();
              setPresetAtivoId(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors border border-neutral-700 active:scale-95"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Sortear Outro</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback de Preset Salvo */}
      {feedbackPresetSalvo && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <BookmarkCheck className="w-4 h-4 text-emerald-400" />
          <span>{feedbackPresetSalvo}</span>
        </div>
      )}

      {/* Barra de Presets de Estilos Favoritos (Sob demanda) */}
      {mostrarPresets && (
        <div className="mb-8 p-4 sm:p-5 bg-[#11141c] border border-neutral-800 rounded-2xl space-y-4 animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-200 font-bold">
                Biblioteca de Modelos & Estilos Salvos ({presets.length})
              </span>
              <p className="text-[11px] text-neutral-400 font-mono">
                Reaproveite combinações testadas de grades, portões e guardas-corpos para novos orçamentos
              </p>
            </div>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono scrollbar-none">
            {[
              { id: 'todos', label: 'Todos', count: presets.length },
              { id: 'portao', label: 'Portões', count: presets.filter(p => p.tipo === 'portao').length },
              { id: 'grade', label: 'Grades', count: presets.filter(p => p.tipo === 'grade').length },
              { id: 'guarda-corpo', label: 'Guarda-corpos', count: presets.filter(p => p.tipo === 'guarda-corpo').length },
              { id: 'corrimao', label: 'Corrimãos', count: presets.filter(p => p.tipo === 'corrimao').length },
              { id: 'custom', label: '⭐ Meus Salvos', count: presets.filter(p => p.isCustom || p.id.startsWith('preset-')).length }
            ].map(f => {
              const isSelected = filtroTipoPreset === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFiltroTipoPreset(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="text-[10px] opacity-70">({f.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de Cards de Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets
            .filter(preset => {
              if (filtroTipoPreset === 'todos') return true;
              if (filtroTipoPreset === 'custom') return preset.isCustom || preset.id.startsWith('preset-');
              return preset.tipo === filtroTipoPreset;
            })
            .map(preset => {
              const isAtivo = presetAtivoId === preset.id;
              const svgThumb = gerarPecaSVG(preset.tipo, preset.genes, { largura: 160, altura: 80 }, preset.corHex);

              return (
                <div
                  key={preset.id}
                  onClick={() => handleAplicarPreset(preset)}
                  className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isAtivo
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-[#151924] border-neutral-800 hover:border-neutral-700 hover:bg-[#1a1f2e]'
                  }`}
                >
                  <div>
                    {/* Header do Card com Miniatura SVG */}
                    <div className="w-full h-20 bg-[#0c0e14] rounded-lg border border-neutral-800/80 mb-2.5 p-1.5 flex items-center justify-center overflow-hidden relative group-hover:border-neutral-700 transition-colors">
                      <div
                        className="w-full h-full flex items-center justify-center pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity"
                        dangerouslySetInnerHTML={{ __html: svgThumb }}
                      />
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-900/90 text-amber-400 font-bold border border-neutral-800 backdrop-blur-xs">
                        {preset.tipo}
                      </span>
                      {preset.isCustom && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Personalizado
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {preset.nome}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <div
                          className="w-3 h-3 rounded-full border border-neutral-600 shrink-0"
                          style={{ backgroundColor: preset.corHex }}
                          title={preset.corNome}
                        />
                        {(preset.isCustom || (preset.id.startsWith('preset-') && presets.length > 1)) && (
                          <button
                            onClick={(e) => handleExcluirPreset(preset.id, e)}
                            title="Remover este estilo salvo"
                            className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 font-mono line-clamp-1">
                      Padrão <strong className="text-neutral-200 capitalize">{preset.genes.familia}</strong> · {preset.genes.espessura}cm barra
                    </p>

                    {preset.descricao && (
                      <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2">
                        {preset.descricao}
                      </p>
                    )}

                    {preset.tags && preset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {preset.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-500">{preset.dataCriacao}</span>
                    {isAtivo ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Estilo Ativo
                      </span>
                    ) : (
                      <span className="text-amber-400/80 group-hover:text-amber-300 font-medium flex items-center gap-1">
                        <span>Aplicar Genes</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      )}

      {/* Seletor de Foco para Mobile (elimina a sobrecarga e o scroll infinito) */}
      <div className="lg:hidden flex items-center p-1 bg-[#11141c] border border-neutral-800 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setAbaMobileSimulador('visual')}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            abaMobileSimulador === 'visual'
              ? 'bg-amber-500 text-neutral-950 shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Desenho & Preço</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaMobileSimulador('medidas')}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            abaMobileSimulador === 'medidas'
              ? 'bg-amber-500 text-neutral-950 shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Medidas & Cor</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaMobileSimulador('avancado')}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            abaMobileSimulador === 'avancado'
              ? 'bg-amber-500 text-neutral-950 shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Ajustes CAD</span>
        </button>
      </div>

      {/* Grid Principal: Visualizador + Controles Paramétricos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Preview SVG e Métricas Rápidas (7 colunas) */}
        <div className={`lg:col-span-7 space-y-6 ${abaMobileSimulador === 'visual' ? 'block' : 'hidden lg:block'}`}>
          <ProceduralPreview
            tipo={tipo}
            genes={genes}
            dimensoes={dimensoes}
            corHex={corSelecionada.hex}
            corNome={corSelecionada.nome}
            className="min-h-[420px]"
          />

          {/* Painel de Engenharia & Métricas de Custo Real */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#11141c] border border-neutral-800/80 rounded-xl p-4">
            <div className="p-2.5 bg-[#171b26]/70 rounded-lg border border-neutral-800/60">
              <span className="text-[11px] text-neutral-400 block font-mono">Metragem Aço</span>
              <span className="text-lg font-mono font-bold text-white tabular-nums">
                {metricas.metrosLinearTotal} <span className="text-xs text-neutral-400 font-normal">m</span>
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                {metricas.qtdBarras} barras/montantes
              </span>
            </div>

            <div className="p-2.5 bg-[#171b26]/70 rounded-lg border border-neutral-800/60">
              <span className="text-[11px] text-neutral-400 block font-mono">Peso Estimado</span>
              <span className="text-lg font-mono font-bold text-white tabular-nums">
                {metricas.pesoEstimadoKg} <span className="text-xs text-neutral-400 font-normal">kg</span>
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                Aço estrutural perfilado
              </span>
            </div>

            <div className="p-2.5 bg-[#171b26]/70 rounded-lg border border-neutral-800/60">
              <span className="text-[11px] text-neutral-400 block font-mono">Solda & Consumo</span>
              <span className="text-lg font-mono font-bold text-amber-400 tabular-nums">
                {metricas.cordaoSoldaCm} <span className="text-xs text-neutral-400 font-normal">cm</span>
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                R$ {metricas.custoSoldaConsumiveis.toFixed(2)} insumos
              </span>
            </div>

            <div className="p-2.5 bg-[#171b26]/70 rounded-lg border border-neutral-800/60">
              <span className="text-[11px] text-neutral-400 block font-mono">Tempo Oficina</span>
              <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                {metricas.tempoProducaoHoras} <span className="text-xs text-neutral-400 font-normal">h</span>
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                Corte + solda + pintura
              </span>
            </div>
          </div>

          {/* Card Resumo do Orçamento e Margem */}
          <div className="p-5 bg-gradient-to-r from-neutral-900 to-[#161a24] border border-neutral-700/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span>Custo Direto: R$ {metricas.custoTotalProducao.toFixed(2)}</span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">Margem: {metricas.margemEstimada}%</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xs text-neutral-400">Preço Sugerido:</span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
                  R$ {metricas.precoVendaSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleGerarOrcamentoClick}
              className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg text-sm transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {savedFeedback ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-950" />
                  <span>{isEditandoOrcamento ? 'Orçamento atualizado' : 'Adicionado aos orçamentos'}</span>
                </>
              ) : isEditandoOrcamento ? (
                <>
                  <span>Salvar Alterações no Orçamento</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Criar Orçamento desta Peça</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Botões Rápidos para Navegar para Medidas no Mobile */}
          <div className="lg:hidden grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAbaMobileSimulador('medidas')}
              className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span>Ajustar Medidas & Cor</span>
            </button>
            <button
              type="button"
              onClick={() => setAbaMobileSimulador('avancado')}
              className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Ajustes Técnicos CAD</span>
            </button>
          </div>
        </div>

        {/* Coluna Direita: Controles Paramétricos e Sliders (5 colunas) */}
        <div className={`lg:col-span-5 bg-[#12151d] border border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-6 ${abaMobileSimulador !== 'visual' ? 'block' : 'hidden lg:block'}`}>
          
          {/* BLOCO 1: MEDIDAS & CORES (Aba Medidas ou Desktop) */}
          <div className={`space-y-6 ${abaMobileSimulador === 'avancado' ? 'hidden lg:block' : 'block'}`}>
            {/* Seletor de Tipo de Peça */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-medium">
                1. Tipo de Peça de Serralheria
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['portao', 'grade', 'corrimao', 'guarda-corpo'] as TipoPeca[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTipoChange(t)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all border text-left flex items-center justify-between cursor-pointer min-h-[40px] ${
                      tipo === t
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-semibold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span>{t === 'corrimao' ? 'Corrimão' : t === 'guarda-corpo' ? 'Guarda-corpo' : t === 'portao' ? 'Portão' : 'Grade'}</span>
                    {tipo === t && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensões em CM */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-medium">
                2. Dimensões Reais da Peça (cm)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={larguraId} className="text-[11px] text-neutral-400 font-mono block mb-1">Largura (cm)</label>
                  <input
                    id={larguraId}
                    type="number"
                    min={50}
                    max={1200}
                    value={dimensoes.largura}
                    onChange={(e) => setDimensoes(d => ({ ...d, largura: Math.max(30, parseInt(e.target.value) || 100) }))}
                    className="w-full min-h-[42px] bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none tabular-nums"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor={alturaId} className="text-[11px] text-neutral-400 font-mono block mb-1">Altura (cm)</label>
                    {tipo === 'guarda-corpo' && (
                      <span className="text-[10px] text-amber-400 font-mono">Min 110cm (Norma)</span>
                    )}
                  </div>
                  <input
                    id={alturaId}
                    type="number"
                    min={tipo === 'guarda-corpo' ? 110 : 30}
                    max={600}
                    value={dimensoes.altura}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 100;
                      const altMin = tipo === 'guarda-corpo' ? 110 : 30;
                      setDimensoes(d => ({ ...d, altura: Math.max(altMin, val) }));
                    }}
                    className="w-full min-h-[42px] bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Seletor de Cores de Pintura Eletrostática */}
            <div className="pt-2 border-t border-neutral-800">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-medium">
                Cor do Acabamento ({corSelecionada.nome})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CORES_PINTURA.map((c, i) => (
                  <button
                    key={c.nome}
                    type="button"
                    onClick={() => setCorIndex(i)}
                    className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer min-h-[44px] ${
                      corIndex === i
                        ? 'border-amber-400 bg-neutral-800/80 ring-1 ring-amber-400'
                        : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className="w-full h-3.5 rounded border border-white/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-neutral-300 truncate font-mono">
                      {c.nome.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BLOCO 2: PARÂMETROS TÉCNICOS CAD (Aba Avançado ou Desktop) */}
          <div className={`space-y-6 ${abaMobileSimulador === 'medidas' ? 'hidden lg:block' : 'block'}`}>
            {/* Seletor de Família Matemática */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-medium">
                3. Padrão Visual das Barras
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['reto', 'ondulado', 'cruzado', 'geometrico'] as FamiliaPadrao[]).map(fam => (
                  <button
                    key={fam}
                    type="button"
                    onClick={() => handleGeneChange('familia', fam)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all border text-left flex items-center justify-between cursor-pointer min-h-[40px] ${
                      genes.familia === fam
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-semibold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span>{fam === 'geometrico' ? 'Geométrico (Grid)' : fam}</span>
                    {genes.familia === fam && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders dos Genes Contínuos */}
            <div className="space-y-4 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-medium">
                  4. Ajuste Fino dos Barrotes & Perfis
                </span>
                <Sliders className="w-3.5 h-3.5 text-neutral-500" />
              </div>

              {/* Espaçamento */}
              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1">
                  <label htmlFor={espacamentoId} className="cursor-pointer">Espaçamento entre barras</label>
                  <span className="text-amber-400 tabular-nums">{genes.espacamento} cm</span>
                </div>
                <input
                  id={espacamentoId}
                  type="range"
                  min={5}
                  max={30}
                  step={0.5}
                  value={genes.espacamento}
                  onChange={(e) => handleGeneChange('espacamento', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-6"
                />
              </div>

              {/* Espessura */}
              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1">
                  <label htmlFor={espessuraId} className="cursor-pointer">Espessura do perfil</label>
                  <span className="text-amber-400 tabular-nums">{genes.espessura} cm</span>
                </div>
                <input
                  id={espessuraId}
                  type="range"
                  min={1}
                  max={8}
                  step={0.2}
                  value={genes.espessura}
                  onChange={(e) => handleGeneChange('espessura', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-6"
                />
              </div>

              {/* Ângulo */}
              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1">
                  <label htmlFor={anguloId} className="cursor-pointer">Inclinação / Ângulo</label>
                  <span className="text-amber-400 tabular-nums">{genes.angulo}°</span>
                </div>
                <input
                  id={anguloId}
                  type="range"
                  min={0}
                  max={90}
                  step={1}
                  value={genes.angulo}
                  onChange={(e) => handleGeneChange('angulo', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-6"
                />
              </div>

              {/* Assimetria */}
              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1">
                  <label htmlFor={assimetriaId} className="cursor-pointer">Ritmo das Barras</label>
                  <span className="text-amber-400 tabular-nums">{genes.assimetria}</span>
                </div>
                <input
                  id={assimetriaId}
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={genes.assimetria}
                  onChange={(e) => handleGeneChange('assimetria', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-6"
                />
              </div>

              {/* Gene específico: Corrimão (Inclinação de Escada) */}
              {tipo === 'corrimao' && (
                <div>
                  <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1">
                    <label htmlFor={inclinacaoId} className="cursor-pointer">Inclinação da Escada (Graus)</label>
                    <span className="text-amber-400 tabular-nums">{genes.inclinacaoEscada || 30}°</span>
                  </div>
                  <input
                    id={inclinacaoId}
                    type="range"
                    min={0}
                    max={45}
                    step={1}
                    value={genes.inclinacaoEscada || 30}
                    onChange={(e) => handleGeneChange('inclinacaoEscada', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-6"
                  />
                </div>
              )}

              {/* Gene específico: Portão (Moldura e Estilo) */}
              {tipo === 'portao' && (
                <div className="pt-2 border-t border-neutral-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300">Requadro / Moldura Perimetral</span>
                    <input
                      type="checkbox"
                      checked={genes.temMoldura ?? true}
                      onChange={(e) => handleGeneChange('temMoldura', e.target.checked)}
                      className="accent-amber-500 w-5 h-5 cursor-pointer"
                    />
                  </div>

                  {(genes.temMoldura ?? true) && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {(['tubular', 'industrial', 'cantoneira', 'minimalista'] as EstiloMoldura[]).map(est => (
                        <button
                          key={est}
                          type="button"
                          onClick={() => handleGeneChange('estiloMoldura', est)}
                          className={`text-[11px] py-1.5 px-2 rounded-lg border font-mono capitalize text-center cursor-pointer min-h-[36px] ${
                            genes.estiloMoldura === est
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
              )}
            </div>

            {/* Ação de Salvar Combinação como Estilo nos Controles */}
            <div className="pt-3 border-t border-neutral-800/80">
              <div className="p-3.5 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold uppercase">
                    <Star className="w-3.5 h-3.5 fill-amber-400/20" />
                    <span>Salvar como Modelo</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                    Guarde este padrão ({genes.familia}, {genes.espessura}cm) para reaproveitar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNomeNovoEstilo(`Estilo ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${genes.familia.charAt(0).toUpperCase() + genes.familia.slice(1)}`);
                    setModalSalvarEstiloOpen(true);
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs font-mono transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer min-h-[40px]"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Salvar Modelo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Botão de Retorno ao Desenho no Mobile */}
          <div className="lg:hidden pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setAbaMobileSimulador('visual');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[48px]"
            >
              <Eye className="w-4 h-4" />
              <span>Conferir Desenho & Preço da Peça</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal para Salvar Novo Preset de Estilo */}
      {modalSalvarEstiloOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#121622] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold uppercase">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Novo Modelo Favorito</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white">Salvar Modelo na Biblioteca</h3>
                <p className="text-xs text-neutral-400">
                  Armazene as medidas, espaçamento das barras e acabamento para reutilizar em novos orçamentos com 1 clique.
                </p>
              </div>
              <button
                onClick={() => setModalSalvarEstiloOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Miniatura SVG ao Vivo da Peça a Ser Salva */}
            <div className="w-full h-28 bg-[#090b10] rounded-xl border border-neutral-800 p-2 flex items-center justify-center relative overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center pointer-events-none"
                dangerouslySetInnerHTML={{
                  __html: gerarPecaSVG(tipo, genes, { largura: 240, altura: 110 }, corSelecionada.hex)
                }}
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900/90 text-amber-400 font-bold border border-neutral-800">
                  {tipo}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900/90 text-neutral-300 border border-neutral-800">
                  {corSelecionada.nome}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmarSalvarPreset} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-neutral-300 block mb-1.5 font-semibold">
                  Nome do Estilo / Modelo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Portão Ripado Corten Minimalista"
                  value={nomeNovoEstilo}
                  onChange={(e) => setNomeNovoEstilo(e.target.value)}
                  className="w-full bg-[#090b10] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-sans focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-neutral-300 block mb-1.5 font-semibold">
                  Aplicação / Descrição Técnica (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Portão para condomínio com vão de até 4 metros"
                  value={descricaoNovoEstilo}
                  onChange={(e) => setDescricaoNovoEstilo(e.target.value)}
                  className="w-full bg-[#090b10] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Tags Sugeridas */}
              <div>
                <label className="text-xs font-mono uppercase text-neutral-300 block mb-1.5 font-semibold flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span>Tags de Classificação Rápida</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TAGS_SUGERIDAS.map(tag => {
                    const isSelected = tagsSelecionadas.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setTagsSelecionadas(prev =>
                            isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                          );
                        }}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-xs'
                            : 'bg-[#090b10] border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resumo da Combinação Técnica Atual */}
              <div className="p-3 bg-[#090b10] rounded-xl border border-neutral-800 text-xs font-mono space-y-1.5 text-neutral-400">
                <div className="flex justify-between">
                  <span>Tipo de Peça:</span>
                  <span className="text-white uppercase font-bold">{tipo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Família Matemática:</span>
                  <span className="text-white capitalize">{genes.familia}</span>
                </div>
                <div className="flex justify-between">
                  <span>Espaçamento / Espessura:</span>
                  <span className="text-amber-400">{genes.espacamento}cm / {genes.espessura}cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Acabamento:</span>
                  <span className="text-white">{corSelecionada.nome}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalSalvarEstiloOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!nomeNovoEstilo.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs font-mono transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Salvar Modelo na Biblioteca</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
