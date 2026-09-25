import React from 'react';
import { OrdemServico, OrçamentoItem } from '../types';
import { X, Printer, CheckCircle, Shield, FileCheck } from 'lucide-react';
import { gerarPecaSVG } from '../lib/proceduralSvg';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  documento: OrdemServico | OrçamentoItem;
  tipoDoc: 'os' | 'orcamento';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  documento,
  tipoDoc
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isOS = tipoDoc === 'os';
  const os = isOS ? (documento as OrdemServico) : null;
  const orc = !isOS ? (documento as OrçamentoItem) : null;

  const clienteNome = isOS ? os!.clienteNome : orc!.clienteNome;
  const clienteTelefone = isOS ? os!.clienteTelefone : orc!.clienteTelefone;
  const valorTotal = isOS ? os!.valorTotal : orc!.valor;
  const dimensoes = documento.dimensoes;
  const tipoPeca = documento.tipo;

  const previewSvg = gerarPecaSVG(documento.tipo, documento.genes, documento.dimensoes, documento.corHex);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0e1117] border border-neutral-700 text-neutral-100 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Barra de Ações do Topo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#141822]">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <FileCheck className="w-4 h-4" />
            <span className="font-bold tracking-wider uppercase">
              {isOS ? `ORDEM DE SERVIÇO ${os!.numeroOS}` : `PROPOSTA COMERCIAL & ORÇAMENTO #${orc!.id}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-mono transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo Imprimível */}
        <div className="p-8 space-y-6 text-sm">
          {/* Cabeçalho Comercial */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-neutral-800 gap-4">
            <div>
              <span className="text-2xl font-display font-black tracking-tight text-white">FORJA<span className="text-amber-500">OS</span></span>
              <p className="text-xs text-neutral-400 mt-1">Serralheria Arquitetônica & Estruturas Metálicas de Precisão</p>
              <p className="text-[11px] font-mono text-neutral-500 mt-0.5">CNPJ: 42.881.902/0001-44 · São Paulo - SP</p>
            </div>
            <div className="sm:text-right font-mono text-xs text-neutral-400 space-y-1">
              <div><strong className="text-white">Data Emissão:</strong> {isOS ? os!.dataCriacao : orc!.dataCriacao}</div>
              {isOS && <div><strong className="text-white">Prazo de Entrega:</strong> {os!.dataPrometida}</div>}
              <div><strong className="text-white">Status:</strong> {documento.status.toUpperCase()}</div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="bg-[#141822] p-4 rounded-xl border border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">Cliente Contratante</span>
              <span className="font-semibold text-white text-base">{clienteNome}</span>
              <span className="block text-neutral-400 text-xs mt-0.5">{clienteTelefone}</span>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">Local de Entrega / Instalação</span>
              <span className="text-neutral-300 text-xs">{isOS ? os!.clienteEndereco : orc!.endereco}</span>
            </div>
          </div>

          {/* Ficha Técnica da Peça & Representação Visual SVG */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 block font-semibold">
              Ficha Técnica do Produto & Projeto Arquitetônico
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#090b10] border border-neutral-800 p-4 rounded-xl">
              <div
                className="w-full h-44 flex items-center justify-center bg-[#0d1017] rounded-lg p-2 border border-neutral-800/80"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-500">Tipo de Estrutura:</span>
                  <span className="text-white uppercase font-semibold">{tipoPeca}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-500">Dimensões Reais:</span>
                  <span className="text-amber-400">{dimensoes.largura} cm × {dimensoes.altura} cm</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-500">Família / Padrão:</span>
                  <span className="text-white capitalize">{documento.genes.familia}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-500">Acabamento:</span>
                  <span className="text-white">{documento.corNome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Norma Técnica:</span>
                  <span className="text-emerald-400">{tipoPeca === 'guarda-corpo' ? 'NBR 14718 (Atendido)' : 'ABNT NBR 8800'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quadro Financeiro */}
          <div className="p-4 bg-[#141822] rounded-xl border border-neutral-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
              <span>Mão de Obra de Serralheria Especializada + Matéria-Prima + Pintura Eletrostática</span>
              <span className="text-white tabular-nums">R$ {valorTotal.toFixed(2)}</span>
            </div>
            {isOS && (
              <div className="flex justify-between items-center text-xs font-mono text-emerald-400 pt-1 border-t border-neutral-800">
                <span>Sinal Pago (50% de Entrada):</span>
                <span>- R$ {os!.valorEntrada.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-neutral-700 text-base font-mono font-bold">
              <span className="text-white">{isOS ? 'Saldo a Pagar na Instalação:' : 'Valor Total do Orçamento:'}</span>
              <span className="text-amber-400 tabular-nums">
                R$ {(isOS ? os!.valorRestante : valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Assinatura Digital do Cliente se houver */}
          {(isOS ? os?.assinaturaClienteUrl : orc?.assinaturaDigital) && (
            <div className="p-4 border border-emerald-900/50 bg-emerald-950/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-emerald-300 block">Documento Aprovado com Assinatura Digital</span>
                  <span className="text-[11px] font-mono text-neutral-400">Autenticado com hash eletrônico</span>
                </div>
              </div>
              <div className="h-10 w-28 flex items-center justify-center bg-[#090b10] border border-neutral-800 rounded p-1">
                <img
                  src={isOS ? os?.assinaturaClienteUrl : orc?.assinaturaDigital}
                  alt="Assinatura"
                  className="max-h-full max-w-full"
                />
              </div>
            </div>
          )}

          {/* Termos & Garantia */}
          <div className="text-[11px] text-neutral-500 space-y-1 font-mono pt-2 border-t border-neutral-800">
            <p>• Garantia estrutural de 5 (cinco) anos contra defeitos de solda e fabricação.</p>
            <p>• Garantia de 2 (dois) anos sobre a camada de pintura eletrostática a pó.</p>
            <p>• Validade deste orçamento: 15 dias corridos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
