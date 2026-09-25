import React from 'react';
import { useSerralheria } from '../context/SerralheriaContext';
import { OrcamentosTab } from './workspace/OrcamentosTab';
import { ProducaoKanbanTab } from './workspace/ProducaoKanbanTab';
import { EstoqueTab } from './workspace/EstoqueTab';
import { InstalacaoTab } from './workspace/InstalacaoTab';
import { FinanceiroTab } from './workspace/FinanceiroTab';
import { ClientesTab } from './workspace/ClientesTab';
import { PortalClienteTab } from './workspace/PortalClienteTab';
import { FileText, Hammer, AlertTriangle, TrendingUp } from 'lucide-react';

export const AppWorkspace: React.FC = () => {
  const { activeTab, orcamentos, ordensServico, estoque, transacoes, setActiveTab } = useSerralheria();

  // Métricas executivas limpas e calmas (visão de 2 segundos)
  const orcamentosAtivos = orcamentos.filter(o => o.status === 'pendente' || o.status === 'aprovado');
  const valorTotalOrcamentos = orcamentosAtivos.reduce((acc, o) => acc + o.valor, 0);

  const emProducao = ordensServico.filter(os => os.status !== 'pronto' && os.status !== 'instalado').length;
  const estoqueCritico = estoque.filter(e => e.quantidadeAtual <= e.estoqueMinimo).length;

  const entradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const saidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldoCaixa = entradas - saidas;

  return (
    <div className="w-full bg-[#090b10] min-h-[calc(100vh-4rem)] text-neutral-200">
      
      {/* Barra de Resumo Executivo: Calma, minimalista e sem poluição visual */}
      <div className="border-b border-neutral-800/60 bg-[#0d1017]/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs font-sans">
            
            {/* Card 1: Orçamentos em Aberto */}
            <button
              onClick={() => setActiveTab('orcamentos')}
              className="text-left group cursor-pointer p-2 rounded-lg hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-neutral-400">
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-medium truncate">Orçamentos Ativos</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base font-semibold text-white font-mono tabular-nums">
                  {orcamentosAtivos.length}
                </span>
                <span className="text-neutral-400 font-mono text-[10px] sm:text-[11px] tabular-nums truncate">
                  · R$ {valorTotalOrcamentos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </button>

            {/* Card 2: Na Fábrica */}
            <button
              onClick={() => setActiveTab('producao')}
              className="text-left group cursor-pointer p-2 rounded-lg hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Hammer className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-[11px] font-medium truncate">Na Fábrica</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base font-semibold text-white font-mono tabular-nums">
                  {emProducao}
                </span>
                <span className="text-neutral-400 text-[10px] sm:text-[11px] truncate">
                  {emProducao === 1 ? 'peça em produção' : 'peças em produção'}
                </span>
              </div>
            </button>

            {/* Card 3: Estoque Crítico */}
            <button
              onClick={() => setActiveTab('estoque')}
              className="text-left group cursor-pointer p-2 rounded-lg hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-neutral-400">
                <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${estoqueCritico > 0 ? 'text-amber-400' : 'text-neutral-500'}`} />
                <span className="text-[11px] font-medium truncate">Estoque Alerta</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                <span className={`text-base font-semibold font-mono tabular-nums ${estoqueCritico > 0 ? 'text-amber-300' : 'text-neutral-300'}`}>
                  {estoqueCritico}
                </span>
                <span className="text-neutral-400 text-[10px] sm:text-[11px] truncate">
                  {estoqueCritico === 0 ? 'níveis normais' : 'itens para repor'}
                </span>
              </div>
            </button>

            {/* Card 4: Saldo em Caixa */}
            <button
              onClick={() => setActiveTab('financeiro')}
              className="text-left group cursor-pointer p-2 rounded-lg hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-neutral-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-medium truncate">Saldo do Caixa</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base font-semibold text-white font-mono tabular-nums">
                  R$ {saldoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* Conteúdo Principal com Espaço Respirável */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'orcamentos' && <OrcamentosTab />}
        {activeTab === 'producao' && <ProducaoKanbanTab />}
        {activeTab === 'estoque' && <EstoqueTab />}
        {activeTab === 'instalacao' && <InstalacaoTab />}
        {activeTab === 'financeiro' && <FinanceiroTab />}
        {activeTab === 'clientes' && <ClientesTab />}
        {activeTab === 'portal' && <PortalClienteTab />}
      </main>
    </div>
  );
};
