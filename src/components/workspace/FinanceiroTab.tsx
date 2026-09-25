import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Search,
  X,
  Wallet
} from 'lucide-react';
import { useSerralheria } from '../../context/SerralheriaContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export const FinanceiroTab: React.FC = () => {
  const { transacoes, notify } = useSerralheria();
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'entrada' | 'saida'>('todas');
  const [busca, setBusca] = useState<string>('');

  // Modal de novo lançamento
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [desc, setDesc] = useState<string>('');
  const [valorInput, setValorInput] = useState<string>('');
  const [tipoMov, setTipoMov] = useState<'entrada' | 'saida'>('entrada');
  const [categoria, setCategoria] = useState<string>('material');

  const totalEntradas = transacoes
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalSaidas = transacoes
    .filter(t => t.tipo === 'saida')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  const transacoesFiltradas = transacoes.filter(tr => {
    const matchTipo = filtroTipo === 'todas' || tr.tipo === filtroTipo;
    const termo = busca.toLowerCase().trim();
    const matchBusca =
      !termo ||
      tr.descricao.toLowerCase().includes(termo) ||
      tr.categoria.toLowerCase().includes(termo);
    return matchTipo && matchBusca;
  });

  const handleSalvarMovimentacao = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(valorInput.replace(',', '.'));
    if (!desc.trim()) {
      notify('Descrição obrigatória', 'warning', 'Informe a descrição do lançamento.');
      return;
    }
    if (isNaN(num) || num <= 0) {
      notify('Valor inválido', 'warning', 'Digite um valor numérico positivo.');
      return;
    }

    notify(
      'Movimentação registrada',
      'success',
      `${tipoMov === 'entrada' ? 'Recebimento' : 'Despesa'} de R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} lançado no caixa.`
    );
    setDesc('');
    setValorInput('');
    setModalAberto(false);
  };

  return (
    <div className="space-y-6">
      {/* Topo Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Financeiro & Fluxo de Caixa
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Recebimentos de clientes, compras de aço e margem operacional da fábrica.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setModalAberto(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          size="sm"
        >
          Novo Lançamento
        </Button>
      </div>

      {/* 3 Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#11141c] border border-neutral-800/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Receitas do Período</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400 tabular-nums">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-neutral-500 block">
            Sinais de 50% e quitações na entrega
          </span>
        </div>

        <div className="bg-[#11141c] border border-neutral-800/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Despesas & Materiais</span>
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-red-400 tabular-nums">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-neutral-500 block">
            Aço, eletrodos, discos e pintura
          </span>
        </div>

        <div className="bg-[#11141c] border border-neutral-800/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Saldo Líquido</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white tabular-nums">
            R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-400 block font-mono">
            Margem Operacional Estimada: ~54%
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d1017] p-2.5 rounded-xl border border-neutral-800/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 bg-neutral-900/80 rounded-lg border border-neutral-800/60">
          {(['todas', 'entrada', 'saida'] as const).map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroTipo === tipo
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tipo === 'todas' ? 'Todas' : tipo === 'entrada' ? 'Receitas (+)' : 'Despesas (-)'}
            </button>
          ))}
        </div>
      </div>

      {/* Extrato de Transações */}
      <div className="bg-[#11141c] border border-neutral-800/80 rounded-xl overflow-hidden">
        {transacoesFiltradas.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<DollarSign className="w-6 h-6" />}
              title="Nenhuma movimentação encontrada"
              description="Nenhum lançamento corresponde ao filtro ou busca."
              actionLabel="Ver Todas as Movimentações"
              onAction={() => {
                setBusca('');
                setFiltroTipo('todas');
              }}
            />
          </div>
        ) : (
          <>
            {/* Visão Mobile: Lista de Entradas e Saídas em Cartões Touch-Friendly */}
            <div className="md:hidden divide-y divide-neutral-800/60">
              {transacoesFiltradas.map(tr => (
                <div key={tr.id} className="p-3.5 space-y-1.5 bg-[#11141c]">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white leading-snug">
                      {tr.descricao}
                    </h4>
                    <span className={`text-base font-bold font-mono tabular-nums whitespace-nowrap ${
                      tr.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {tr.tipo === 'entrada' ? '+ ' : '- '} R$ {tr.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span className="capitalize">{tr.categoria.replace('_', ' ')}</span>
                    <span>{tr.data}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visão Desktop: Tabela de Extrato */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0e1118] text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4 font-medium">Data</th>
                    <th className="py-3 px-4 font-medium">Descrição</th>
                    <th className="py-3 px-4 font-medium">Categoria</th>
                    <th className="py-3 px-4 font-medium text-right">Valor</th>
                    <th className="py-3 px-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {transacoesFiltradas.map(tr => (
                    <tr key={tr.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                        {tr.data}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {tr.descricao}
                      </td>
                      <td className="py-3 px-4 capitalize text-neutral-400">
                        {tr.categoria.replace('_', ' ')}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                        tr.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {tr.tipo === 'entrada' ? '+ ' : '- '} R$ {tr.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-mono capitalize text-neutral-300">
                          {tr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Lançamento */}
      {modalAberto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
        >
          <div
            className="w-full max-w-md bg-[#121622] border border-neutral-800 rounded-xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-sm font-semibold text-white">
                Novo Lançamento Financeiro
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarMovimentacao} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoMov('entrada')}
                    className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                      tipoMov === 'entrada'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    Recebimento (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoMov('saida')}
                    className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                      tipoMov === 'saida'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    Despesa (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Sinal 50% Portão Pivotante"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={valorInput}
                    onChange={(e) => setValorInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-mono placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="sinal_cliente">Sinal Cliente</option>
                    <option value="quitacao_cliente">Quitação</option>
                    <option value="material">Metalon & Perfis</option>
                    <option value="consumivel">Consumíveis / Solda</option>
                    <option value="pintura">Pintura Epóxi</option>
                    <option value="folha">Mão de Obra</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                >
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
