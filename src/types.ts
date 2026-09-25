export type TipoPeca = 'portao' | 'grade' | 'corrimao' | 'guarda-corpo';

export type FamiliaPadrao = 'reto' | 'ondulado' | 'cruzado' | 'geometrico';

export type EstiloMoldura = 'tubular' | 'industrial' | 'cantoneira' | 'minimalista';

export interface GenesPeca {
  // Genes comuns (contínuos)
  angulo: number;        // 0 a 90 graus
  amplitude: number;     // 0 a 40 intensidade de curvatura
  frequencia: number;    // 0 a 20 repetição ao longo do comprimento
  espessura: number;     // 1 a 8 largura da barra em cm
  espacamento: number;   // 5 a 30 distância entre barras em cm
  assimetria: number;    // -1 a 1 tendência a pender para um lado

  // Genes específicos
  inclinacaoEscada?: number;        // 0 a 45 graus (corrimao)
  alturaMinimaSeguranca?: number;   // Fixo 110cm pela NBR 14718 (guarda-corpo)
  temMoldura?: boolean;             // portao
  estiloMoldura?: EstiloMoldura;    // portao
  familia: FamiliaPadrao;           // família matemática
}

export interface DimensoesPeca {
  largura: number; // em cm (ex: 300cm = 3m)
  altura: number;  // em cm (ex: 220cm = 2.2m)
}

export interface PresetEstilo {
  id: string;
  nome: string;
  tipo: TipoPeca;
  genes: GenesPeca;
  corHex: string;
  corNome: string;
  dataCriacao: string;
  descricao?: string;
  tags?: string[];
  isCustom?: boolean;
}

export interface MetricasCalculadas {
  metrosLinearTotal: number;
  pesoEstimadoKg: number;
  cordaoSoldaCm: number;
  qtdBarras: number;
  qtdModulos: number;
  custoMaterial: number;
  custoSoldaConsumiveis: number;
  custoMaoDeObra: number;
  custoTotalProducao: number;
  precoVendaSugerido: number;
  margemEstimada: number;
  tempoProducaoHoras: number;
}

export type StatusOS = 'aguardando' | 'cortando' | 'soldando' | 'pintando' | 'pronto' | 'instalado';

export interface ItemEtapaChecklist {
  id: string;
  descricao: string;
  concluido: boolean;
  responsavel?: string;
}

export interface OrdemServico {
  id: string;
  numeroOS: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEndereco: string;
  tipo: TipoPeca;
  titulo: string;
  dimensoes: DimensoesPeca;
  genes: GenesPeca;
  corHex: string;
  corNome: string;
  perfilMaterial: string;
  status: StatusOS;
  dataCriacao: string;
  dataPrometida: string;
  prazoApertado: boolean;
  valorTotal: number;
  valorEntrada: number;
  valorRestante: number;
  custoReal: number;
  checklist: ItemEtapaChecklist[];
  observacoes: string;
  responsavelCorte: string;
  responsavelSolda: string;
  responsavelPintura: string;
  assinaturaClienteUrl?: string;
  fotosAntesDepois?: {
    antes?: string;
    depois?: string;
  };
  retrabalhoHoras?: number;
  retrabalhoMotivo?: string;
}

export interface OrçamentoItem {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  endereco: string;
  tipo: TipoPeca;
  descricao: string;
  dimensoes: DimensoesPeca;
  genes: GenesPeca;
  corHex: string;
  corNome: string;
  valor: number;
  custoPrevisto: number;
  dataCriacao: string;
  validadeDias: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'convertido_os';
  diasSemResposta: number;
  assinaturaDigital?: string;
  dataAprovacao?: string;
}

export interface ItemEstoque {
  id: string;
  codigo: string;
  nome: string;
  categoria: 'metalon' | 'chapa' | 'cantoneira' | 'barra' | 'consumivel';
  unidade: 'barra_6m' | 'chapa' | 'kg' | 'unidade' | 'litro';
  quantidadeAtual: number;
  estoqueMinimo: number;
  custoUnitario: number;
  fornecedorPrincipal: string;
  prazoEntregaDias: number;
}

export interface AgendamentoInstalacao {
  id: string;
  osId: string;
  clienteNome: string;
  endereco: string;
  bairro: string;
  data: string;
  horario: string;
  equipe: string[];
  status: 'agendado' | 'a_caminho' | 'no_local' | 'concluido';
  checklist: {
    medicaoConferida: boolean;
    nivelamentoPrumo: boolean;
    fixacaoChumbadores: boolean;
    lubrificacaoRoldanas: boolean;
    retoquePintura: boolean;
    limpezaGeral: boolean;
  };
  assinaturaEntrega?: string;
}

export interface TransacaoFinanceira {
  id: string;
  data: string;
  descricao: string;
  tipo: 'entrada' | 'saida';
  categoria: 'venda_os' | 'compra_aco' | 'consumiveis' | 'mao_de_obra' | 'despesa_fixa';
  valor: number;
  status: 'pago' | 'pendente';
  vencimento: string;
  osIdRelacionada?: string;
}
