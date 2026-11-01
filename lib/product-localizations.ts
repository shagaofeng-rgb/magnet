import type { Locale } from "./i18n";

/** Complete, fact-preserving translations of approved English product records. */
const portugueseOverband = {
  productId: "24c3ec99-ab6e-46e9-a740-65c2fb482f85",
  metadata: {
    slug: "separador-magnetico-permanente-suspenso-24c3ec99",
    title: "Separador Magnético Permanente Suspenso",
    summary: "O separador magnético permanente suspenso é avaliado para aplicações em transportadores. A configuração depende do material, do metal ferroso a separar e das condições de instalação.",
    description: "Este equipamento integra a linha de separadores magnéticos para transportadores. A posição na linha, a apresentação do material e o arranjo de descarga orientam a configuração que pode ser cotada. A seleção é feita com os dados do processo e da instalação, sem presumir dimensões ou valores operacionais de outro modelo.",
    metaTitle: "Separador Magnético Permanente Suspenso | BZMAGNET",
    metaDescription: "Avalie um separador magnético permanente suspenso para transportadores. Envie dados do material, da correia e da instalação para análise e cotação.",
  },
  applicationTags: ["Separação magnética", "Transportadores", "Análise de instalação"],
  quickFacts: [
    ["Processo adequado", "Separação magnética em transportador, conforme os dados do processo"],
    ["Tipo de equipamento", "Separador magnético permanente suspenso"],
    ["Posição de instalação", "Sobre a correia ou em ponto de transferência a confirmar"],
    ["Modo de limpeza", "Definido para a configuração selecionada"],
  ],
  principle: "O sistema magnético permanente é avaliado para a função de separação prevista no processo. A adequação depende da apresentação do material, do metal ferroso alvo e da posição disponível para instalação.",
  applications: [{
    title: "Avaliação da aplicação",
    context: "A aplicação é analisada conforme o fluxo de material e as condições de alimentação do transportador.",
    placement: "Posição confirmada sobre a correia ou em um ponto de transferência",
    material: "Material definido com base nos dados fornecidos pelo comprador",
  }],
  selectionInputs: [
    "Material e faixa de tamanho das partículas",
    "Metal ferroso a separar",
    "Largura e velocidade da correia, além da altura da camada de material",
    "Vazão do processo",
    "Posição de suspensão e espaço disponível",
    "Condições ambientais e energia disponível",
  ],
  specifications: [
    { label: "Tipo de ímã", display: "Sistema magnético permanente" },
    { label: "Modelo e dimensões", display: "Mediante solicitação" },
    { label: "Valores operacionais", display: "Mediante solicitação" },
  ],
  options: [{ label: "Configuração específica do projeto", display: "Mediante solicitação" }],
  limitations: ["A adequação e a configuração finais dependem dos dados do material, do processo, da instalação e da operação fornecidos para análise."],
  maintenance: ["Antes da instalação, confirme o acesso necessário para inspeção e limpeza da configuração selecionada."],
  faq: [
    { question: "Quais dados são necessários para avaliar este separador?", answer: "Informe o material, o metal ferroso alvo, a vazão, a posição no processo, as dimensões disponíveis, o ambiente e o arranjo operacional necessário." },
    { question: "As dimensões e os valores operacionais são iguais em todos os projetos?", answer: "Não. Eles são confirmados para a configuração selecionada após a análise dos dados da aplicação." },
    { question: "Esta página confirma a adequação final do equipamento?", answer: "Não. A adequação final depende das condições reais do processo e da instalação informadas para análise." },
  ],
} as const;

export function detailedProductLocalization(productId: string, locale: Locale) {
  return locale === "pt" && productId === portugueseOverband.productId ? portugueseOverband : null;
}
