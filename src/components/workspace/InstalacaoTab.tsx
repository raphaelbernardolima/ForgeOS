import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Send,
  PenLine,
  Truck
} from 'lucide-react';
import { useSerralheria } from '../../context/SerralheriaContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export const InstalacaoTab: React.FC = () => {
  const { instalacoes, openSignatureModal, notify } = useSerralheria();
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'agendado' | 'concluido'>('todos');

  const handleAvisarCaminho = (inst: typeof instalacoes[0]) => {
    const msg = encodeURIComponent(
      `Olá, ${inst.clienteNome}! A equipe de montagem da Serralheria ForjaOS está a caminho do seu endereço (${inst.endereco}). Previsão de chegada: 30 minutos.`
    );
    const link = document.createElement('a');
    link.href = `https://wa.me/?text=${msg}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify(
      'Aviso enviado',
      'success',
      `Mensagem com previsão de 30 minutos enviada para ${inst.clienteNome}.`
    );
  };

  const instalacoesFiltradas = instalacoes.filter(inst => {
    if (filtroStatus === 'todos') return true;
    return inst.status === filtroStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Instalações & Campo
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Agendamentos de entrega, aviso de rota no WhatsApp e assinatura digital do termo de entrega.
          </p>
        </div>

        {/* Filtros em segmented control */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
          {(['todos', 'agendado', 'concluido'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroStatus === status
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {status === 'todos' ? 'Todas' : status === 'agendado' ? 'Agendadas' : 'Concluídas'}
            </button>
          ))}
        </div>
      </div>

      {instalacoesFiltradas.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-6 h-6" />}
          title="Nenhuma instalação encontrada"
          description="Não há instalações registradas para o status selecionado."
          actionLabel="Ver Todas as Instalações"
          onAction={() => setFiltroStatus('todos')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instalacoesFiltradas.map(inst => (
            <div
              key={inst.id}
              className="bg-[#11141c] border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-amber-400/90 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{inst.data} às {inst.horario}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white mt-1">
                      {inst.clienteNome}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="truncate">{inst.endereco}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      inst.status === 'concluido'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {inst.status === 'concluido' ? 'Instalado' : 'Agendado'}
                  </span>
                </div>

                <div className="text-xs text-neutral-300 bg-[#0d1017] p-2.5 rounded-lg border border-neutral-800/60">
                  <div className="font-medium text-white font-mono">Ordem de Serviço #{inst.osId} · {inst.bairro}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Equipe escalada: <strong>{inst.equipe.join(', ')}</strong>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAvisarCaminho(inst)}
                  leftIcon={<Send className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  Avisar Chegada
                </Button>

                {inst.status === 'concluido' ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Termo Assinado</span>
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openSignatureModal(inst.id, 'instalacao')}
                    leftIcon={<PenLine className="w-3.5 h-3.5" />}
                  >
                    Assinatura de Entrega
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
