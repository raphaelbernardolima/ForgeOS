import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TipoPeca,
  GenesPeca,
  DimensoesPeca,
  OrçamentoItem,
  OrdemServico,
  ItemEstoque,
  AgendamentoInstalacao,
  TransacaoFinanceira,
  PresetEstilo
} from '../types';
import {
  INITIAL_ORCAMENTOS,
  INITIAL_ORDENS_SERVICO,
  INITIAL_ESTOQUE,
  INITIAL_INSTALACOES,
  INITIAL_TRANSACOES,
  INITIAL_PRESETS
} from '../lib/mockData';
import { calcularMetricas } from '../lib/proceduralSvg';
import { ToastMessage, ToastType } from '../components/ui/Toast';

export type ViewMode = 'erp' | 'simulador' | 'landing';
export type WorkspaceTab = 'orcamentos' | 'producao' | 'estoque' | 'instalacao' | 'financeiro' | 'clientes' | 'portal';

interface EditingConfig {
  tipo: TipoPeca;
  genes: GenesPeca;
  dimensoes: DimensoesPeca;
  corHex: string;
  corNome: string;
  orcamentoId?: string;
  clienteNome?: string;
  presetAtivoId?: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
}

interface SerralheriaContextType {
  // Navegação
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;

  // Estado Central
  orcamentos: OrçamentoItem[];
  ordensServico: OrdemServico[];
  estoque: ItemEstoque[];
  instalacoes: AgendamentoInstalacao[];
  transacoes: TransacaoFinanceira[];
  presets: PresetEstilo[];

  // Filtros & Busca de Orçamentos (UX Mandamento 2)
  buscaOrcamentos: string;
  setBuscaOrcamentos: (val: string) => void;
  filtroStatusOrcamento: string;
  setFiltroStatusOrcamento: (val: string) => void;

  // Modo de Interface (Simplificada para serralheiros / Avançada técnica)
  modoSimplificado: boolean;
  setModoSimplificado: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleModoSimplificado: () => void;

  // Configuração de Edição no CAD
  editingConfig: EditingConfig | null;
  setEditingConfig: (cfg: EditingConfig | null) => void;

  // Modais Globais
  signatureModalOpen: boolean;
  selectedDocForSignature: { id: string; tipo: 'orcamento' | 'instalacao' } | null;
  receiptModalOpen: boolean;
  docForReceipt: { doc: OrdemServico | OrçamentoItem; tipo: 'os' | 'orcamento'; modoInicial?: 'proposta' | 'ficha_corte' } | null;

  // Sistema de Feedback Global Imediato (UX Mandamento 1)
  toasts: ToastMessage[];
  notify: (message: string, type?: ToastType, description?: string) => void;
  dismissToast: (id: string) => void;

  // Sistema de Confirmação Explícita para Ações Irreversíveis (UX Mandamento 7)
  confirmDialog: ConfirmDialogState | null;
  requestConfirm: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }) => void;
  closeConfirm: () => void;

  // Ações de Negócio
  aprovarOrcamento: (id: string) => void;
  excluirOrcamento: (id: string) => void;
  converterEmOS: (orc: OrçamentoItem) => void;
  avancarStatusOS: (osId: string) => void;
  toggleChecklistOS: (osId: string, checkId: string) => void;
  reabastecerEstoque: (itemId: string, quantidade?: number) => void;
  salvarPreset: (novoPreset: PresetEstilo) => void;
  excluirPreset: (id: string) => void;
  carregarPresetNoSimulador: (preset: PresetEstilo) => void;
  salvarPecaOrcamentoComoPreset: (orc: OrçamentoItem) => void;
  editarPecaNoSimulador: (orcamento: OrçamentoItem) => void;
  salvarOrcamentoDoSimulador: (dados: {
    tipo: TipoPeca;
    genes: GenesPeca;
    dimensoes: DimensoesPeca;
    corHex: string;
    corNome: string;
    valor: number;
    custoPrevisto: number;
    orcamentoId?: string;
  }) => void;
  criarOrcamentoRapidoComPreset: (preset: PresetEstilo) => void;
  enviarWhatsApp: (orc: OrçamentoItem) => void;
  openSignatureModal: (id: string, tipo: 'orcamento' | 'instalacao') => void;
  closeSignatureModal: () => void;
  saveSignature: (sigUrl: string) => void;
  openReceiptModal: (doc: OrdemServico | OrçamentoItem, tipo: 'os' | 'orcamento', modoInicial?: 'proposta' | 'ficha_corte') => void;
  closeReceiptModal: () => void;
  abrirNovoOrcamentoSimulador: () => void;
  adicionarOrcamento: (novoOrc: OrçamentoItem) => void;
}

const SerralheriaContext = createContext<SerralheriaContextType | undefined>(undefined);

const PRESETS_STORAGE_KEY = 'forjaos_presets_favoritos';
const ORCAMENTOS_STORAGE_KEY = 'forjaos_orcamentos_data';

export const SerralheriaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Padrão do sistema: inicia direto no Painel ERP Operacional!
  const [viewMode, setViewMode] = useState<ViewMode>('erp');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('orcamentos');

  // Filtros e busca rápida
  const [buscaOrcamentos, setBuscaOrcamentos] = useState<string>('');
  const [filtroStatusOrcamento, setFiltroStatusOrcamento] = useState<string>('todos');

  // Modo de Interface: Simplificada para serralheiros (padrão ativo) vs Técnica Avançada
  const SIMPLIFICADO_STORAGE_KEY = 'forjaos_modo_simplificado';
  const [modoSimplificado, setModoSimplificadoState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SIMPLIFICADO_STORAGE_KEY);
      if (stored !== null) return stored !== 'false';
    } catch (e) {
      console.error('Erro ao ler modo simplificado do localStorage', e);
    }
    return true; // Padrão: Modo Simplificado ativado para serralheiros com pouca afinidade digital
  });

  const setModoSimplificado = (val: boolean | ((prev: boolean) => boolean)) => {
    setModoSimplificadoState(prev => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem(SIMPLIFICADO_STORAGE_KEY, String(nextVal));
      } catch (e) {}
      return nextVal;
    });
  };

  const toggleModoSimplificado = () => {
    setModoSimplificado(prev => {
      const next = !prev;
      notify(
        next ? 'Interface Simplificada ativada' : 'Modo Técnico Avançado ativado',
        'info',
        next
          ? 'Formulários limpos, botões grandes e foco em orçamentos rápidos pelo WhatsApp.'
          : 'Controles CAD completos, nós de solda e métricas detalhadas expostos.'
      );
      return next;
    });
  };

  // Presets com persistência local
  const [presets, setPresets] = useState<PresetEstilo[]>(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Erro ao ler presets do localStorage', e);
    }
    return INITIAL_PRESETS;
  });

  const [orcamentos, setOrcamentos] = useState<OrçamentoItem[]>(() => {
    try {
      const stored = localStorage.getItem(ORCAMENTOS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Erro ao ler orçamentos do localStorage', e);
    }
    return INITIAL_ORCAMENTOS;
  });

  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>(INITIAL_ORDENS_SERVICO);
  const [estoque, setEstoque] = useState<ItemEstoque[]>(INITIAL_ESTOQUE);
  const [instalacoes, setInstalacoes] = useState<AgendamentoInstalacao[]>(INITIAL_INSTALACOES);
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>(INITIAL_TRANSACOES);

  const [editingConfig, setEditingConfig] = useState<EditingConfig | null>(null);

  // Modais
  const [signatureModalOpen, setSignatureModalOpen] = useState<boolean>(false);
  const [selectedDocForSignature, setSelectedDocForSignature] = useState<{ id: string; tipo: 'orcamento' | 'instalacao' } | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [docForReceipt, setDocForReceipt] = useState<{ doc: OrdemServico | OrçamentoItem; tipo: 'os' | 'orcamento'; modoInicial?: 'proposta' | 'ficha_corte' } | null>(null);

  // Sistema de Feedback Global (UX Mandamento 1)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = (message: string, type: ToastType = 'success', description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, type, message, description };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sistema de Confirmação Explícita (UX Mandamento 7)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const requestConfirm = (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel || 'Confirmar',
      cancelLabel: options.cancelLabel || 'Cancelar',
      variant: options.variant || 'danger',
      isLoading: false,
      onConfirm: () => {
        options.onConfirm();
        setConfirmDialog(null);
      }
    });
  };

  const closeConfirm = () => {
    setConfirmDialog(null);
  };

  // Salvar alterações de orçamentos no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORCAMENTOS_STORAGE_KEY, JSON.stringify(orcamentos));
    } catch (e) {
      console.error('Erro ao salvar orçamentos', e);
    }
  }, [orcamentos]);

  // Ações de Presets
  const salvarPreset = (novoPreset: PresetEstilo) => {
    setPresets(prev => {
      const atualizados = [novoPreset, ...prev.filter(p => p.id !== novoPreset.id)];
      try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(atualizados));
      } catch (e) {
        console.error('Erro ao persistir preset', e);
      }
      return atualizados;
    });
    notify(`Modelo "${novoPreset.nome}" salvo`, 'success', 'Disponível na sua biblioteca para gerar novos orçamentos.');
  };

  const excluirPreset = (id: string) => {
    const alvo = presets.find(p => p.id === id);
    const nome = alvo ? alvo.nome : 'este modelo';

    requestConfirm({
      title: 'Excluir modelo salvo?',
      message: `Deseja remover o modelo "${nome}" dos seus favoritos? Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir Modelo',
      cancelLabel: 'Manter Modelo',
      variant: 'danger',
      onConfirm: () => {
        setPresets(prev => {
          const atualizados = prev.filter(p => p.id !== id);
          try {
            localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(atualizados));
          } catch (e) {
            console.error('Erro ao excluir preset', e);
          }
          return atualizados;
        });
        notify(`Modelo "${nome}" excluído`, 'info', 'O modelo não aparecerá mais nos atalhos da biblioteca.');
      }
    });
  };

  const carregarPresetNoSimulador = (preset: PresetEstilo) => {
    let largura = 300;
    let altura = 220;
    if (preset.tipo === 'corrimao') {
      largura = 350;
      altura = 95;
    } else if (preset.tipo === 'guarda-corpo') {
      largura = 400;
      altura = 110;
    } else if (preset.tipo === 'grade') {
      largura = 200;
      altura = 150;
    } else if (preset.tipo === 'portao') {
      largura = 320;
      altura = 230;
    }

    setEditingConfig({
      tipo: preset.tipo,
      genes: preset.genes,
      dimensoes: { largura, altura },
      corHex: preset.corHex,
      corNome: preset.corNome,
      presetAtivoId: preset.id
    });

    setViewMode('simulador');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify(`Modelo "${preset.nome}" carregado`, 'info', 'Ajuste medidas e acabamento conforme a necessidade.');
  };

  const salvarPecaOrcamentoComoPreset = (orc: OrçamentoItem) => {
    const novoPreset: PresetEstilo = {
      id: `preset-${Date.now().toString().slice(-6)}`,
      nome: `Estilo ${orc.clienteNome.split(' ')[0]} - ${orc.tipo.charAt(0).toUpperCase() + orc.tipo.slice(1)}`,
      tipo: orc.tipo,
      genes: { ...orc.genes },
      corHex: orc.corHex,
      corNome: orc.corNome,
      dataCriacao: new Date().toISOString().split('T')[0],
      descricao: `Padrão aprovado no orçamento #${orc.id} (${orc.clienteNome}). ${orc.genes.familia} com barras de ${orc.genes.espessura}cm`,
      tags: ['Cliente', orc.tipo, orc.genes.familia],
      isCustom: true
    };
    salvarPreset(novoPreset);
  };

  const criarOrcamentoRapidoComPreset = (preset: PresetEstilo) => {
    let largura = 300;
    let altura = 220;
    if (preset.tipo === 'corrimao') {
      largura = 350;
      altura = 95;
    } else if (preset.tipo === 'guarda-corpo') {
      largura = 400;
      altura = 110;
    } else if (preset.tipo === 'grade') {
      largura = 200;
      altura = 150;
    } else if (preset.tipo === 'portao') {
      largura = 320;
      altura = 230;
    }

    const metricas = calcularMetricas(preset.tipo, preset.genes, { largura, altura });
    const novoOrc: OrçamentoItem = {
      id: `orc-${Date.now().toString().slice(-4)}`,
      clienteNome: `Cliente Modelo ${preset.nome.split(' ')[0]}`,
      clienteTelefone: '(11) 98765-4321',
      clienteEmail: 'contato@cliente.com.br',
      endereco: 'Rua das Indústrias, 450 - São Paulo - SP',
      tipo: preset.tipo,
      descricao: `${preset.tipo.toUpperCase()} baseado no estilo favorito "${preset.nome}"`,
      dimensoes: { largura, altura },
      genes: { ...preset.genes },
      corHex: preset.corHex,
      corNome: preset.corNome,
      valor: metricas.precoVendaSugerido,
      custoPrevisto: metricas.custoTotalProducao,
      dataCriacao: new Date().toISOString().split('T')[0],
      validadeDias: 15,
      status: 'pendente',
      diasSemResposta: 0
    };

    setOrcamentos(prev => [novoOrc, ...prev]);
    setActiveTab('orcamentos');
    setViewMode('erp');
    notify(`Orçamento #${novoOrc.id} criado`, 'success', `Proposta de R$ ${novoOrc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pronta para envio.`);
  };

  // Ações de Orçamento
  const aprovarOrcamento = (id: string) => {
    const alvo = orcamentos.find(o => o.id === id);
    setOrcamentos(prev =>
      prev.map(orc =>
        orc.id === id
          ? { ...orc, status: 'aprovado', diasSemResposta: 0, dataAprovacao: new Date().toISOString().split('T')[0] }
          : orc
      )
    );
    notify(
      'Orçamento aprovado',
      'success',
      alvo ? `Proposta de ${alvo.clienteNome} aprovada. Você já pode enviar para produção.` : 'Proposta aprovada com sucesso.'
    );
  };

  const excluirOrcamento = (id: string) => {
    const alvo = orcamentos.find(o => o.id === id);
    const nomeCliente = alvo ? alvo.clienteNome : 'este orçamento';

    requestConfirm({
      title: 'Excluir este orçamento?',
      message: `Deseja excluir o orçamento #${id} de "${nomeCliente}" no valor de R$ ${alvo?.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}? Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir Orçamento',
      cancelLabel: 'Manter Orçamento',
      variant: 'danger',
      onConfirm: () => {
        setOrcamentos(prev => prev.filter(o => o.id !== id));
        notify(`Orçamento #${id} excluído`, 'info', `A proposta de ${nomeCliente} foi removida.`);
      }
    });
  };

  const converterEmOS = (orc: OrçamentoItem) => {
    const novaOS: OrdemServico = {
      id: `os-${Date.now().toString().slice(-4)}`,
      numeroOS: `OS-2026-${Math.floor(Math.random() * 800 + 100)}`,
      clienteNome: orc.clienteNome,
      clienteTelefone: orc.clienteTelefone,
      clienteEndereco: orc.endereco,
      tipo: orc.tipo,
      titulo: orc.descricao,
      dimensoes: orc.dimensoes,
      genes: orc.genes,
      corHex: orc.corHex,
      corNome: orc.corNome,
      perfilMaterial: 'Metalon 50x30 + Barras Internas Conforme CAD',
      status: 'cortando', // Já inicia na primeira etapa produtiva direta
      dataCriacao: new Date().toISOString().split('T')[0],
      dataPrometida: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      prazoApertado: false,
      valorTotal: orc.valor,
      valorEntrada: orc.valor * 0.5,
      valorRestante: orc.valor * 0.5,
      custoReal: orc.custoPrevisto,
      responsavelCorte: 'Carlos Mendes',
      responsavelSolda: 'Valter Silva (MIG)',
      responsavelPintura: 'Marcos Epóxi',
      checklist: [
        { id: 'ck-1', descricao: 'Conferência técnica das medidas no local', concluido: true },
        { id: 'ck-2', descricao: 'Corte das barras e esquadrejamento 45°', concluido: false },
        { id: 'ck-3', descricao: 'Montagem na bancada de ponteamento', concluido: false },
        { id: 'ck-4', descricao: 'Cordão de solda contínuo estrutural', concluido: false },
        { id: 'ck-5', descricao: 'Acabamento com flap e banho desengraxante', concluido: false },
        { id: 'ck-6', descricao: 'Pintura eletrostática poliéster a pó', concluido: false },
      ],
      observacoes: 'Ordem gerada automaticamente a partir de orçamento aprovado.'
    };

    setOrdensServico(prev => [novaOS, ...prev]);
    setOrcamentos(prev => prev.map(o => (o.id === orc.id ? { ...o, status: 'convertido_os' } : o)));

    // Baixa automática de material (Item 21)
    setEstoque(prev =>
      prev.map(item => {
        if (item.categoria === 'metalon') {
          return { ...item, quantidadeAtual: Math.max(0, item.quantidadeAtual - 4) };
        }
        return item;
      })
    );

    setActiveTab('producao');
    notify(
      `Pedido #${novaOS.numeroOS} enviado para a oficina`,
      'success',
      'Iniciada etapa de corte dos perfis com baixa de estoque registrada.'
    );
  };

  const avancarStatusOS = (osId: string) => {
    const fluxo: OrdemServico['status'][] = ['aguardando', 'cortando', 'soldando', 'pintando', 'pronto', 'instalado'];
    const osAlvo = ordensServico.find(o => o.id === osId);
    let nextStatus: OrdemServico['status'] = 'pronto';

    setOrdensServico(prev =>
      prev.map(os => {
        if (os.id !== osId) return os;
        const currIdx = fluxo.indexOf(os.status);
        nextStatus = fluxo[Math.min(fluxo.length - 1, currIdx + 1)];
        return { ...os, status: nextStatus };
      })
    );

    const nomesEtapas: Record<string, string> = {
      cortando: 'Cortando perfis',
      soldando: 'Solda & Montagem',
      pintando: 'Pintura Eletrostática',
      pronto: 'Pronto para Instalação',
      instalado: 'Instalado & Entregue'
    };

    notify(
      `Pedido #${osAlvo?.numeroOS || osId} avançado`,
      'success',
      `Nova etapa na oficina: ${nomesEtapas[nextStatus] || nextStatus}.`
    );
  };

  const toggleChecklistOS = (osId: string, checkId: string) => {
    setOrdensServico(prev =>
      prev.map(os => {
        if (os.id !== osId) return os;
        const newChecklist = os.checklist.map(item =>
          item.id === checkId ? { ...item, concluido: !item.concluido } : item
        );
        return { ...os, checklist: newChecklist };
      })
    );
  };

  const reabastecerEstoque = (itemId: string, quantidade = 15) => {
    const item = estoque.find(e => e.id === itemId);
    setEstoque(prev =>
      prev.map(i =>
        i.id === itemId
          ? { ...i, quantidadeAtual: i.quantidadeAtual + quantidade }
          : i
      )
    );
    notify(
      'Estoque abastecido',
      'success',
      `Adicionadas ${quantidade} unidades de "${item?.nome || 'material'}".`
    );
  };

  const editarPecaNoSimulador = (orcamento: OrçamentoItem) => {
    setEditingConfig({
      tipo: orcamento.tipo,
      genes: orcamento.genes,
      dimensoes: orcamento.dimensoes,
      corHex: orcamento.corHex,
      corNome: orcamento.corNome,
      orcamentoId: orcamento.id,
      clienteNome: orcamento.clienteNome
    });

    setViewMode('simulador');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify('Desenho aberto no simulador', 'info', 'Modifique medidas, barras ou acabamento da peça.');
  };

  const abrirNovoOrcamentoSimulador = () => {
    setEditingConfig(null);
    setViewMode('simulador');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify('Novo desenho iniciado', 'info', 'Defina as medidas e acabamento para calcular a proposta.');
  };

  const salvarOrcamentoDoSimulador = (dados: {
    tipo: TipoPeca;
    genes: GenesPeca;
    dimensoes: DimensoesPeca;
    corHex: string;
    corNome: string;
    valor: number;
    custoPrevisto: number;
    orcamentoId?: string;
  }) => {
    if (dados.orcamentoId) {
      // Atualizar existente mantendo integridade
      setOrcamentos(prev =>
        prev.map(orc => {
          if (orc.id === dados.orcamentoId) {
            return {
              ...orc,
              tipo: dados.tipo,
              genes: dados.genes,
              dimensoes: dados.dimensoes,
              corHex: dados.corHex,
              corNome: dados.corNome,
              valor: dados.valor,
              custoPrevisto: dados.custoPrevisto,
              descricao: `${dados.tipo.toUpperCase()} ${dados.dimensoes.largura}x${dados.dimensoes.altura}cm sob medida com acabamento ${dados.corNome}`,
              diasSemResposta: 0
            };
          }
          return orc;
        })
      );
      notify(`Orçamento #${dados.orcamentoId} atualizado`, 'success', `Novo valor de R$ ${dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} salvo com precisão.`);
    } else {
      // Criar novo
      const novoOrc: OrçamentoItem = {
        id: `orc-${Date.now().toString().slice(-4)}`,
        clienteNome: 'Novo Cliente Interessado',
        clienteTelefone: '(11) 99888-7766',
        clienteEmail: 'cliente@exemplo.com.br',
        endereco: 'Av. Paulista, 1000 - São Paulo - SP',
        tipo: dados.tipo,
        descricao: `${dados.tipo.toUpperCase()} sob medida com acabamento ${dados.corNome}`,
        dimensoes: dados.dimensoes,
        genes: dados.genes,
        corHex: dados.corHex,
        corNome: dados.corNome,
        valor: dados.valor,
        custoPrevisto: dados.custoPrevisto,
        dataCriacao: new Date().toISOString().split('T')[0],
        validadeDias: 15,
        status: 'pendente',
        diasSemResposta: 0
      };
      setOrcamentos(prev => [novoOrc, ...prev]);
      notify(`Orçamento #${novoOrc.id} criado`, 'success', `Proposta de R$ ${novoOrc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pronta para envio.`);
    }

    setEditingConfig(null);
    setViewMode('erp');
    setActiveTab('orcamentos');
  };

  const adicionarOrcamento = (novoOrc: OrçamentoItem) => {
    setOrcamentos(prev => [novoOrc, ...prev]);
  };

  const enviarWhatsApp = (orc: OrçamentoItem) => {
    const texto = encodeURIComponent(
      `Olá, ${orc.clienteNome}! Aqui é da Serralheria ForjaOS.\n\n` +
      `Conforme conversamos, preparamos o orçamento do seu ${orc.tipo.toUpperCase()} sob medida (${orc.dimensoes.largura}x${orc.dimensoes.altura}cm).\n` +
      `💰 Valor Total: R$ ${orc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `✨ Acabamento: ${orc.corNome}\n` +
      `🛡️ Garantia estrutural de 5 anos.\n\n` +
      `Você pode aprovar com 1 clique acessando o link do projeto.`
    );
    const link = document.createElement('a');
    link.href = `https://wa.me/55${orc.clienteTelefone.replace(/\D/g, '')}?text=${texto}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Canal do WhatsApp aberto', 'success', `Proposta formatada preparada para ${orc.clienteNome}.`);
  };

  const openSignatureModal = (id: string, tipo: 'orcamento' | 'instalacao') => {
    setSelectedDocForSignature({ id, tipo });
    setSignatureModalOpen(true);
  };

  const closeSignatureModal = () => {
    setSignatureModalOpen(false);
    setSelectedDocForSignature(null);
  };

  const saveSignature = (sigUrl: string) => {
    if (!selectedDocForSignature) return;

    if (selectedDocForSignature.tipo === 'orcamento') {
      setOrcamentos(prev =>
        prev.map(o =>
          o.id === selectedDocForSignature.id
            ? { ...o, assinaturaDigital: sigUrl, status: 'aprovado', dataAprovacao: new Date().toISOString().split('T')[0] }
            : o
        )
      );
      notify('Assinatura registrada', 'success', 'Orçamento autenticado e aprovado pelo cliente.');
    } else {
      setInstalacoes(prev =>
        prev.map(i =>
          i.id === selectedDocForSignature.id
            ? { ...i, assinaturaEntrega: sigUrl, status: 'concluido' }
            : i
        )
      );
      notify('Instalação concluída', 'success', 'Termo de entrega técnica assinado pelo cliente.');
    }
    closeSignatureModal();
  };

  const openReceiptModal = (doc: OrdemServico | OrçamentoItem, tipo: 'os' | 'orcamento', modoInicial: 'proposta' | 'ficha_corte' = 'proposta') => {
    setDocForReceipt({ doc, tipo, modoInicial });
    setReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setDocForReceipt(null);
  };

  return (
    <SerralheriaContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        orcamentos,
        ordensServico,
        estoque,
        instalacoes,
        transacoes,
        presets,
        buscaOrcamentos,
        setBuscaOrcamentos,
        filtroStatusOrcamento,
        setFiltroStatusOrcamento,
        modoSimplificado,
        setModoSimplificado,
        toggleModoSimplificado,
        editingConfig,
        setEditingConfig,
        signatureModalOpen,
        selectedDocForSignature,
        receiptModalOpen,
        docForReceipt,
        toasts,
        notify,
        dismissToast,
        confirmDialog,
        requestConfirm,
        closeConfirm,
        aprovarOrcamento,
        excluirOrcamento,
        converterEmOS,
        avancarStatusOS,
        toggleChecklistOS,
        reabastecerEstoque,
        salvarPreset,
        excluirPreset,
        carregarPresetNoSimulador,
        salvarPecaOrcamentoComoPreset,
        editarPecaNoSimulador,
        salvarOrcamentoDoSimulador,
        criarOrcamentoRapidoComPreset,
        enviarWhatsApp,
        openSignatureModal,
        closeSignatureModal,
        saveSignature,
        openReceiptModal,
        closeReceiptModal,
        abrirNovoOrcamentoSimulador,
        adicionarOrcamento
      }}
    >
      {children}
    </SerralheriaContext.Provider>
  );
};

export const useSerralheria = () => {
  const context = useContext(SerralheriaContext);
  if (!context) {
    throw new Error('useSerralheria deve ser usado dentro de um SerralheriaProvider');
  }
  return context;
};
