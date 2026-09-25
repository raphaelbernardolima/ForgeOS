import React, { useState } from 'react';
import { OrdemServico, OrçamentoItem } from '../types';
import {
  X,
  Printer,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Wrench,
  Send,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Scale,
  Clock,
  Sparkles,
  Layers,
  Flame,
  CheckSquare
} from 'lucide-react';
import { gerarPecaSVG, calcularMetricas } from '../lib/proceduralSvg';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  documento: OrdemServico | OrçamentoItem;
  tipoDoc: 'os' | 'orcamento';
  modoInicial?: 'proposta' | 'ficha_corte';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  documento,
  tipoDoc,
  modoInicial = 'proposta'
}) => {
  // Alternador entre "Proposta Comercial (Cliente)" e "Ficha de Corte & Bancada (Fábrica)"
  const [abaAtiva, setAbaAtiva] = useState<'proposta' | 'ficha_corte'>(modoInicial);

  if (!isOpen || !documento) return null;

  const isOS = tipoDoc === 'os';
  const os = isOS ? (documento as OrdemServico) : null;
  const orc = !isOS ? (documento as OrçamentoItem) : null;

  const clienteNome = isOS ? os!.clienteNome : orc!.clienteNome;
  const clienteTelefone = isOS ? os!.clienteTelefone : orc!.clienteTelefone;
  const clienteEndereco = isOS ? os!.clienteEndereco : orc!.endereco;
  const valorTotal = isOS ? os!.valorTotal : orc!.valor;
  const codigoDoc = isOS ? `OS #${os!.numeroOS}` : `ORC #${orc!.id}`;
  const dataCriacao = isOS ? os!.dataCriacao : orc!.dataCriacao;
  const dataPrometida = isOS ? os!.dataPrometida : '15 dias úteis';

  const dimensoes = documento.dimensoes;
  const tipoPeca = documento.tipo;
  const genes = documento.genes;
  const corHex = documento.corHex;
  const corNome = documento.corNome;

  const metricas = calcularMetricas(tipoPeca, genes, dimensoes);
  const previewSvg = gerarPecaSVG(tipoPeca, genes, dimensoes, corHex);

  // Cálculo paramétrico da Lista de Corte para o operador de fábrica
  const espessuraRequadroCm = genes.espessura || 3.0;
  const alturaInternaCm = Math.max(10, dimensoes.altura - (espessuraRequadroCm * 2));
  const larguraInternaCm = Math.max(10, dimensoes.largura - (espessuraRequadroCm * 2));

  // Itens da Lista de Corte
  const listaCorte = [
    {
      posicao: '01',
      descricao: 'Travessas Superiores / Inferiores (Requadro)',
      perfil: `Tubo Retangular 50×30mm (${espessuraRequadroCm}cm)`,
      comprimentoCm: dimensoes.largura,
      quantidade: 2,
      corteAngulo: genes.temMoldura ? '45° Meia-Esquadria' : '90° Reto'
    },
    {
      posicao: '02',
      descricao: 'Montantes Laterais (Colunas do Requadro)',
      perfil: `Tubo Retangular 50×30mm (${espessuraRequadroCm}cm)`,
      comprimentoCm: dimensoes.altura,
      quantidade: 2,
      corteAngulo: genes.temMoldura ? '45° Meia-Esquadria' : '90° Reto'
    },
    {
      posicao: '03',
      descricao: `Barrotes Internos de Preenchimento (${genes.familia.toUpperCase()})`,
      perfil: `Barra / Perfil Tubular ${espessuraRequadroCm}cm`,
      comprimentoCm: Math.round(alturaInternaCm),
      quantidade: metricas.qtdBarras,
      corteAngulo: genes.angulo !== 0 ? `${genes.angulo}° de Grau` : '90° Reto'
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCompartilharZap = () => {
    const texto = abaAtiva === 'proposta'
      ? `Olá *${clienteNome}*, segue o resumo da sua proposta formal da *Forja Serralheria*:\n\n` +
        `📋 *${codigoDoc}* - ${tipoPeca.toUpperCase()} sob medida\n` +
        `📐 Dimensões: ${(dimensoes.largura / 100).toFixed(2)}m larg × ${(dimensoes.altura / 100).toFixed(2)}m alt\n` +
        `🎨 Acabamento: ${corNome} (Pintura Eletrostática)\n` +
        `💰 Valor Total: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
        `🛡️ Garantia: 5 anos na estrutura\n\n` +
        `Acompanhe a fabricação em tempo real pelo link:\n${window.location.origin}/?rastreio=${isOS ? os!.numeroOS : orc!.id}`
      : `📋 *Ficha de Corte & Fabricação - ${codigoDoc}*\n` +
        `Peça: ${tipoPeca.toUpperCase()} (${dimensoes.largura}x${dimensoes.altura}cm)\n` +
        `Aço total: ${metricas.pesoEstimadoKg} kg · ${metricas.metrosLinearTotal}m lineares\n` +
        `Barras internas: ${metricas.qtdBarras} peças de ${Math.round(alturaInternaCm)}cm\n` +
        `Cor: ${corNome}`;

    const url = `https://wa.me/55${clienteTelefone.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#12151f] border border-neutral-700 text-neutral-100 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[94vh]">
        
        {/* BARRA SUPERIOR DE AÇÕES (NO-PRINT) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-[#0d1017] gap-3 shrink-0">
          
          {/* Seletor de Tipo de Documento */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-700/80 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAbaAtiva('proposta')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                abaAtiva === 'proposta'
                  ? 'bg-amber-500 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Proposta Comercial (Cliente)</span>
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('ficha_corte')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                abaAtiva === 'ficha_corte'
                  ? 'bg-sky-500 text-neutral-950 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Ficha de Corte (Fábrica)</span>
            </button>
          </div>

          {/* Botões de Ação: Imprimir / PDF / Zap / Fechar */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleCompartilharZap}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Compartilhar no WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Imprimir ou Salvar como PDF A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ÁREA DO DOCUMENTO (FOLHA A4 LIMPA NO PRINT E VISÍVEL NO MODAL) */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-[#090b10] flex justify-center">
          
          {/* CONTAINER DA FOLHA (Branco para contraste perfeito e fidelidade de impressão) */}
          <div
            id="printable-document"
            className="w-full max-w-[210mm] bg-white text-slate-900 p-6 sm:p-10 rounded-xl sm:rounded-2xl shadow-xl space-y-6 text-xs sm:text-sm font-sans"
          >
            {/* =========================================================
                DOCUMENTO 1: PROPOSTA COMERCIAL TIMBRADA PARA O CLIENTE
                ========================================================= */}
            {abaAtiva === 'proposta' && (
              <div className="space-y-6">
                
                {/* Cabeçalho Timbrado com Identidade Visual */}
                <div className="flex flex-col sm:flex-row justify-between items-start pb-5 border-b-2 border-slate-900 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-amber-500 text-slate-950 font-black flex items-center justify-center rounded text-sm tracking-wider font-mono">
                        FO
                      </div>
                      <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-display">
                        FORJA<span className="text-amber-600">OS</span> SERRALHERIA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Estruturas Metálicas de Precisão · Portões Automáticos · Guarda-corpos · Grades
                    </p>
                    <div className="flex flex-wrap gap-x-3 text-[10px] font-mono text-slate-500 pt-0.5">
                      <span>CNPJ: 42.881.902/0001-44</span>
                      <span>·</span>
                      <span>Tel/WhatsApp: (11) 98765-4321</span>
                      <span>·</span>
                      <span>São Paulo - SP</span>
                    </div>
                  </div>

                  <div className="sm:text-right font-mono text-xs text-slate-700 space-y-1 shrink-0 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 text-sm">{codigoDoc}</div>
                    <div><strong>Data:</strong> {dataCriacao}</div>
                    <div><strong>Validade:</strong> 15 dias corridos</div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                      Status: {documento.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Dados do Cliente e Local da Obra */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                      Cliente Contratante
                    </span>
                    <span className="font-bold text-slate-950 text-base block">{clienteNome}</span>
                    <span className="text-slate-600 text-xs flex items-center gap-1 mt-0.5 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{clienteTelefone}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                      Local de Entrega & Instalação
                    </span>
                    <span className="text-slate-800 text-xs block font-medium">
                      {clienteEndereco || 'Endereço fornecido na medição técnica final'}
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Prazo estimado de fabricação: <strong>{dataPrometida}</strong>
                    </span>
                  </div>
                </div>

                {/* Desenho Técnico Vetorial e Especificações de Engenharia */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Projeto Arquitetônico 2D & Memorial Descritivo</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Escala paramétrica proporcional
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    {/* SVG Renderizado */}
                    <div className="md:col-span-7 h-48 sm:h-52 bg-white rounded-lg border border-slate-300 p-2 flex items-center justify-center overflow-hidden relative">
                      <div
                        className="w-full h-full flex items-center justify-center pointer-events-none"
                        dangerouslySetInnerHTML={{ __html: previewSvg }}
                      />
                      <span className="absolute bottom-1.5 right-1.5 text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300">
                        {dimensoes.largura} × {dimensoes.altura} cm
                      </span>
                    </div>

                    {/* Especificações de Materiais */}
                    <div className="md:col-span-5 space-y-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Estrutura:</span>
                        <span className="text-slate-950 font-bold uppercase">{tipoPeca}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Dimensões Reais:</span>
                        <span className="text-slate-950 font-bold">{(dimensoes.largura / 100).toFixed(2)}m × {(dimensoes.altura / 100).toFixed(2)}m</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Padrão das Barras:</span>
                        <span className="text-slate-950 capitalize">{genes.familia} ({genes.espessura}cm)</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Cor do Acabamento:</span>
                        <span className="text-slate-950 flex items-center gap-1 font-sans font-medium">
                          <span className="w-2.5 h-2.5 rounded-full border border-slate-400" style={{ backgroundColor: corHex }} />
                          {corNome}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Pintura:</span>
                        <span className="text-slate-950">Eletrostática a Pó (Epóxi)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Norma ABNT:</span>
                        <span className="text-slate-950 font-bold">{tipoPeca === 'guarda-corpo' ? 'NBR 14718 (Atendido)' : 'NBR 8800'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabela de Itens e Valores Comerciais */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold block">
                    Composição Comercial da Proposta
                  </span>

                  <table className="w-full border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-mono text-[11px]">
                        <th className="border border-slate-200 p-2 text-left">Item / Discriminação dos Serviços</th>
                        <th className="border border-slate-200 p-2 text-center w-20">Qtd</th>
                        <th className="border border-slate-200 p-2 text-right w-28">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-800">
                      <tr>
                        <td className="border border-slate-200 p-2.5">
                          <strong className="text-slate-950 block">{tipoPeca.toUpperCase()} SOB MEDIDA MODELO {genes.familia.toUpperCase()}</strong>
                          <span className="text-[11px] text-slate-600 block mt-0.5">
                            Fabricação estrutural em perfis de aço, solda especializada MIG/MAG, tratamento anticorrosivo e pintura eletrostática a pó na cor {corNome}.
                          </span>
                        </td>
                        <td className="border border-slate-200 p-2.5 text-center font-mono">1 un</td>
                        <td className="border border-slate-200 p-2.5 text-right font-mono font-bold text-slate-950">
                          R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2.5">
                          <span className="text-slate-900 font-semibold block">Transporte, Frete & Instalação Técnica Especializada</span>
                          <span className="text-[11px] text-slate-600 block mt-0.5">
                            Fixação mecânica com chumbadores parabolt de aço, ajustes de prumo e alinhamento na obra.
                          </span>
                        </td>
                        <td className="border border-slate-200 p-2.5 text-center font-mono">1 serv</td>
                        <td className="border border-slate-200 p-2.5 text-right font-mono text-emerald-700 font-bold">
                          Incluso
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Quadro de Valores e Condições de Pagamento */}
                <div className="bg-slate-50 border-2 border-slate-900 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 page-break-inside-avoid">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold block">
                      Condições de Pagamento
                    </span>
                    <div className="text-[11px] text-slate-600 space-y-0.5 mt-1 font-mono">
                      <div>• <strong>À Vista no PIX:</strong> 5% de desconto (R$ {(valorTotal * 0.95).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</div>
                      <div>• <strong>Padrão de Obra:</strong> 50% de entrada na assinatura + 50% na conclusão</div>
                      <div>• <strong>Cartão de Crédito:</strong> Parcelamento em até 12x</div>
                      <div>• <strong>Chave PIX:</strong> financeiro@forjametalurgica.com.br</div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                      Valor Total do Contrato
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-slate-950 tabular-nums">
                      R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Termos de Garantia Formal */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-600 page-break-inside-avoid">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 font-mono text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Termo de Garantia Estrutural ForjaOS</span>
                  </div>
                  <p>• <strong>5 (cinco) anos</strong> de garantia total contra defeitos de solda e integridade mecânica das estruturas metálicas.</p>
                  <p>• <strong>1 (um) ano</strong> de garantia sobre a camada de acabamento e pintura eletrostática contra descascamento precoce.</p>
                  <p>• Assistência técnica especializada e reposição de ferragens com suporte direto da oficina.</p>
                </div>

                {/* Assinaturas Formais */}
                <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 page-break-inside-avoid">
                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-400 pb-1 h-10 flex items-end justify-center">
                      {(isOS ? os?.assinaturaClienteUrl : orc?.assinaturaDigital) ? (
                        <img
                          src={isOS ? os?.assinaturaClienteUrl : orc?.assinaturaDigital}
                          alt="Assinatura Cliente"
                          className="max-h-9 object-contain"
                        />
                      ) : null}
                    </div>
                    <span className="text-xs font-bold text-slate-900 block">{clienteNome}</span>
                    <span className="text-[10px] text-slate-500 font-mono">CONTRATANTE / CLIENTE</span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-400 pb-1 h-10 flex items-end justify-center font-serif italic text-slate-800 text-sm font-semibold">
                      Forja Metalúrgica & Estruturas
                    </div>
                    <span className="text-xs font-bold text-slate-900 block">FORJA SERRALHERIA LTDA</span>
                    <span className="text-[10px] text-slate-500 font-mono">RESPONSÁVEL TÉCNICO</span>
                  </div>
                </div>

              </div>
            )}

            {/* =========================================================
                DOCUMENTO 2: FICHA DE CORTE & BANCADA (OFICINA / PRODUÇÃO)
                SEM VALORES FINANCEIROS - 100% FOCO OPERACIONAL
                ========================================================= */}
            {abaAtiva === 'ficha_corte' && (
              <div className="space-y-6">
                
                {/* Cabeçalho de Fábrica */}
                <div className="flex flex-col sm:flex-row justify-between items-start pb-4 border-b-2 border-slate-900 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-sky-600 text-white font-black flex items-center justify-center rounded text-sm font-mono">
                        OF
                      </div>
                      <span className="text-xl font-black tracking-tight text-slate-950 font-display">
                        ORDEM DE CORTE & FABRICAÇÃO DE BANCADA
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Ficha de chão de fábrica para corte, montagem, solda e controle de qualidade.
                    </p>
                  </div>

                  <div className="sm:text-right font-mono text-xs text-slate-800 bg-sky-50 border border-sky-200 p-2.5 rounded-lg shrink-0">
                    <div className="text-sm font-black text-sky-950">{codigoDoc}</div>
                    <div><strong>Cliente:</strong> {clienteNome}</div>
                    <div><strong>Entrega Prometida:</strong> {dataPrometida}</div>
                  </div>
                </div>

                {/* Resumo Rápido da Peça para o Serralheiro */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Peça:</span>
                    <span className="font-bold text-slate-950 text-sm uppercase">{tipoPeca}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Vão Externo:</span>
                    <span className="font-bold text-sky-800 text-sm">{dimensoes.largura} × {dimensoes.altura} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Padrão / Estilo:</span>
                    <span className="font-bold text-slate-950 capitalize">{genes.familia}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Cor da Pintura:</span>
                    <span className="font-bold text-slate-950 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-400" style={{ backgroundColor: corHex }} />
                      {corNome}
                    </span>
                  </div>
                </div>

                {/* Desenho Técnico de Oficina com Cotas */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="md:col-span-8 h-48 sm:h-56 bg-white rounded-lg border border-slate-300 p-2 flex items-center justify-center overflow-hidden relative">
                    <div
                      className="w-full h-full flex items-center justify-center pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: previewSvg }}
                    />
                    <div className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      COTA TOTAL: {dimensoes.largura}L × {dimensoes.altura}A cm
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-2 text-xs font-mono">
                    <div className="text-[11px] font-bold text-slate-900 uppercase border-b border-slate-300 pb-1">
                      Parâmetros da Peça
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Espaçamento eixos:</span>
                      <strong className="text-slate-950">{genes.espacamento} cm</strong>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Espessura perfil:</span>
                      <strong className="text-slate-950">{genes.espessura} cm</strong>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Ângulo de corte:</span>
                      <strong className="text-slate-950">{genes.angulo}°</strong>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Peso previsto aço:</span>
                      <strong className="text-slate-950">{metricas.pesoEstimadoKg} kg</strong>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Metragem total:</span>
                      <strong className="text-slate-950">{metricas.metrosLinearTotal} m</strong>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Cordão de solda:</span>
                      <strong className="text-slate-950">{metricas.cordaoSoldaCm} cm</strong>
                    </div>
                  </div>
                </div>

                {/* PLANO DE CORTE DE BARRAS (LISTA DE CORTE EXATA) */}
                <div className="space-y-2 page-break-inside-avoid">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-sky-700" />
                      <span>Lista de Peças & Plano de Corte (Medidas Exatas)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      Conferir na trena antes do corte final
                    </span>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-200 text-slate-800 font-mono text-[11px]">
                        <th className="border border-slate-300 p-2 text-center w-12">Pos</th>
                        <th className="border border-slate-300 p-2 text-left">Elemento / Função</th>
                        <th className="border border-slate-300 p-2 text-left">Especificação Perfil</th>
                        <th className="border border-slate-300 p-2 text-center w-24">Comprimento</th>
                        <th className="border border-slate-300 p-2 text-center w-16">Qtd</th>
                        <th className="border border-slate-300 p-2 text-center w-36">Corte de Ponta</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-900 font-mono">
                      {listaCorte.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="border border-slate-300 p-2 text-center font-bold text-slate-700">
                            {item.posicao}
                          </td>
                          <td className="border border-slate-300 p-2 font-sans font-medium text-slate-950">
                            {item.descricao}
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-700">
                            {item.perfil}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-sky-950 text-sm">
                            {item.comprimentoCm} cm
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-black text-slate-950">
                            {item.quantidade}x
                          </td>
                          <td className="border border-slate-300 p-2 text-center text-slate-800 text-[11px] font-semibold">
                            {item.corteAngulo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CHECKLIST DE CONTROLE DE QUALIDADE DE FÁBRICA */}
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 page-break-inside-avoid">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-950 font-bold flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                      <span>Checklist de Liberação da Peça na Fábrica</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Obrigatório assinar antes de carregar p/ transporte
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                    <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-slate-900 rounded" />
                      <span>1. Esquadro de 90° e diagonal conferidos</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-slate-900 rounded" />
                      <span>2. Solda contínua sem porosidade e escovada</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-slate-900 rounded" />
                      <span>3. Cantos e arestas desbastados com flap</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-slate-900 rounded" />
                      <span>4. Desengraxante e primer aplicados</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-slate-900 rounded" />
                      <span>5. Pintura uniforme ({corNome}) sem escorrer</span>
                    </label>

                    <label className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-slate-900 rounded" />
                      <span>6. Embalagem com cantoneiras e filme stretch</span>
                    </label>
                  </div>
                </div>

                {/* Assinatura do Operador de Fábrica */}
                <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 page-break-inside-avoid">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono block">SERRALHEIRO / MONTADOR:</span>
                    <div className="border-b border-slate-400 h-8" />
                    <span className="text-[11px] text-slate-700 font-mono block">Nome / Visto</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono block">ENCARREGADO DE QUALIDADE:</span>
                    <div className="border-b border-slate-400 h-8" />
                    <span className="text-[11px] text-slate-700 font-mono block">Visto de Liberação para Expedição</span>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
