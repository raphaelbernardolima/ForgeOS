import React from 'react';
import {
  FileSpreadsheet,
  Kanban,
  Package,
  DollarSign,
  Truck,
  Users,
  Eye,
  Sliders,
  Globe,
  Plus,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { useSerralheria, WorkspaceTab } from '../../context/SerralheriaContext';

export const AppHeader: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    ordensServico,
    orcamentos,
    estoque,
    abrirNovoOrcamentoSimulador,
    setEditingConfig
  } = useSerralheria();

  const emProducao = ordensServico.filter(os => os.status !== 'pronto' && os.status !== 'instalado').length;
  const orcamentosPendentes = orcamentos.filter(o => o.status === 'pendente').length;
  const estoqueAlerta = estoque.filter(e => e.quantidadeAtual <= e.estoqueMinimo).length;

  const abasPrincipais: { id: WorkspaceTab; label: string; icon: any; count?: number; alert?: boolean }[] = [
    { id: 'orcamentos', label: 'Orçamentos', icon: FileSpreadsheet, count: orcamentosPendentes },
    { id: 'producao', label: 'Produção', icon: Kanban, count: emProducao },
    { id: 'estoque', label: 'Estoque', icon: Package, count: estoqueAlerta > 0 ? estoqueAlerta : undefined, alert: estoqueAlerta > 0 },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'instalacao', label: 'Instalação', icon: Truck },
    { id: 'clientes', label: 'Clientes & Equipe', icon: Users },
    { id: 'portal', label: 'Portal do Cliente', icon: Eye }
  ];

  const handleSelectTab = (tabId: WorkspaceTab) => {
    setActiveTab(tabId);
    if (viewMode !== 'erp') {
      setViewMode('erp');
    }
  };

  return (
    <header className="border-b border-neutral-800/80 bg-[#0c0e14]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zona 1: Marca Limpa & Profissional */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setEditingConfig(null);
              setViewMode('erp');
              setActiveTab('orcamentos');
            }}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-neutral-950 font-black shadow-sm group-hover:bg-amber-400 transition-colors">
              <Flame className="w-4 h-4 fill-neutral-950 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-display font-black text-white tracking-tight">
                  FORJA<span className="text-amber-400">OS</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">ERP</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5 hidden sm:block">
                Serralheria & Estruturas
              </p>
            </div>
          </button>
        </div>

        {/* Zona 2: Navegação Direta de Abas (Modo ERP) ou Breadcrumb de Retorno */}
        {viewMode === 'erp' ? (
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
            {abasPrincipais.map(aba => {
              const Icon = aba.icon;
              const isAtiva = activeTab === aba.id;

              return (
                <button
                  key={aba.id}
                  onClick={() => handleSelectTab(aba.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isAtiva
                      ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isAtiva ? 'text-amber-400' : 'text-neutral-400'}`} />
                  <span>{aba.label}</span>
                  {aba.count !== undefined && aba.count > 0 && (
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                        aba.alert
                          ? 'bg-red-500/20 text-red-300'
                          : isAtiva
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {aba.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingConfig(null);
                setViewMode('erp');
              }}
              className="flex items-center gap-2 text-xs text-neutral-300 hover:text-amber-400 px-3 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 border border-neutral-700/80 transition-all cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Painel ERP</span>
            </button>
            <span className="text-xs text-neutral-400 hidden sm:inline">
              {viewMode === 'simulador' ? 'Estúdio de Desenho CAD 2D' : 'Apresentação Comercial'}
            </span>
          </div>
        )}

        {/* Zona 3: Ferramentas & Ação Primária */}
        <div className="flex items-center gap-2 shrink-0">
          {viewMode === 'erp' && (
            <>
              {/* Atalho para o Simulador CAD */}
              <button
                onClick={() => setViewMode('simulador')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
                title="Abrir estúdio de simulação e desenho paramétrico 2D"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulador CAD</span>
              </button>

              {/* Atalho para Landing Comercial */}
              <button
                onClick={() => setViewMode('landing')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 rounded-lg transition-colors cursor-pointer"
                title="Visualizar a página comercial de captação de clientes"
              >
                <Globe className="w-3.5 h-3.5 text-neutral-400" />
                <span>Apresentação</span>
              </button>
            </>
          )}

          {/* CTA Principal Descomplicado */}
          <button
            onClick={abrirNovoOrcamentoSimulador}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold rounded-lg text-xs sm:text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Orçamento</span>
            <span className="sm:hidden">+ Novo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
