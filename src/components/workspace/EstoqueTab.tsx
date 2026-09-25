import React, { useState } from 'react';
import {
  Scissors,
  Package,
  Plus,
  Search,
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useSerralheria } from '../../context/SerralheriaContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export const EstoqueTab: React.FC = () => {
  const { estoque, reabastecerEstoque } = useSerralheria();

  const [buscaEstoque, setBuscaEstoque] = useState<string>('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');
  const [mostrarOtimizador, setMostrarOtimizador] = useState<boolean>(false);

  // Filtros em tempo real
  const itensFiltrados = estoque.filter(item => {
    const isCritico = item.quantidadeAtual <= item.estoqueMinimo;

    let matchCat = true;
    if (categoriaAtiva === 'critico') {
      matchCat = isCritico;
    } else if (categoriaAtiva !== 'todos') {
      matchCat = item.categoria === categoriaAtiva;
    }

    const termo = buscaEstoque.toLowerCase().trim();
    const matchBusca =
      !termo ||
      item.nome.toLowerCase().includes(termo) ||
      item.codigo.toLowerCase().includes(termo) ||
      item.fornecedorPrincipal.toLowerCase().includes(termo);

    return matchCat && matchBusca;
  });

  const contadores = {
    todos: estoque.length,
    critico: estoque.filter(e => e.quantidadeAtual <= e.estoqueMinimo).length,
    metalon: estoque.filter(e => e.categoria === 'metalon').length,
    chapa: estoque.filter(e => e.categoria === 'chapa').length,
    consumivel: estoque.filter(e => e.categoria === 'consumivel' || e.categoria === 'cantoneira' || e.categoria === 'barra').length
  };

  return (
    <div className="space-y-6">
      {/* Topo Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Controle de Estoque & Materiais
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Saldos de metalon, chapas, tintas e insumos com alerta automático de reposição.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarOtimizador(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              mostrarOtimizador
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{mostrarOtimizador ? 'Ocultar Otimizador' : 'Otimizador de Corte 6m'}</span>
          </button>
        </div>
      </div>

      {/* Otimizador de Barras de 6m (Opcional, sob demanda) */}
      {mostrarOtimizador && (
        <div className="bg-[#11141c] border border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-white">
                Simulação de Corte em Barra Padrão (6,00 m)
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Aproveitamento: 98,4% (sobra 10 cm)
            </span>
          </div>

          <div className="h-9 w-full bg-neutral-900 border border-neutral-800 rounded-lg flex overflow-hidden p-1 gap-1">
            <div
              style={{ width: `${(220 / 600) * 100}%` }}
              className="bg-amber-600/90 rounded flex items-center justify-center text-[11px] font-mono text-white font-medium"
            >
              220cm Montante
            </div>
            <div
              style={{ width: `${(220 / 600) * 100}%` }}
              className="bg-amber-600/90 rounded flex items-center justify-center text-[11px] font-mono text-white font-medium"
            >
              220cm Montante
            </div>
            <div
              style={{ width: `${(150 / 600) * 100}%` }}
              className="bg-amber-500/90 rounded flex items-center justify-center text-[11px] font-mono text-neutral-950 font-bold"
            >
              150cm Travessa
            </div>
            <div
              style={{ width: `${(10 / 600) * 100}%` }}
              className="bg-neutral-700 rounded flex items-center justify-center text-[9px] font-mono text-neutral-400"
              title="Perda: 10cm"
            >
              10cm
            </div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d1017] p-2.5 rounded-xl border border-neutral-800/80">
        
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar material, código ou fornecedor..."
            value={buscaEstoque}
            onChange={(e) => setBuscaEstoque(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {buscaEstoque && (
            <button
              onClick={() => setBuscaEstoque('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categorias */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900/80 rounded-lg border border-neutral-800/60 overflow-x-auto scrollbar-none">
          {[
            { id: 'todos', label: 'Todos', count: contadores.todos },
            { id: 'critico', label: 'Para Repor', count: contadores.critico, alert: contadores.critico > 0 },
            { id: 'metalon', label: 'Metalon', count: contadores.metalon },
            { id: 'chapa', label: 'Chapas', count: contadores.chapa },
            { id: 'consumivel', label: 'Insumos', count: contadores.consumivel }
          ].map(f => {
            const isSelected = categoriaAtiva === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setCategoriaAtiva(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] font-mono tabular-nums ${f.alert ? 'text-amber-400 font-bold' : 'opacity-75'}`}>
                  ({f.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabela de Estoque Limpa */}
      <div className="bg-[#11141c] border border-neutral-800/80 rounded-xl overflow-hidden">
        {itensFiltrados.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Package className="w-6 h-6" />}
              title="Nenhum material encontrado"
              description="Nenhum item corresponde ao filtro ou busca."
              actionLabel="Ver Todos os Materiais"
              onAction={() => {
                setBuscaEstoque('');
                setCategoriaAtiva('todos');
              }}
            />
          </div>
        ) : (
          <>
            {/* Visão Mobile: Cards Grandes Touch-Friendly (Zero Esmagamento de Tabela) */}
            <div className="md:hidden divide-y divide-neutral-800/60">
              {itensFiltrados.map(item => {
                const isBaixo = item.quantidadeAtual <= item.estoqueMinimo;
                return (
                  <div key={item.id} className="p-3.5 space-y-2.5 bg-[#11141c]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono text-amber-400 font-bold block">{item.codigo}</span>
                        <h4 className="text-sm font-bold text-white leading-snug">{item.nome}</h4>
                        <span className="text-xs text-neutral-400 block mt-0.5">{item.fornecedorPrincipal}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-neutral-400 block font-mono">Saldo Atual</span>
                        <span className={`text-base font-bold font-mono tabular-nums block ${isBaixo ? 'text-amber-400' : 'text-white'}`}>
                          {item.quantidadeAtual} {item.unidade.replace('_', ' ')}
                        </span>
                        {isBaixo && (
                          <span className="text-[11px] font-mono text-amber-400 flex items-center justify-end gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Mínimo: {item.estoqueMinimo}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/50 flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-neutral-300">
                        Custo: R$ {item.custoUnitario.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => reabastecerEstoque(item.id, 10)}
                        className="min-h-[44px] px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Repor 10 un</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visão Desktop: Tabela Completa */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0e1118] text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4 font-medium">Código</th>
                    <th className="py-3 px-4 font-medium">Material</th>
                    <th className="py-3 px-4 font-medium">Categoria</th>
                    <th className="py-3 px-4 font-medium text-right">Saldo</th>
                    <th className="py-3 px-4 font-medium text-right">Mínimo</th>
                    <th className="py-3 px-4 font-medium text-right">Custo Un.</th>
                    <th className="py-3 px-4 font-medium">Fornecedor</th>
                    <th className="py-3 px-4 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {itensFiltrados.map(item => {
                    const isBaixo = item.quantidadeAtual <= item.estoqueMinimo;
                    return (
                      <tr key={item.id} className="hover:bg-neutral-800/20 transition-colors">
                        <td className="py-3 px-4 font-mono text-neutral-400">
                          {item.codigo}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          {item.nome}
                        </td>
                        <td className="py-3 px-4 capitalize text-neutral-400">
                          {item.categoria}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                          {isBaixo ? (
                            <span className="text-amber-400 flex items-center justify-end gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {item.quantidadeAtual} {item.unidade.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="text-neutral-200">
                              {item.quantidadeAtual} {item.unidade.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-500">
                          {item.estoqueMinimo}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-300">
                          R$ {item.custoUnitario.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-neutral-400">
                          {item.fornecedorPrincipal}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={isBaixo ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => reabastecerEstoque(item.id, 10)}
                            className="py-1 px-2.5 text-xs min-h-[30px]"
                          >
                            +10 un
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
