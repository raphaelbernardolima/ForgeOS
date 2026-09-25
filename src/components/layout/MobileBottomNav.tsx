import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Kanban,
  Package,
  DollarSign,
  Menu,
  X,
  Truck,
  Users,
  Eye,
  Sliders,
  Globe,
  Plus
} from 'lucide-react';
import { useSerralheria, WorkspaceTab } from '../../context/SerralheriaContext';

export const MobileBottomNav: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    orcamentos,
    ordensServico,
    estoque,
    abrirNovoOrcamentoSimulador
  } = useSerralheria();

  const [menuMaisAberto, setMenuMaisAberto] = useState<boolean>(false);

  const orcamentosPendentes = orcamentos.filter(o => o.status === 'pendente').length;
  const emProducao = ordensServico.filter(os => os.status !== 'pronto' && os.status !== 'instalado').length;
  const estoqueCritico = estoque.filter(e => e.quantidadeAtual <= e.estoqueMinimo).length;

  const handleSelectTab = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    if (viewMode !== 'erp') {
      setViewMode('erp');
    }
    setMenuMaisAberto(false);
  };

  const navItems = [
    {
      id: 'orcamentos' as WorkspaceTab,
      label: 'Orçamentos',
      icon: FileSpreadsheet,
      badge: orcamentosPendentes > 0 ? orcamentosPendentes : undefined
    },
    {
      id: 'producao' as WorkspaceTab,
      label: 'Fábrica',
      icon: Kanban,
      badge: emProducao > 0 ? emProducao : undefined
    },
    {
      id: 'estoque' as WorkspaceTab,
      label: 'Estoque',
      icon: Package,
      badge: estoqueCritico > 0 ? '!' : undefined,
      alert: estoqueCritico > 0
    },
    {
      id: 'financeiro' as WorkspaceTab,
      label: 'Caixa',
      icon: DollarSign
    }
  ];

  return (
    <>
      {/* Bottom Sheet com opções adicionais (Instalações, Clientes, Ferramentas) */}
      {menuMaisAberto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-xs flex flex-col justify-end animate-in fade-in"
          onClick={() => setMenuMaisAberto(false)}
        >
          <div
            className="bg-[#121520] border-t border-neutral-700/80 rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-10 h-1.5 bg-neutral-600 rounded-full mx-auto" />

            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Outras Funções da Oficina</h3>
                <p className="text-xs text-neutral-400">Atalhos rápidos para o dia a dia</p>
              </div>
              <button
                onClick={() => setMenuMaisAberto(false)}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSelectTab('instalacao')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-colors ${
                  activeTab === 'instalacao' && viewMode === 'erp'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Truck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold mt-1">Instalação & Campo</span>
                <span className="text-[10px] text-neutral-400">Rotas e entrega final</span>
              </button>

              <button
                onClick={() => handleSelectTab('clientes')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-colors ${
                  activeTab === 'clientes' && viewMode === 'erp'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Users className="w-5 h-5 text-sky-400" />
                <span className="text-xs font-bold mt-1">Clientes & Equipe</span>
                <span className="text-[10px] text-neutral-400">Histórico de compras</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('simulador');
                  setMenuMaisAberto(false);
                }}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-colors ${
                  viewMode === 'simulador'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Sliders className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold mt-1">Simulador CAD 2D</span>
                <span className="text-[10px] text-neutral-400">Desenhar e orçar portão</span>
              </button>

              <button
                onClick={() => handleSelectTab('portal')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-colors ${
                  activeTab === 'portal' && viewMode === 'erp'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Eye className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold mt-1">Link do Cliente</span>
                <span className="text-[10px] text-neutral-400">Ver rastreio do cliente</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setMenuMaisAberto(false);
                  abrirNovoOrcamentoSimulador();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Criar Novo Orçamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegação Inferior Fixa para Mobile (Zona Natural do Polegar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-t border-neutral-800/90 shadow-2xl pb-safe">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isAtiva = viewMode === 'erp' && activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors cursor-pointer select-none active:scale-95 ${
                  isAtiva
                    ? 'text-amber-400 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isAtiva ? 'text-amber-400' : 'text-neutral-400'}`} />
                  {item.badge !== undefined && (
                    <span
                      className={`absolute -top-1 -right-2 text-[9px] font-mono font-bold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center ${
                        item.alert
                          ? 'bg-red-500 text-white'
                          : isAtiva
                          ? 'bg-amber-400 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Botão de Menu Mais / Outras Telas */}
          <button
            onClick={() => setMenuMaisAberto(prev => !prev)}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors cursor-pointer select-none active:scale-95 ${
              menuMaisAberto || (viewMode === 'erp' && (activeTab === 'instalacao' || activeTab === 'clientes' || activeTab === 'portal'))
                ? 'text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 font-medium">
              Mais
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
