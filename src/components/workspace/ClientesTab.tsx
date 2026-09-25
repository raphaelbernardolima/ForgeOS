import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Send,
  Plus,
  Search,
  X,
  Phone,
  Mail,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { useSerralheria } from '../../context/SerralheriaContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export const ClientesTab: React.FC = () => {
  const { orcamentos, ordensServico, abrirNovoOrcamentoSimulador, notify } = useSerralheria();
  const [subAba, setSubAba] = useState<'clientes' | 'equipe'>('clientes');
  const [busca, setBusca] = useState<string>('');

  const membrosEquipe = [
    {
      nome: 'Carlos Mendes',
      cargo: 'Serralheiro Mestre (Corte & Gabarito)',
      horasMes: 164,
      osConcluidas: 14,
      comissao: 1240.00,
      avatar: 'CM',
      status: 'Oficina Ativa'
    },
    {
      nome: 'Valter Silva',
      cargo: 'Soldador TIG / MIG Especialista',
      horasMes: 172,
      osConcluidas: 16,
      comissao: 1580.00,
      avatar: 'VS',
      status: 'Cabine de Solda'
    },
    {
      nome: 'Marcos Epóxi',
      cargo: 'Pintor Eletrostático a Pó',
      horasMes: 158,
      osConcluidas: 15,
      comissao: 1120.00,
      avatar: 'ME',
      status: 'Estufa de Cura'
    },
  ];

  // Extrair clientes únicos da base
  const clientesMap = new Map<string, {
    nome: string;
    telefone: string;
    email: string;
    endereco: string;
    totalGasto: number;
    totalOrcamentos: number;
    totalOS: number;
  }>();

  orcamentos.forEach(orc => {
    const existing = clientesMap.get(orc.clienteNome) || {
      nome: orc.clienteNome,
      telefone: orc.clienteTelefone,
      email: orc.clienteEmail,
      endereco: orc.endereco,
      totalGasto: 0,
      totalOrcamentos: 0,
      totalOS: 0
    };

    existing.totalOrcamentos += 1;
    if (orc.status === 'aprovado' || orc.status === 'convertido_os') {
      existing.totalGasto += orc.valor;
    }
    clientesMap.set(orc.clienteNome, existing);
  });

  ordensServico.forEach(os => {
    const existing = clientesMap.get(os.clienteNome);
    if (existing) {
      existing.totalOS += 1;
    }
  });

  const listaClientes = Array.from(clientesMap.values());

  const clientesFiltrados = listaClientes.filter(c => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return true;
    return (
      c.nome.toLowerCase().includes(termo) ||
      c.telefone.includes(termo) ||
      c.email.toLowerCase().includes(termo) ||
      c.endereco.toLowerCase().includes(termo)
    );
  });

  const handleContatoWhatsApp = (c: typeof listaClientes[0]) => {
    const msg = encodeURIComponent(`Olá, ${c.nome}! Como podemos ajudar com seu projeto de serralheria hoje?`);
    const link = document.createElement('a');
    link.href = `https://wa.me/55${c.telefone.replace(/\D/g, '')}?text=${msg}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Canal do WhatsApp aberto', 'info', `Conversa com ${c.nome} iniciada.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Clientes & Equipe
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Histórico de contatos comerciais e produtividade dos colaboradores da fábrica.
          </p>
        </div>

        {/* Seletor de Sub-Aba Limpo */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setSubAba('clientes')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              subAba === 'clientes'
                ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Clientes ({listaClientes.length})</span>
          </button>
          <button
            onClick={() => setSubAba('equipe')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              subAba === 'equipe'
                ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Equipe Técnica ({membrosEquipe.length})</span>
          </button>
        </div>
      </div>

      {subAba === 'clientes' ? (
        <div className="space-y-4">
          {/* Busca Limpa */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d1017] p-2.5 rounded-xl border border-neutral-800/80">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por cliente, telefone ou cidade..."
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

            <Button
              variant="primary"
              size="sm"
              onClick={abrirNovoOrcamentoSimulador}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Criar Orçamento
            </Button>
          </div>

          {clientesFiltrados.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="Nenhum cliente encontrado"
              description="Nenhum contato cadastrado corresponde aos termos informados."
              actionLabel="Limpar Busca"
              onAction={() => setBusca('')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.nome}
                  className="bg-[#11141c] border border-neutral-800/80 hover:border-neutral-700/80 rounded-xl p-4 space-y-3 flex flex-col justify-between transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 font-bold font-mono text-xs">
                          {cliente.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white leading-tight">
                            {cliente.nome}
                          </h3>
                          <span className="text-[11px] text-neutral-400">
                            {cliente.totalOS > 0 ? `${cliente.totalOS} O.S. ativa(s)` : 'Proposta enviada'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span>{cliente.telefone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{cliente.endereco}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#0d1017] rounded-lg border border-neutral-800/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-neutral-500 text-[10px] block">Total Aprovado</span>
                        <span className="text-emerald-400 font-mono font-semibold tabular-nums">
                          R$ {cliente.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-500 text-[10px] block">Garantia</span>
                        <span className="text-neutral-300 flex items-center justify-end gap-1 text-[11px]">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          5 Anos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/60 flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleContatoWhatsApp(cliente)}
                      leftIcon={<Send className="w-3.5 h-3.5 text-emerald-400" />}
                      className="flex-1 py-1 px-2.5 text-xs min-h-[32px]"
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={abrirNovoOrcamentoSimulador}
                      leftIcon={<Plus className="w-3.5 h-3.5 text-amber-400" />}
                      className="flex-1 py-1 px-2.5 text-xs min-h-[32px]"
                    >
                      Orçar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Equipe da Fábrica */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {membrosEquipe.map(membro => (
            <div
              key={membro.nome}
              className="bg-[#11141c] border border-neutral-800/80 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 font-bold font-mono text-sm">
                  {membro.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{membro.nome}</h3>
                  <p className="text-xs text-neutral-400">{membro.cargo}</p>
                </div>
              </div>

              <div className="p-2 bg-[#0d1017] rounded-lg border border-neutral-800/60 text-xs flex items-center justify-between">
                <span className="text-neutral-500">Posto Atual:</span>
                <span className="text-emerald-400 font-medium">
                  {membro.status}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-800/60 text-xs space-y-1.5 text-neutral-300 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Horas no Mês:</span>
                  <span className="text-white font-mono font-medium">{membro.horasMes}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">O.S. Concluídas:</span>
                  <span className="text-white font-mono font-medium">{membro.osConcluidas} peças</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-neutral-800/60">
                  <span className="text-neutral-400">Comissão:</span>
                  <span className="text-emerald-400 font-mono font-semibold tabular-nums">
                    R$ {membro.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
