import { TipoPeca, GenesPeca, DimensoesPeca, MetricasCalculadas, FamiliaPadrao } from '../types';

/**
 * Converte uma seed numérica em um conjunto determinístico de genes
 * usando multiplicação e módulo por números primos distintos.
 */
export function seedParaGenes(seed: number, tipo: TipoPeca): GenesPeca {
  const s = Math.abs(Math.floor(seed)) || 1337;

  // Primos para derivação determinística e descorrelacionada
  const p1 = 101;
  const p2 = 103;
  const p3 = 107;
  const p4 = 109;
  const p5 = 113;
  const p6 = 127;
  const p7 = 131;
  const p8 = 137;

  // Famílias de padrão
  const familias: FamiliaPadrao[] = ['reto', 'ondulado', 'cruzado', 'geometrico'];
  const familiaIdx = ((s * p7) % 100) % familias.length;
  const familia = familias[familiaIdx];

  // Genes contínuos mapeados estritamente para seus intervalos:
  // angulo: 0 a 90
  const angulo = Number((((s * p1) % 900) / 10).toFixed(1));
  // amplitude: 0 a 40
  const amplitude = Number((((s * p2) % 400) / 10).toFixed(1));
  // frequencia: 0.5 a 20
  const frequencia = Number((0.5 + ((s * p3) % 195) / 10).toFixed(1));
  // espessura: 1 a 8 cm
  const espessura = Number((1 + ((s * p4) % 70) / 10).toFixed(1));
  // espacamento: 5 a 30 cm
  const espacamento = Number((5 + ((s * p5) % 250) / 10).toFixed(1));
  // assimetria: -1 a 1
  const assimetria = Number(((((s * p6) % 200) - 100) / 100).toFixed(2));

  const genes: GenesPeca = {
    angulo,
    amplitude,
    frequencia,
    espessura,
    espacamento,
    assimetria,
    familia
  };

  if (tipo === 'corrimao') {
    // inclinacaoEscada: 0 a 45 graus
    genes.inclinacaoEscada = Number((((s * p8) % 450) / 10).toFixed(1));
  } else if (tipo === 'guarda-corpo') {
    // Fixo pela NBR 14718 (mínimo 110cm)
    genes.alturaMinimaSeguranca = 110;
  } else if (tipo === 'portao') {
    genes.temMoldura = ((s * p8) % 10) > 1; // 80% de chance de moldura
    const estilos: ('tubular' | 'industrial' | 'cantoneira' | 'minimalista')[] = [
      'tubular', 'industrial', 'cantoneira', 'minimalista'
    ];
    genes.estiloMoldura = estilos[((s * p8) % estilos.length)];
  }

  return genes;
}

/**
 * Funções matemáticas puras para as famílias de padrões.
 * Todas recebem dimensoes e recalculam dinamicamente a quantidade de barras e nós.
 */

// 1. Padrão Reto
function desenharPadraoReto(
  largura: number,
  altura: number,
  genes: GenesPeca,
  cor: string,
  strokeW: number
): { svgContent: string; totalMetrosBarras: number; numBarras: number; numSoldas: number } {
  const { espacamento, angulo, assimetria } = genes;
  const rad = (angulo * Math.PI) / 180;
  const skewOffset = Math.tan(rad) * altura;
  const step = Math.max(4, espacamento);

  const startX = -Math.abs(skewOffset);
  const endX = largura + Math.abs(skewOffset);
  const rawCount = Math.ceil((endX - startX) / step);

  let paths = '';
  let totalComprimento = 0;
  let count = 0;

  for (let i = 0; i <= rawCount; i++) {
    // Assimetria modula sutilmente o passo progressivo
    const t = i / rawCount;
    const offsetFactor = 1 + (assimetria * (t - 0.5));
    const xBase = startX + (i * step * offsetFactor);

    const x1 = xBase;
    const y1 = altura;
    const x2 = xBase + skewOffset;
    const y2 = 0;

    // Apenas barras que interceptam a área da peça
    if ((x1 >= -10 && x1 <= largura + 10) || (x2 >= -10 && x2 <= largura + 10)) {
      paths += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${cor}" stroke-width="${strokeW}" stroke-linecap="square" />\n`;
      const comp = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(altura, 2));
      totalComprimento += comp;
      count++;
    }
  }

  return {
    svgContent: paths,
    totalMetrosBarras: totalComprimento / 100,
    numBarras: count,
    numSoldas: count * 2
  };
}

// 2. Padrão Ondulado (Curva senoidal pura)
function desenharPadraoOndulado(
  largura: number,
  altura: number,
  genes: GenesPeca,
  cor: string,
  strokeW: number
): { svgContent: string; totalMetrosBarras: number; numBarras: number; numSoldas: number } {
  const { amplitude, frequencia, espacamento, assimetria } = genes;
  const step = Math.max(5, espacamento);
  const numColunas = Math.ceil(largura / step);

  let paths = '';
  let totalComprimento = 0;
  let count = 0;

  const resY = 40; // subdivisões verticais para a curva
  const dy = altura / resY;

  for (let c = 0; c <= numColunas; c++) {
    const t = c / Math.max(1, numColunas);
    const assymMod = 1 + (assimetria * 0.4 * Math.sin(t * Math.PI));
    const baseX = c * step * assymMod;

    let d = '';
    let compColuna = 0;
    let prevX = baseX;
    let prevY = 0;

    for (let j = 0; j <= resY; j++) {
      const y = j * dy;
      // Função senoidal pura: x(y) = baseX + A * sin(2π * f * (y/altura) + fase)
      const fase = c * 0.35;
      const freqNorm = (Math.max(0.5, frequencia) * 2 * Math.PI * (y / Math.max(1, altura)));
      const x = baseX + (amplitude * Math.sin(freqNorm + fase));

      if (j === 0) {
        d += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
        prevX = x;
        prevY = y;
      } else {
        d += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
        compColuna += Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
        prevX = x;
        prevY = y;
      }
    }

    paths += `<path d="${d}" stroke="${cor}" stroke-width="${strokeW}" fill="none" stroke-linecap="round" stroke-linejoin="round" />\n`;
    totalComprimento += compColuna;
    count++;
  }

  return {
    svgContent: paths,
    totalMetrosBarras: totalComprimento / 100,
    numBarras: count,
    numSoldas: count * 2
  };
}

// 3. Padrão Cruzado (Treliça sobreposta com angulo e -angulo)
function desenharPadraoCruzado(
  largura: number,
  altura: number,
  genes: GenesPeca,
  cor: string,
  strokeW: number
): { svgContent: string; totalMetrosBarras: number; numBarras: number; numSoldas: number } {
  const { espacamento, angulo, assimetria } = genes;
  const anguloEfetivo = Math.max(15, Math.min(75, angulo || 45));
  const rad = (anguloEfetivo * Math.PI) / 180;
  const skew = Math.tan(rad) * altura;
  const step = Math.max(6, espacamento);

  let paths = '';
  let totalComprimento = 0;
  let countCamada1 = 0;
  let countCamada2 = 0;

  // Camada 1: +angulo
  const minX1 = -skew;
  const maxX1 = largura + skew;
  const n1 = Math.ceil((maxX1 - minX1) / step);

  for (let i = 0; i <= n1; i++) {
    const t = i / n1;
    const xBase = minX1 + (i * step * (1 + assimetria * 0.2 * t));
    const x1 = xBase;
    const y1 = altura;
    const x2 = xBase + skew;
    const y2 = 0;

    if ((x1 >= -15 && x1 <= largura + 15) || (x2 >= -15 && x2 <= largura + 15)) {
      paths += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${cor}" stroke-width="${strokeW}" opacity="0.95" />\n`;
      totalComprimento += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(altura, 2));
      countCamada1++;
    }
  }

  // Camada 2: -angulo
  const minX2 = 0;
  const maxX2 = largura + 2 * skew;
  const n2 = Math.ceil((maxX2 - minX2) / step);

  for (let i = 0; i <= n2; i++) {
    const t = i / n2;
    const xBase = minX2 + (i * step * (1 - assimetria * 0.2 * t));
    const x1 = xBase;
    const y1 = altura;
    const x2 = xBase - skew;
    const y2 = 0;

    if ((x1 >= -15 && x1 <= largura + 15) || (x2 >= -15 && x2 <= largura + 15)) {
      paths += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${cor}" stroke-width="${strokeW}" opacity="0.95" />\n`;
      totalComprimento += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(altura, 2));
      countCamada2++;
    }
  }

  // Soldas estimadas nos cruzamentos internos
  const soldasCruzamento = Math.floor((countCamada1 * countCamada2) * 0.45);

  return {
    svgContent: paths,
    totalMetrosBarras: totalComprimento / 100,
    numBarras: countCamada1 + countCamada2,
    numSoldas: (countCamada1 + countCamada2) * 2 + soldasCruzamento
  };
}

// 4. Padrão Geométrico (Módulos de Losango / Grid paramétrico estrutural)
function desenharPadraoGeometrico(
  largura: number,
  altura: number,
  genes: GenesPeca,
  cor: string,
  strokeW: number
): { svgContent: string; totalMetrosBarras: number; numBarras: number; numSoldas: number } {
  const { espacamento, amplitude, frequencia, assimetria } = genes;
  const cellW = Math.max(10, espacamento * 1.6);
  const cellH = Math.max(10, (espacamento * 1.6) * (1 + (amplitude / 60)));

  const cols = Math.ceil(largura / cellW) + 1;
  const rows = Math.ceil(altura / cellH) + 1;

  let paths = '';
  let totalComprimento = 0;
  let numModulos = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * cellW + (r % 2 === 1 ? cellW / 2 : 0);
      const cy = r * cellH;

      // Leve modulação por assimetria e frequencia
      const modX = assimetria * 2 * Math.sin(c * (frequencia * 0.1));
      const hw = (cellW / 2) * 0.95;
      const hh = (cellH / 2) * 0.95;

      const pTop = `${(cx + modX).toFixed(2)},${(cy - hh).toFixed(2)}`;
      const pRight = `${(cx + hw + modX).toFixed(2)},${cy.toFixed(2)}`;
      const pBottom = `${(cx + modX).toFixed(2)},${(cy + hh).toFixed(2)}`;
      const pLeft = `${(cx - hw + modX).toFixed(2)},${cy.toFixed(2)}`;

      paths += `<polygon points="${pTop} ${pRight} ${pBottom} ${pLeft}" stroke="${cor}" stroke-width="${strokeW}" fill="none" stroke-linejoin="round" />\n`;

      const perimetro = 4 * Math.sqrt(Math.pow(hw, 2) + Math.pow(hh, 2));
      totalComprimento += perimetro;
      numModulos++;
    }
  }

  return {
    svgContent: paths,
    totalMetrosBarras: totalComprimento / 100,
    numBarras: numModulos * 4,
    numSoldas: numModulos * 4
  };
}

/**
 * Função central `gerarPecaSVG(tipo, genes, dimensoes)`
 * Roteia para a lógica de desenho correta e retorna string SVG válida.
 */
export function gerarPecaSVG(
  tipo: TipoPeca,
  genes: GenesPeca,
  dimensoes: DimensoesPeca,
  cor: string = '#262930'
): string {
  let { largura, altura } = dimensoes;

  // Guarda-corpo exige altura mínima de norma (NBR 14718)
  if (tipo === 'guarda-corpo') {
    const alturaNorma = genes.alturaMinimaSeguranca || 110;
    altura = Math.max(altura, alturaNorma);
  }

  // Espessura do traço convertida de cm para escala do SVG
  // 1cm de espessura equivale a ~strokeW 2.5 no viewBox em centímetros
  const strokeW = Math.max(1.2, genes.espessura * 0.85);
  const strokeMoldura = strokeW * 2.2;

  // Margem de visualização (padding técnico)
  const pad = 24;
  const vbW = largura + pad * 2;
  const vbH = altura + pad * 2;

  // Seleciona a família matemática
  let interior: { svgContent: string; totalMetrosBarras: number; numBarras: number; numSoldas: number };

  switch (genes.familia) {
    case 'ondulado':
      interior = desenharPadraoOndulado(largura, altura, genes, cor, strokeW);
      break;
    case 'cruzado':
      interior = desenharPadraoCruzado(largura, altura, genes, cor, strokeW);
      break;
    case 'geometrico':
      interior = desenharPadraoGeometrico(largura, altura, genes, cor, strokeW);
      break;
    case 'reto':
    default:
      interior = desenharPadraoReto(largura, altura, genes, cor, strokeW);
      break;
  }

  // Elementos estruturais externos de acordo com o tipo
  let molduraSVG = '';
  let transformCorrimao = '';

  if (tipo === 'corrimao') {
    const anguloEscada = genes.inclinacaoEscada || 30;
    // O corrimão é inclinado pelo ângulo da escada
    // Adiciona tubo superior (empunhadura) e montantes de fixação no piso
    const compMontante = 90;
    const numMontantes = Math.max(2, Math.floor(largura / 90) + 1);
    let montantes = '';
    for (let m = 0; m < numMontantes; m++) {
      const mx = (m / (numMontantes - 1)) * largura;
      montantes += `<line x1="${mx.toFixed(2)}" y1="0" x2="${mx.toFixed(2)}" y2="${compMontante}" stroke="${cor}" stroke-width="${strokeMoldura}" stroke-linecap="square" />\n`;
      // Flange de fixação no piso
      montantes += `<rect x="${(mx - 6).toFixed(2)}" y="${compMontante - 3}" width="12" height="4" fill="${cor}" rx="1" />\n`;
    }

    molduraSVG = `
      <!-- Tubo Superior de Empunhadura de Conforto (Corrimão NBR 9050) -->
      <line x1="0" y1="0" x2="${largura}" y2="0" stroke="${cor}" stroke-width="${strokeMoldura * 1.3}" stroke-linecap="round" />
      <line x1="0" y1="12" x2="${largura}" y2="12" stroke="${cor}" stroke-width="${strokeMoldura * 0.8}" stroke-linecap="round" />
      ${montantes}
    `;

    // Inclinação visual de escada com cisalhamento/rotação
    if (anguloEscada > 0) {
      const radSkew = (-anguloEscada * Math.PI) / 180;
      transformCorrimao = `transform="skewY(${(-anguloEscada * 0.4).toFixed(2)})"`;
    }
  } else if (tipo === 'guarda-corpo') {
    // Guarda-corpo: montantes robustos a cada 80-100cm e corrimão contínuo no topo
    const numPostes = Math.max(2, Math.floor(largura / 90) + 1);
    let postes = '';
    for (let p = 0; p < numPostes; p++) {
      const px = (p / (numPostes - 1)) * largura;
      postes += `<line x1="${px.toFixed(2)}" y1="0" x2="${px.toFixed(2)}" y2="${altura}" stroke="${cor}" stroke-width="${strokeMoldura * 1.2}" />\n`;
      // Sapatas de ancoragem química no piso
      postes += `<rect x="${(px - 7).toFixed(2)}" y="${altura - 4}" width="14" height="6" fill="${cor}" rx="1" />\n`;
    }

    molduraSVG = `
      <!-- Peitoril Superior e Travessa Inferior de Segurança -->
      <line x1="0" y1="0" x2="${largura}" y2="0" stroke="${cor}" stroke-width="${strokeMoldura * 1.4}" stroke-linecap="round" />
      <line x1="0" y1="10" x2="${largura}" y2="10" stroke="${cor}" stroke-width="${strokeMoldura * 0.7}" />
      <line x1="0" y1="${altura}" x2="${largura}" y2="${altura}" stroke="${cor}" stroke-width="${strokeMoldura}" />
      ${postes}
    `;
  } else if (tipo === 'portao') {
    if (genes.temMoldura ?? true) {
      const estilo = genes.estiloMoldura || 'tubular';
      const mOffset = estilo === 'industrial' ? 8 : 5;

      molduraSVG = `
        <!-- Moldura Perimetral de Aço Carbono Estrutural -->
        <rect x="0" y="0" width="${largura}" height="${altura}" fill="none" stroke="${cor}" stroke-width="${strokeMoldura}" rx="${estilo === 'tubular' ? 2 : 0}" />
        <rect x="${mOffset}" y="${mOffset}" width="${largura - mOffset * 2}" height="${altura - mOffset * 2}" fill="none" stroke="${cor}" stroke-width="${strokeW * 0.8}" opacity="0.75" />
        <!-- Puxador Arquitetônico Embutido / Dobradiças Reforçadas -->
        <rect x="${largura - 12}" y="${(altura / 2) - 30}" width="4" height="60" fill="${cor}" rx="2" />
        <circle cx="${largura - 10}" cy="${altura / 2}" r="2" fill="#e5e7eb" />
        <!-- Conjunto de Dobradiças com Rolamento -->
        <rect x="-3" y="${altura * 0.15}" width="6" height="14" fill="${cor}" rx="1" />
        <rect x="-3" y="${altura * 0.5}" width="6" height="14" fill="${cor}" rx="1" />
        <rect x="-3" y="${altura * 0.85}" width="6" height="14" fill="${cor}" rx="1" />
      `;
    }
  } else if (tipo === 'grade') {
    // Grade: requadro de barra chata ou cantoneira com garras de chumbamento
    molduraSVG = `
      <!-- Requadro de Grade para Fixação em Alvenaria -->
      <rect x="0" y="0" width="${largura}" height="${altura}" fill="none" stroke="${cor}" stroke-width="${strokeMoldura}" />
      <!-- Garras de Chumbamento / Cravos Laterais -->
      <line x1="-8" y1="${altura * 0.2}" x2="0" y2="${altura * 0.2}" stroke="${cor}" stroke-width="3" />
      <line x1="-8" y1="${altura * 0.8}" x2="0" y2="${altura * 0.8}" stroke="${cor}" stroke-width="3" />
      <line x1="${largura}" y1="${altura * 0.2}" x2="${largura + 8}" y2="${altura * 0.2}" stroke="${cor}" stroke-width="3" />
      <line x1="${largura}" y1="${altura * 0.8}" x2="${largura + 8}" y2="${altura * 0.8}" stroke="${cor}" stroke-width="3" />
    `;
  }

  // Montagem final do SVG com clipPath para conter as barras estritamente na peça
  const clipId = `clip-${Math.random().toString(36).substring(2, 9)}`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}" class="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
  <defs>
    <clipPath id="${clipId}">
      <rect x="0" y="0" width="${largura}" height="${altura}" rx="1" />
    </clipPath>
    <linearGradient id="metalShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
    </linearGradient>
  </defs>

  <g transform="translate(${pad}, ${pad})">
    <!-- Fundo de contraste técnico -->
    <rect x="0" y="0" width="${largura}" height="${altura}" fill="#0f1217" opacity="0.3" />

    <!-- Conteúdo Interno Clipado com Padrão Matemático -->
    <g clip-path="url(#${clipId})" ${transformCorrimao}>
      ${interior.svgContent}
    </g>

    <!-- Moldura e Elementos Estruturais -->
    ${molduraSVG}

    <!-- Brilho sutil metálico -->
    <rect x="0" y="0" width="${largura}" height="${altura}" fill="url(#metalShine)" pointer-events="none" />
  </g>
</svg>`.trim();

  return svg;
}

/**
 * Calcula todas as métricas físicas, quantitativas e financeiras reais
 * para orçamento instantâneo e ordem de produção.
 */
export function calcularMetricas(
  tipo: TipoPeca,
  genes: GenesPeca,
  dimensoes: DimensoesPeca,
  perfilKgPorMetro: number = 1.45 // Ex: Metalon 30x20x1.20mm ~1.45kg/m
): MetricasCalculadas {
  let { largura, altura } = dimensoes;
  if (tipo === 'guarda-corpo') {
    altura = Math.max(altura, genes.alturaMinimaSeguranca || 110);
  }

  // 1. Metros de moldura
  const perimetroMoldura = (largura * 2 + altura * 2) / 100;

  // 2. Metros de barras internas
  let metrosInterno = 0;
  let qtdBarras = 0;
  let cordaoSoldaCm = 0;

  const step = Math.max(4, genes.espacamento);

  if (genes.familia === 'reto') {
    const rad = (genes.angulo * Math.PI) / 180;
    const skewOffset = Math.tan(rad) * altura;
    const count = Math.ceil((largura + Math.abs(skewOffset)) / step);
    const compMedia = Math.sqrt(Math.pow(skewOffset, 2) + Math.pow(altura, 2)) / 100;
    metrosInterno = count * compMedia;
    qtdBarras = count;
    cordaoSoldaCm = count * 2 * (genes.espessura * 2.5);
  } else if (genes.familia === 'ondulado') {
    const count = Math.ceil(largura / step);
    const compOndulada = (altura * 1.18) / 100;
    metrosInterno = count * compOndulada;
    qtdBarras = count;
    cordaoSoldaCm = count * 2 * (genes.espessura * 2.5);
  } else if (genes.familia === 'cruzado') {
    const angulo = Math.max(15, genes.angulo || 45);
    const rad = (angulo * Math.PI) / 180;
    const skew = Math.tan(rad) * altura;
    const count = Math.ceil((largura + skew * 2) / step) * 2;
    const compMedia = Math.sqrt(Math.pow(skew, 2) + Math.pow(altura, 2)) / 100;
    metrosInterno = count * compMedia;
    qtdBarras = count;
    const cruzamentos = Math.floor(Math.pow(count / 2, 2) * 0.35);
    cordaoSoldaCm = (count * 2 + cruzamentos) * (genes.espessura * 1.8);
  } else {
    // Geométrico
    const cellW = Math.max(10, step * 1.6);
    const cellH = Math.max(10, step * 1.6 * (1 + genes.amplitude / 60));
    const modulos = Math.ceil(largura / cellW) * Math.ceil(altura / cellH);
    const compPorModulo = (4 * Math.sqrt(Math.pow(cellW / 2, 2) + Math.pow(cellH / 2, 2))) / 100;
    metrosInterno = modulos * compPorModulo;
    qtdBarras = modulos * 4;
    cordaoSoldaCm = modulos * 4 * (genes.espessura * 1.5);
  }

  const metrosLinearTotal = Number((perimetroMoldura + metrosInterno).toFixed(2));
  const pesoEstimadoKg = Number((metrosLinearTotal * perfilKgPorMetro).toFixed(1));

  // Custos industriais de Serralheria
  // Preço médio do aço: R$ 14,80 por kg
  const precoKgAco = 14.80;
  const custoMaterial = Number((pesoEstimadoKg * precoKgAco).toFixed(2));

  // Custo de eletrodo/arame MIG + discos de corte/desbaste por cm de solda
  // R$ 0,18 por cm de cordão de solda + discos
  const custoSoldaConsumiveis = Number((cordaoSoldaCm * 0.18 + (metrosLinearTotal / 6) * 4.5).toFixed(2));

  // Tempo de produção: corte + montagem/solda + esmerilhamento + pintura
  const horasProducao = Number((2.5 + (metrosLinearTotal * 0.15) + (cordaoSoldaCm * 0.008)).toFixed(1));
  // Custo da hora do serralheiro/soldador: R$ 45,00/h
  const custoMaoDeObra = Number((horasProducao * 45.0).toFixed(2));

  const custoTotalProducao = Number((custoMaterial + custoSoldaConsumiveis + custoMaoDeObra).toFixed(2));

  // Margem alvo padrão de serralheria de alto padrão (50% a 65% de markup)
  const markup = tipo === 'portao' ? 1.65 : tipo === 'guarda-corpo' ? 1.70 : 1.55;
  const precoVendaSugerido = Number((custoTotalProducao * markup).toFixed(2));
  const margemEstimada = Number((((precoVendaSugerido - custoTotalProducao) / precoVendaSugerido) * 100).toFixed(1));

  return {
    metrosLinearTotal,
    pesoEstimadoKg,
    cordaoSoldaCm: Math.round(cordaoSoldaCm),
    qtdBarras,
    qtdModulos: Math.round(qtdBarras / 4),
    custoMaterial,
    custoSoldaConsumiveis,
    custoMaoDeObra,
    custoTotalProducao,
    precoVendaSugerido,
    margemEstimada,
    tempoProducaoHoras: horasProducao
  };
}

/**
 * Cores nobres de pintura eletrostática a pó e acabamentos industriais
 */
export const CORES_PINTURA = [
  { nome: 'Preto Fosco Nobre', hex: '#16181d', textColor: '#ffffff' },
  { nome: 'Grafite Acetinado (RAL 7016)', hex: '#374151', textColor: '#ffffff' },
  { nome: 'Aço Corten Industrial', hex: '#8c4323', textColor: '#ffffff' },
  { nome: 'Bronze Forja Champanhe', hex: '#785b3b', textColor: '#ffffff' },
  { nome: 'Branco Neve Eletrostático', hex: '#e2e8f0', textColor: '#0f172a' },
  { nome: 'Aço Carbono Cru Fosfatizado', hex: '#4b5563', textColor: '#ffffff' },
];
