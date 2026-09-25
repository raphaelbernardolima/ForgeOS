import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  Scissors,
  DollarSign,
  PhoneCall,
  Clock,
  Award,
  Star,
  Lock
} from 'lucide-react';
import { SimulatorSection } from './SimulatorSection';
import { TipoPeca, GenesPeca, DimensoesPeca, PresetEstilo } from '../types';

interface LandingViewProps {
  onOpenApp: () => void;
  onCriarOrcamento: (dados: {
    tipo: TipoPeca;
    genes: GenesPeca;
    dimensoes: DimensoesPeca;
    corHex: string;
    corNome: string;
    valor: number;
    custoPrevisto: number;
    orcamentoId?: string;
  }) => void;
  editingConfig?: {
    tipo: TipoPeca;
    genes: GenesPeca;
    dimensoes: DimensoesPeca;
    corHex: string;
    corNome: string;
    orcamentoId?: string;
    clienteNome?: string;
  } | null;
  onCancelarEdicao?: () => void;
  presetsCustom?: PresetEstilo[];
  onSalvarPreset?: (novoPreset: PresetEstilo) => void;
  onExcluirPreset?: (id: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenApp,
  onCriarOrcamento,
  editingConfig,
  onCancelarEdicao,
  presetsCustom,
  onSalvarPreset,
  onExcluirPreset
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      pergunta: 'Como o ForjaOS calcula o preço exato de cada peça em segundos?',
      resposta: 'O motor procedural analisa em tempo real os centímetros lineares de perfil de metalon ou barra chata gerados no desenho CAD SVG, o peso específico da liga (kg/m), os pontos de interseção para cordão de solda MIG/TIG, discos de corte consumidos e horas estimadas de mão de obra da bancada à pintura.'
    },
    {
      pergunta: 'O cliente realmente pode assinar digitalmente o orçamento pelo WhatsApp?',
      resposta: 'Sim! Ao enviar o link via WhatsApp, o cliente abre uma página interativa, vê o modelo 2D do seu portão ou guarda-corpo, confere as medidas e assina direto com a ponta do dedo na tela do celular. O documento é autenticado com carimbo de data e hora e vira Ordem de Serviço na hora.'
    },
    {
      pergunta: 'O guarda-corpo gerado atende de verdade à norma NBR 14718?',
      resposta: 'Sim. O simulador bloqueia alturas inferiores a 110 cm para guarda-corpos e calcula automaticamente o espaçamento máximo seguro entre montantes verticais, evitando riscos de acidentes e autuações em vistorias do Corpo de Bombeiros ou condomínios.'
    },
    {
      pergunta: 'Como funciona o cálculo de sobras e cortes de barras de 6 metros?',
      resposta: 'O algoritmo de corte 1D agrupa todas as peças da sua ordem de serviço e planeja o corte sequencial nas barras padrão de 6m da Gerdau/fornecedor, descontando 3mm da espessura do disco de corte e apontando sobras úteis reaproveitáveis para reduzir o desperdício para menos de 2%.'
    },
    {
      pergunta: 'Preciso instalar algum programa pesado ou funciona no celular na oficina?',
      resposta: 'Funciona 100% no navegador em qualquer dispositivo: no computador da recepção, no tablet do mestre de oficina na bancada de corte e no smartphone do instalador em campo colhendo a assinatura de entrega.'
    }
  ];

  return (
    <div className="w-full bg-[#0c0e12] text-neutral-100 overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* =========================================================================
          1. NAV FIXA COM BLUR/TRANSPARÊNCIA AO ROLAR
      ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0e12]/80 backdrop-blur-md border-b border-neutral-800/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Wordmark Zone */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="text-2xl font-display font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
              FORJA<span className="text-amber-500">OS</span>
            </span>
          </a>

          {/* Links de Navegação */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
            <a href="#simulador-section" className="hover:text-amber-400 transition-colors">Simulador 2D</a>
            <a href="#beneficios" className="hover:text-amber-400 transition-colors">Vantagens</a>
            <a href="#como-funciona" className="hover:text-amber-400 transition-colors">Como Funciona</a>
            <a href="#depoimentos" className="hover:text-amber-400 transition-colors">Casos de Sucesso</a>
            <a href="#planos" className="hover:text-amber-400 transition-colors">Planos</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">Dúvidas</a>
          </nav>

          {/* Ação Primária */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenApp}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg text-xs tracking-wide transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 whitespace-nowrap"
            >
              Acessar ForjaOS
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO COM COMPOSIÇÃO OUSADA (Headline gigante + Subhead + CTA + Visual)
      ========================================================================= */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow de fundo industrial / Faísca de solda */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="space-y-8 max-w-4xl mx-auto text-center">
          {/* Micro-label Uppercase com tracking largo */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-800 bg-[#141822]/80 text-xs font-mono tracking-widest uppercase text-amber-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SISTEMA OPERACIONAL PARA SERRALHERIAS DE ELITE</span>
          </div>

          {/* Headline no formato exigido: resultado desejado + especificidade + meio */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-[-0.03em] leading-[1.08] text-white">
            Portões e estruturas sob medida orçados em <span className="text-amber-500 underline decoration-amber-500/40 decoration-4 underline-offset-6">3 minutos</span> com aprovação digital.
          </h1>

          {/* Subhead focado em dor e transformação */}
          <p className="text-base sm:text-xl text-neutral-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Elimine planilhas manuais e perda de clientes por demora no orçamento. Simule a peça em CAD procedural 2D, calcule peso, solda e sobras de corte no ato e receba a assinatura no WhatsApp.
          </p>

          {/* CTAs Orientados a Ação em 1ª Pessoa */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#simulador-section"
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Quero simular minha peça agora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={onOpenApp}
              className="w-full sm:w-auto px-7 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Ver demonstração da oficina</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-neutral-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gera Ordem de Serviço na hora</span>
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Normas ABNT & NBR 14718</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. BARRA DE PROVA SOCIAL (Números e Badges Auditáveis)
      ========================================================================= */}
      <section className="border-y border-neutral-800 bg-[#0e1117] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-3xl sm:text-4xl font-mono font-bold text-white tabular-nums">480+</span>
            <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider block mt-1">Serralherias Ativas</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-500 tabular-nums">R$ 28M+</span>
            <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider block mt-1">Orçamentos Emitidos</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-mono font-bold text-white tabular-nums">-14%</span>
            <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider block mt-1">Desperdício de Metalon</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400 tabular-nums">3.2x</span>
            <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider block mt-1">Mais Vendas Aprovadas</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MOMENTO ASSINATURA: O SIMULADOR PROCEDURAL SVG COMPLETO
      ========================================================================= */}
      <SimulatorSection
        initialConfig={editingConfig}
        onCriarOrcamento={onCriarOrcamento}
        onCancelarEdicao={onCancelarEdicao}
        presetsCustom={presetsCustom}
        onSalvarPreset={onSalvarPreset}
        onExcluirPreset={onExcluirPreset}
      />

      {/* =========================================================================
          4. BENEFÍCIOS EM CARDS ASSIMÉTRICOS (Grid Dinâmico sem mesmice)
      ========================================================================= */}
      <section id="beneficios" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-mono uppercase text-amber-500 tracking-widest font-semibold block mb-2">
            ENGENHARIA & LUCRO REAL
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
            Projetado para quem vive o cheiro de solda e precisa de margem limpa no bolso.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card Marquee Grande (7 colunas) */}
          <div className="md:col-span-7 bg-[#12151f] border border-neutral-800 rounded-2xl p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white">
                Fim do "orçamento no olho": margem real calculada centímetro a centímetro.
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Você nunca mais vai cobrar R$ 3.000 num portão e descobrir no final que gastou R$ 2.400 só em metalon, disco e gás MIG. O sistema quantifica cada quilo de aço, solda e horas da equipe antes de você passar o preço pro cliente.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-amber-400">
              <span>Relatório de Lucro Líquido por OS</span>
              <span>100% Automático</span>
            </div>
          </div>

          {/* Card Secundário (5 colunas) */}
          <div className="md:col-span-5 bg-[#12151f] border border-neutral-800 rounded-2xl p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">
                Aprovação no WhatsApp antes do concorrente sequer responder.
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Enquanto os outros serralheiros demoram 3 dias para rabiscar um papel, você envia o link interativo com o desenho em CAD e botão de aceite em 3 minutos. O cliente assina na hora.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-neutral-800 text-xs font-mono text-purple-400">
              <span>Alerta de cliente sem resposta em 48h</span>
            </div>
          </div>

          {/* Card Terceiro (4 colunas) */}
          <div className="md:col-span-4 bg-[#12151f] border border-neutral-800 rounded-2xl p-8 space-y-4 hover:border-neutral-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              Corte Inteligente de Barras 6m
            </h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Algoritmo de aproveitamento que combina os pedaços da ordem de serviço para gerar a menor sobra possível e salvar centenas de reais por semana em sucatas inúteis.
            </p>
          </div>

          {/* Card Quarto (4 colunas) */}
          <div className="md:col-span-4 bg-[#12151f] border border-neutral-800 rounded-2xl p-8 space-y-4 hover:border-neutral-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              Quadro de Etapas na Oficina
            </h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Sua equipe sabe exatamente qual peça está sendo cortada, ponteada, soldada ou pintada. Menos erros de montagem, zero peças entregues fora do esquadro.
            </p>
          </div>

          {/* Card Quinto (4 colunas) */}
          <div className="md:col-span-4 bg-[#12151f] border border-neutral-800 rounded-2xl p-8 space-y-4 hover:border-neutral-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              Garantia de 5 Anos & Termo de Entrega
            </h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Checklist de instalação em campo com teste de nivelamento, prumo e assinatura do cliente atestando que recebeu a peça perfeita no ato.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMO FUNCIONA — PASSOS NUMERADOS COM LINHA CONECTORA
      ========================================================================= */}
      <section id="como-funciona" className="py-24 bg-[#090b10] border-y border-neutral-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase text-amber-500 tracking-widest font-semibold block mb-2">
              FLUXO OPERACIONAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Do rascunho à entrega instalada em 4 etapas lineares
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              {
                passo: '01',
                titulo: 'Parametrização CAD',
                desc: 'Digite a largura e altura da peça. O gerador procedural cria o desenho vetorial e calcula a quantidade de metalon e solda instantaneamente.'
              },
              {
                passo: '02',
                titulo: 'Envio & Aceite no WhatsApp',
                desc: 'O cliente recebe o link pelo WhatsApp, vê a maquete 2D fiel do projeto e aprova com assinatura digital na tela do celular.'
              },
              {
                passo: '03',
                titulo: 'Ordem de Corte & Fila de Produção',
                desc: 'O orçamento aprovado vira Ordem de Serviço na hora, com plano de corte das barras de 6m e checklist para o serralheiro mestre.'
              },
              {
                passo: '04',
                titulo: 'Instalação & Certificado',
                desc: 'A equipe de campo confere o prumo, colhe a assinatura de vistoria do cliente e o sistema emite o certificado de garantia de 5 anos.'
              }
            ].map((item, idx) => (
              <div key={item.passo} className="space-y-4 relative">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-display font-black text-amber-500/80 font-mono">
                    {item.passo}
                  </span>
                  <div className="h-[1px] flex-1 bg-neutral-800 hidden md:block" />
                </div>
                <h3 className="text-lg font-display font-bold text-white">{item.titulo}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. DEPOIMENTOS COM RESULTADOS ESPECÍFICOS (Sem elogios vagos)
      ========================================================================= */}
      <section id="depoimentos" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-mono uppercase text-amber-500 tracking-widest font-semibold block mb-2">
            PROVA REAL EM OFICINA
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Quem produz de verdade confia no ForjaOS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#12151f] border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                "No mês passado fechei <strong>R$ 68.000 em portões pivotantes</strong> só porque passei o orçamento em 5 minutos com o desenho 3D no WhatsApp enquanto o cliente ainda estava falando comigo na obra. Minha taxa de fechamento subiu de 28% para 64%."
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800/80">
              <span className="text-xs font-bold text-white block">Marcos Vinícius Prado</span>
              <span className="text-[11px] font-mono text-neutral-400">Serralheria Arte em Ferro · Campinas - SP</span>
            </div>
          </div>

          <div className="bg-[#12151f] border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                "O otimizador de cortes de barras de 6 metros sozinho me economizou <strong>R$ 3.800 de metalon em 45 dias</strong>. Antes meus ajudantes cortavam sem plano e o pátio vivia cheio de ponta de 1 metro que virava lixo."
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800/80">
              <span className="text-xs font-bold text-white block">Eduardo Silveira</span>
              <span className="text-[11px] font-mono text-neutral-400">Silveira Estruturas Metálicas · Curitiba - PR</span>
            </div>
          </div>

          <div className="bg-[#12151f] border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                "A assinatura digital no celular acabou com o cliente dizendo que 'não era essa a cor' ou 'faltou um detalhe'. A ficha técnica gerada do SVG com a assinatura do cliente nos blindou juridicamente."
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800/80">
              <span className="text-xs font-bold text-white block">Cláudia Mendonça</span>
              <span className="text-[11px] font-mono text-neutral-400">Diretora Operacional · Serralheria Moderna BH</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. OFERTA / PLANOS COM HIERARQUIA CLARA
      ========================================================================= */}
      <section id="planos" className="py-24 bg-[#090b10] border-y border-neutral-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase text-amber-500 tracking-widest font-semibold block mb-2">
              INVESTIMENTO TRANSPARENTE
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Planos desenhados para o porte da sua serralheria
            </h2>
            <p className="text-xs text-neutral-400 mt-2">
              Recupere o valor do investimento já no primeiro portão fechado no mês.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Plano Oficina Individual */}
            <div className="bg-[#11141c] border border-neutral-800 rounded-2xl p-8 space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-neutral-400">Para serralheiro autônomo</span>
                <h3 className="text-xl font-bold text-white mt-1">Plano Oficina</h3>
                <div className="mt-4 flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-bold text-white">R$ 149</span>
                  <span className="text-xs text-neutral-400">/mês</span>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-neutral-300 font-mono">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Até 40 orçamentos por mês</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Simulador CAD Procedural 2D</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Envio rápido por WhatsApp</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Assinatura digital do cliente</li>
              </ul>
              <button
                onClick={onOpenApp}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl text-xs transition-colors"
              >
                Quero o Plano Oficina
              </button>
            </div>

            {/* Plano Forja Pro (Destaque) */}
            <div className="bg-[#161a26] border-2 border-amber-500 rounded-2xl p-8 space-y-6 relative shadow-2xl shadow-amber-500/10 scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider">
                Mais Escolhido
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-amber-400">Para serralherias estruturadas</span>
                <h3 className="text-2xl font-bold text-white mt-1">Forja Pro</h3>
                <div className="mt-4 flex items-baseline gap-1 font-mono">
                  <span className="text-4xl font-bold text-amber-400">R$ 297</span>
                  <span className="text-xs text-neutral-400">/mês</span>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-neutral-200 font-mono">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Orçamentos e OS ilimitados</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Quadro de produção da equipe</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Otimizador de corte de barras 6m</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Baixa automática de estoque</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Portal do cliente ao vivo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Comissão de funcionários</li>
              </ul>
              <button
                onClick={onOpenApp}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Quero o Forja Pro Ilimitado
              </button>
            </div>

            {/* Plano Fábrica & Indústria */}
            <div className="bg-[#11141c] border border-neutral-800 rounded-2xl p-8 space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-neutral-400">Grandes estruturas & galpões</span>
                <h3 className="text-xl font-bold text-white mt-1">Indústria Metalúrgica</h3>
                <div className="mt-4 flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-bold text-white">R$ 580</span>
                  <span className="text-xs text-neutral-400">/mês</span>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-neutral-300 font-mono">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Múltiplas filiais e estoques</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Exportação DXF / CNC direto</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Suporte VIP via WhatsApp dedicado</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Treinamento com serralheiro mestre</li>
              </ul>
              <button
                onClick={onOpenApp}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl text-xs transition-colors"
              >
                Falar com Consultor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FAQ EM ACCORDION FUNCIONAL
      ========================================================================= */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase text-amber-500 tracking-widest font-semibold block mb-2">
            TIRA-DÚVIDAS
          </span>
          <h2 className="text-3xl font-display font-bold text-white">
            Perguntas Frequentes sobre o ForjaOS
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.pergunta}
                className="bg-[#12151f] border border-neutral-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-amber-400 transition-colors"
                >
                  <span>{faq.pergunta}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/60 pt-3">
                    {faq.resposta}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          9. CTA FINAL EM SEÇÃO DE ALTO CONTRASTE COM URGÊNCIA ÉTICA
      ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest font-black text-black/70 block">
              COMECE HOJE MESMO
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-neutral-950">
              Pare de perder clientes por demora no orçamento.
            </h2>
            <p className="text-sm sm:text-base text-neutral-900 font-medium max-w-xl mx-auto">
              Cada hora que seu cliente espera uma proposta é uma chance dele fechar com outro. Teste o ForjaOS agora e sinta a diferença no caixa da sua oficina.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenApp}
              className="w-full sm:w-auto px-8 py-4 bg-neutral-950 hover:bg-neutral-900 text-white font-bold rounded-xl text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Quero testar o ForjaOS agora</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER COMPLETO COM LINKS, CONTATO E COPYRIGHT
      ========================================================================= */}
      <footer className="border-t border-neutral-800/80 bg-[#080a0e] py-12 px-4 sm:px-6 lg:px-8 text-xs font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-display font-bold text-white">FORJA<span className="text-amber-500">OS</span></span>
            <span>·</span>
            <span>Sistema Operacional & Simulador CAD 2D para Serralherias</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#simulador-section" className="hover:text-neutral-300 transition-colors">Simulador</a>
            <a href="#beneficios" className="hover:text-neutral-300 transition-colors">Benefícios</a>
            <a href="#planos" className="hover:text-neutral-300 transition-colors">Preços</a>
            <button onClick={onOpenApp} className="hover:text-amber-400 transition-colors font-medium text-neutral-300">
              Acesso ao Sistema
            </button>
          </div>

          <div>
            © 2026 ForjaOS Tecnologia Metalúrgica Ltda. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};
