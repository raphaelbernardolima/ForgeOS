import React, { useState } from 'react';
import {
  Plus,
  Send,
  Sliders,
  Bookmark,
  PenLine,
  ArrowRight,
  Clock,
  Search,
  Trash2,
  FileSpreadsheet,
  X,
  MoreVertical,
  Check,
  Eye,
  Layers,
  Phone,
  Zap,
  ChevronDown,
  ChevronUp,
  Wrench
} from 'lucide-react';
import { useSerralheria } from '../../context/SerralheriaContext';
import { gerarPecaSVG, calcularMetricas } from '../../lib/proceduralSvg';
import { CatalogoEstilosRibbon } from './CatalogoEstilosRibbon';
import { NovoOrcamentoModal } from './NovoOrcamentoModal';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { OrçamentoItem } from '../../types';

export const OrcamentosTab: React.FC = () => {
  const {
    orcamentos,
    adicionarOrcamento,
    buscaOrcamentos,
    setBuscaOrcamentos,
    filtroStatusOrcamento,
    setFiltroStatusOrcamento,
    modoSimplificado,
    toggleModoSimplificado,
    aprovarOrcamento,
    excluirOrcamento,
    converterEmOS,
    enviarWhatsApp,
    editarPecaNoSimulador,
    salvarPecaOrcamentoComoPreset,
    openSignatureModal,
    openReceiptModal,
    setEditingConfig,
    setViewMode,
    setActiveTab,
    notify
  } = useSerralheria();

  // Controle de modal de novo orçamento rápido
  const [modalNovoAberto, setModalNovoAberto] = useState<boolean>(false);

  // Controle de menu de ações secundárias por card
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  // Controle de expansão de detalhes técnicos no Modo Simplificado
  const [detalhesTecnicosAbertosId, setDetalhesTecnicosAbertosId] = useState<string | null>(null);

  // Controle de visualização da biblioteca de modelos (fechada por padrão para não poluir a tela)
  const [mostrarModelos, setMostrarModelos] = useState<boolean>(false);

  // Função para copiar o link de rastreio que o cliente final visualiza
  const handleCopiarLinkCliente = (orcId: string, clienteNome: string) => {
    const url = `${window.location.origin}/?rastreio=${orcId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    notify(
      'Link de rastreio copiado!',
      'success',
      `Envie para ${clienteNome} no WhatsApp para ele acompanhar as etapas de fabricação em tempo real.`
    );
  };

  const handleSalvarNovoOrcamento = (novoOrc: OrçamentoItem, enviarZap = false) => {
    adicionarOrcamento(novoOrc);
    notify(
      `Orçamento #${novoOrc.id} criado`,
      'success',
      `Proposta de R$ ${novoOrc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} salva para ${novoOrc.clienteNome}.`
    );

    if (enviarZap) {
      setTimeout(() => {
        enviarWhatsApp(novoOrc);
      }, 300);
    }
  };

  const handleAbrirNoCad = (config: any) => {
    setEditingConfig({
      tipo: config.tipo,
      genes: config.genes,
      dimensoes: config.dimensoes,
      corHex: config.corHex,
      corNome: config.corNome,
      clienteNome: config.clienteNome
    });
    setViewMode('simulador');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify('Aberto no simulador CAD', 'info', 'Ajuste nós de solda, barrotes e espessuras milimétricas.');
  };

  // Filtragem e busca em tempo real
  const orcamentosFiltrados = orcamentos.filter(orc => {
    const matchStatus =
      filtroStatusOrcamento === 'todos' ||
      (filtroStatusOrcamento === 'pendente' && orc.status === 'pendente') ||
      (filtroStatusOrcamento === 'aprovado' && orc.status === 'aprovado') ||
      (filtroStatusOrcamento === 'convertido_os' && orc.status === 'convertido_os');

    const termo = buscaOrcamentos.toLowerCase().trim();
    const matchBusca =
      !termo ||
      orc.clienteNome.toLowerCase().includes(termo) ||
      orc.id.toLowerCase().includes(termo) ||
      orc.tipo.toLowerCase().includes(termo) ||
      orc.clienteTelefone.includes(termo);

    return matchStatus && matchBusca;
  });

  const contadores = {
    todos: orcamentos.length,
    pendente: orcamentos.filter(o => o.status === 'pendente').length,
    aprovado: orcamentos.filter(o => o.status === 'aprovado').length,
    convertido_os: orcamentos.filter(o => o.status === 'convertido_os').length
  };

  return (
    <div className="space-y-6">
      {/* Topo Limpo: Título Direto e Ações Principais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Orçamentos & Vendas
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Crie propostas rápidas, envie pelo WhatsApp e converta em ordens de produção.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          {/* Alternador de Modo Simplificado vs Técnico */}
          <button
            onClick={toggleModoSimplificado}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] ${
              modoSimplificado
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
            }`}
            title="Alternar entre Interface Simplificada (Oficina) e Modo Técnico (CAD)"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{modoSimplificado ? 'Interface Simplificada' : 'Modo Técnico'}</span>
          </button>

          {/* Botão para abrir modelos apenas quando o usuário desejar */}
          <button
            onClick={() => setMostrarModelos(prev => !prev)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer min-h-[44px] ${
              mostrarModelos
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{mostrarModelos ? 'Ocultar Modelos' : 'Modelos Prontos'}</span>
          </button>

          <button
            onClick={() => setModalNovoAberto(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>

      {/* Banner Explicativo do Modo Simplificado */}
      {modoSimplificado && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-300 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                Modo de Interface Simplificada Ativo
              </span>
              <span className="text-[11px] text-amber-200/80">
                Foco no cliente, valores claros e envio rápido no WhatsApp sem termos técnicos complicados.
              </span>
            </div>
          </div>
          <button
            onClick={toggleModoSimplificado}
            className="text-[11px] font-mono underline font-bold hover:text-white cursor-pointer self-start sm:self-auto shrink-0"
          >
            Mudar para Modo Técnico CAD
          </button>
        </div>
      )}

      {/* Biblioteca de Modelos (Sob demanda, sem ocupar espaço fixo) */}
      {mostrarModelos && (
        <div className="animate-in fade-in duration-200">
          <CatalogoEstilosRibbon />
        </div>
      )}

      {/* Barra de Filtros Direta e Descomplicada */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d1017] p-2.5 rounded-xl border border-neutral-800/80">
        
        {/* Campo de Busca Limpo */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone ou #código..."
            value={buscaOrcamentos}
            onChange={(e) => setBuscaOrcamentos(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/80 transition-colors min-h-[40px]"
          />
          {buscaOrcamentos && (
            <button
              onClick={() => setBuscaOrcamentos('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros em Segmented Control Elegante */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900/80 rounded-lg border border-neutral-800/60 overflow-x-auto scrollbar-none">
          {[
            { id: 'todos', label: 'Todos', count: contadores.todos },
            { id: 'pendente', label: 'Pendentes', count: contadores.pendente },
            { id: 'aprovado', label: 'Aprovados', count: contadores.aprovado },
            { id: 'convertido_os', label: 'Em Produção', count: contadores.convertido_os }
          ].map(f => {
            const isSelected = filtroStatusOrcamento === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFiltroStatusOrcamento(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                  isSelected
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] font-mono tabular-nums opacity-75">
                  ({f.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Orçamentos com Cards 100% Responsivos e Ergonomia Perfeita */}
      <div>
        {orcamentosFiltrados.length === 0 ? (
          <EmptyState
            icon={<FileSpreadsheet className="w-6 h-6" />}
            title={buscaOrcamentos ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento nesta categoria'}
            description={
              buscaOrcamentos
                ? `Nenhum resultado para "${buscaOrcamentos}". Tente buscar por outro termo.`
                : 'Você não tem orçamentos com este status no momento.'
            }
            actionLabel={buscaOrcamentos ? 'Limpar Busca' : 'Criar Orçamento'}
            onAction={buscaOrcamentos ? () => setBuscaOrcamentos('') : () => setModalNovoAberto(true)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orcamentosFiltrados.map(orc => {
              const metricas = calcularMetricas(orc.tipo, orc.genes, orc.dimensoes);
              const svgThumb = gerarPecaSVG(orc.tipo, orc.genes, orc.dimensoes, orc.corHex);
              const menuAberto = menuAbertoId === orc.id;

              return (
                <div
                  key={orc.id}
                  className="bg-[#11141c] border border-neutral-800/80 hover:border-neutral-700/80 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-xs relative"
                >
                  {/* Linha 1 do Topo: Dados Técnicos Rápidos + Indicador de Status */}
                  <div className="flex items-center justify-between gap-2 text-xs border-b border-neutral-850 pb-2.5">
                    <div className="flex items-center gap-1.5 font-mono text-neutral-400 truncate">
                      <span className="font-bold text-amber-400">#{orc.id}</span>
                      <span>·</span>
                      <span className="capitalize font-medium text-neutral-300">{orc.tipo}</span>
                      <span>·</span>
                      <span>{orc.dimensoes.largura}×{orc.dimensoes.altura} cm</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          orc.status === 'aprovado'
                            ? 'bg-emerald-400'
                            : orc.status === 'convertido_os'
                            ? 'bg-sky-400'
                            : orc.diasSemResposta > 2
                            ? 'bg-amber-400'
                            : 'bg-neutral-500'
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-neutral-200">
                        {orc.status === 'convertido_os'
                          ? 'Em Produção'
                          : orc.status === 'aprovado'
                          ? 'Aprovado'
                          : 'Pendente'}
                      </span>
                    </div>
                  </div>

                  {/* Linha 2 do Topo: Cliente & Contato em Destaque */}
                  <div className="mt-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                      {orc.clienteNome}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                      <a
                        href={`https://wa.me/55${orc.clienteTelefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-neutral-400 hover:text-emerald-400 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{orc.clienteTelefone}</span>
                      </a>
                      {orc.status === 'pendente' && orc.diasSemResposta > 2 && (
                        <span className="text-[11px] text-amber-400 font-mono">
                          Sem resposta há {orc.diasSemResposta}d
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Corpo do Card: Miniatura Visual + Especificação + Preço */}
                  <div className="my-3 py-2.5 px-3 bg-[#0d1017] rounded-xl border border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-16 h-14 bg-[#08090e] rounded-lg border border-neutral-800 flex items-center justify-center p-1 shrink-0 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: svgThumb }}
                      />
                      <div className="text-xs text-neutral-400 min-w-0 flex-1">
                        <p className="text-neutral-200 font-medium truncate">{orc.descricao}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                          <span className="flex items-center gap-1 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: orc.corHex }}
                            />
                            <span className="truncate">{orc.corNome}</span>
                          </span>
                          {!modoSimplificado && (
                            <>
                              <span>·</span>
                              <span>{metricas.pesoEstimadoKg} kg aço</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/60 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                        Valor Proposto
                      </span>
                      <span className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
                        R$ {orc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes Técnicos Expansíveis no Modo Simplificado */}
                  {modoSimplificado ? (
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={() => setDetalhesTecnicosAbertosId(detalhesTecnicosAbertosId === orc.id ? null : orc.id)}
                        className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 font-mono transition-colors cursor-pointer py-0.5"
                      >
                        <Wrench className="w-3 h-3 text-neutral-500" />
                        <span>{detalhesTecnicosAbertosId === orc.id ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos (aço, solda e custos)'}</span>
                        {detalhesTecnicosAbertosId === orc.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {detalhesTecnicosAbertosId === orc.id && (
                        <div className="mt-1.5 p-2 bg-[#090b10] border border-neutral-800/80 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-neutral-300 animate-in fade-in">
                          <div>
                            <span className="text-neutral-500 text-[10px] block">Aço Estrutural:</span>
                            <span>{metricas.pesoEstimadoKg} kg</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 text-[10px] block">Metragem:</span>
                            <span>{metricas.metrosLinearTotal} m</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 text-[10px] block">Custo Direto:</span>
                            <span>R$ {metricas.custoTotalProducao.toFixed(0)}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 text-[10px] block">Margem:</span>
                            <span className="text-emerald-400 font-bold">{metricas.margemEstimada}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Rodapé do Card: Ações Primárias Claras + Menu "..." */}
                  <div className="pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-2">
                    
                    {/* Ações com alta aderência ao polegar em mobile */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {orc.status === 'pendente' && (
                        <>
                          <button
                            type="button"
                            onClick={() => enviarWhatsApp(orc)}
                            className="flex-1 sm:flex-none min-h-[44px] px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                            title="Enviar proposta pronta para o WhatsApp do cliente"
                          >
                            <Send className="w-4 h-4 shrink-0" />
                            <span>Mandar no Zap</span>
                          </button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => aprovarOrcamento(orc.id)}
                            leftIcon={<Check className="w-4 h-4" />}
                            className="min-h-[44px] px-3.5"
                          >
                            Aprovar
                          </Button>
                        </>
                      )}

                      {orc.status === 'aprovado' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => converterEmOS(orc)}
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                          className="flex-1 sm:flex-none min-h-[44px] font-bold"
                        >
                          Iniciar Produção
                        </Button>
                      )}

                      {orc.status === 'convertido_os' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('producao')}
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                          className="flex-1 sm:flex-none min-h-[44px]"
                        >
                          Ver na Fábrica
                        </Button>
                      )}
                    </div>

                    {/* Botão de Menu "..." (44x44px garantido) */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setMenuAbertoId(menuAberto ? null : orc.id)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Mais opções deste orçamento"
                        aria-label="Mais opções"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Desktop + Bottom Sheet Mobile */}
                      {menuAberto && (
                        <>
                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-50 bg-black/60 md:bg-transparent"
                            onClick={() => setMenuAbertoId(null)}
                          />

                          {/* Versão Mobile: Bottom Sheet que sobe da base da tela (Ergonomia do Polegar) */}
                          <div
                            className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-[#131622] rounded-t-3xl p-5 border-t border-neutral-700 shadow-2xl space-y-2 animate-in slide-in-from-bottom duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="w-10 h-1.5 bg-neutral-600 rounded-full mx-auto mb-3" />
                            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                              <div>
                                <span className="text-xs font-mono text-amber-400 font-bold">#{orc.id}</span>
                                <h4 className="text-sm font-bold text-white">{orc.clienteNome}</h4>
                              </div>
                              <button
                                onClick={() => setMenuAbertoId(null)}
                                className="p-2 text-neutral-400 hover:text-white"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                openReceiptModal(orc, 'orcamento');
                              }}
                              className="w-full min-h-[48px] text-left px-3 py-2.5 rounded-xl text-neutral-200 hover:bg-neutral-800 flex items-center gap-3 cursor-pointer"
                            >
                              <Eye className="w-5 h-5 text-neutral-400" />
                              <span className="text-sm font-medium">Visualizar Proposta / Imprimir</span>
                            </button>

                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                handleCopiarLinkCliente(orc.id, orc.clienteNome);
                              }}
                              className="w-full min-h-[48px] text-left px-3 py-2.5 rounded-xl text-neutral-200 hover:bg-neutral-800 flex items-center gap-3 cursor-pointer"
                            >
                              <Send className="w-5 h-5 text-emerald-400" />
                              <span className="text-sm font-medium">Copiar Link de Rastreio (WhatsApp)</span>
                            </button>

                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                editarPecaNoSimulador(orc);
                              }}
                              className="w-full min-h-[48px] text-left px-3 py-2.5 rounded-xl text-neutral-200 hover:bg-neutral-800 flex items-center gap-3 cursor-pointer"
                            >
                              <Sliders className="w-5 h-5 text-amber-400" />
                              <span className="text-sm font-medium">Ajustar Medidas no Desenho 2D</span>
                            </button>

                            {!orc.assinaturaDigital && (
                              <button
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  openSignatureModal(orc.id, 'orcamento');
                                }}
                                className="w-full min-h-[48px] text-left px-3 py-2.5 rounded-xl text-neutral-200 hover:bg-neutral-800 flex items-center gap-3 cursor-pointer"
                              >
                                <PenLine className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm font-medium">Colher Assinatura Digital</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                salvarPecaOrcamentoComoPreset(orc);
                              }}
                              className="w-full min-h-[48px] text-left px-3 py-2.5 rounded-xl text-neutral-200 hover:bg-neutral-800 flex items-center gap-3 cursor-pointer"
                            >
                              <Bookmark className="w-5 h-5 text-sky-400" />
                              <span className="text-sm font-medium">Salvar como Modelo Favorito</span>
                            </button>

                            <div className="pt-2 border-t border-neutral-800">
                              <button
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  excluirOrcamento(orc.id);
                                }}
                                className="w-full min-h-[48px] text-left px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 flex items-center gap-3 cursor-pointer"
                              >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-sm font-medium">Excluir Orçamento</span>
                              </button>
                            </div>
                          </div>

                          {/* Versão Desktop: Dropdown flutuante clássico */}
                          <div className="hidden md:block absolute right-0 bottom-full mb-1 w-56 bg-[#161a25] border border-neutral-700/80 rounded-xl shadow-xl z-50 py-1 text-xs">
                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                openReceiptModal(orc, 'orcamento');
                              }}
                              className="w-full text-left px-3 py-2 text-neutral-200 hover:bg-neutral-800/80 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Visualizar Proposta</span>
                            </button>

                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                handleCopiarLinkCliente(orc.id, orc.clienteNome);
                              }}
                              className="w-full text-left px-3 py-2 text-neutral-200 hover:bg-neutral-800/80 flex items-center gap-2 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copiar Link de Rastreio</span>
                            </button>

                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                editarPecaNoSimulador(orc);
                              }}
                              className="w-full text-left px-3 py-2 text-neutral-200 hover:bg-neutral-800/80 flex items-center gap-2 cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5 text-amber-400" />
                              <span>Ajustar Medidas no CAD</span>
                            </button>

                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                salvarPecaOrcamentoComoPreset(orc);
                              }}
                              className="w-full text-left px-3 py-2 text-neutral-200 hover:bg-neutral-800/80 flex items-center gap-2 cursor-pointer"
                            >
                              <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                              <span>Salvar como Modelo</span>
                            </button>

                            {!orc.assinaturaDigital && (
                              <button
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  openSignatureModal(orc.id, 'orcamento');
                                }}
                                className="w-full text-left px-3 py-2 text-neutral-200 hover:bg-neutral-800/80 flex items-center gap-2 cursor-pointer"
                              >
                                <PenLine className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Coletar Assinatura</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-neutral-800" />

                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                excluirOrcamento(orc.id);
                              }}
                              className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Excluir Orçamento</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Descomplicado de Novo Orçamento Rápido */}
      <NovoOrcamentoModal
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSalvar={handleSalvarNovoOrcamento}
        onAbrirNoCad={handleAbrirNoCad}
      />
    </div>
  );
};
