import React from 'react';
import {
  FileSpreadsheet,
  Kanban,
  Package,
  Truck,
  DollarSign,
  Users,
  Eye
} from 'lucide-react';
import { useSerralheria, WorkspaceTab } from '../../context/SerralheriaContext';

export const WorkspaceNav: React.FC = () => {
  const { activeTab, setActiveTab, orcamentos, ordensServico, estoque, instalacoes } = useSerralheria();

  const tabs: { id: WorkspaceTab; label: string; count?: number; icon: any; alertBadge?: boolean }[] = [
    { id: 'orcamentos', label: 'Orçamentos & Vendas', count: orcamentos.length, icon: FileSpreadsheet },
    { id: 'producao', label: 'Quadro de Produção', count: ordensServico.length, icon: Kanban },
    { id: 'estoque', label: 'Estoque & Cortes', count: estoque.filter(e => e.quantidadeAtual <= e.estoqueMinimo).length, icon: Package, alertBadge: true },
    { id: 'instalacao', label: 'Instalação & Campo', count: instalacoes.length, icon: Truck },
    { id: 'financeiro', label: 'Financeiro & Margem', icon: DollarSign },
    { id: 'clientes', label: 'Clientes & Equipe', icon: Users },
    { id: 'portal', label: 'Portal do Cliente (Live)', icon: Eye }
  ];

  return (
    <div className="border-b border-neutral-800 bg-[#0d1017]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2.5 text-xs font-mono scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/40 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono tabular-nums ${
                    tab.alertBadge && tab.count > 0
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                      : isActive
                      ? 'bg-amber-500/25 text-amber-200'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
