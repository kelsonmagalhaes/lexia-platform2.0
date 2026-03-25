export const CURRICULUM = [
  { period: 1, name: "1º Período", subjects: ["Introdução à Ciência Jurídica","Português Jurídico","Metodologia de Pesquisa","Psicologia e Proficiência Acadêmica","Introdução ao Pensamento Filosófico","Sociologia e Antropologia","Teoria Geral do Estado e Ciência Política"] },
  { period: 2, name: "2º Período", subjects: ["Filosofia do Direito","História do Direito","Sociologia Jurídica","Direito Constitucional I","Direito Civil I (Parte Geral)","Teoria Geral do Direito","Direito Penal I"] },
  { period: 3, name: "3º Período", subjects: ["Hermenêutica Jurídica","Economia","Direito Constitucional II","Direito Civil II (Obrigações)","Teoria Geral do Processo","Direito Penal II"] },
  { period: 4, name: "4º Período", subjects: ["Direito Constitucional III","Direitos Humanos","Direito Civil III (Responsabilidade Civil e Contratos)","Direito Processual Civil I","Direito Penal III"] },
  { period: 5, name: "5º Período", subjects: ["Direito Civil IV (Contratos)","Direito Processual Civil II","Direito Processual Penal I","Direito Empresarial I","Direito Administrativo I"] },
  { period: 6, name: "6º Período", subjects: ["Direito Civil V (Coisas)","Direito Processual Civil III","Direito Processual Penal II","Direito do Trabalho I","Direito Empresarial II","Direito Administrativo II"] },
  { period: 7, name: "7º Período", subjects: ["Direito Civil VI (Família)","Direito Processual Civil IV","Direito do Trabalho II","Direito Empresarial III","Estágio I - Prática Simulada Penal","Estágio I - Prática Real"] },
  { period: 8, name: "8º Período", subjects: ["Direito Civil VII (Sucessões)","Direito Processual do Trabalho I","Direito Tributário I","Ética Profissional","Estágio II - Prática Simulada Civil","Estágio II - Prática Real","Direito do Trabalho III","TCC"] },
  { period: 9, name: "9º Período", subjects: ["Direito Internacional I","Direito Tributário II","Direito do Consumidor","Direito Ambiental I","Direito Processual do Trabalho II","Estágio III - Prática Simulada Trabalho","Estágio III - Prática Real Trabalho"] },
  { period: 10, name: "10º Período", subjects: ["Direito Ambiental II","Direito e Tecnologia na Contemporaneidade","Direito Financeiro","Direito Internacional II","Direito Previdenciário","Estágio IV - Prática Real","Estágio IV - Prática Simulada","Mediação, Conciliação e Arbitragem","Tópicos em Controle de Constitucionalidade"] }
];

export const VADE_MECUM_LAWS = [
  { id: "cf", name: "Constituição Federal", abbr: "CF/88" },
  { id: "cc", name: "Código Civil", abbr: "CC" },
  { id: "cp", name: "Código Penal", abbr: "CP" },
  { id: "cpc", name: "Código de Processo Civil", abbr: "CPC" },
  { id: "cpp", name: "Código de Processo Penal", abbr: "CPP" },
  { id: "clt", name: "Consolidação das Leis do Trabalho", abbr: "CLT" },
  { id: "cdc", name: "Código de Defesa do Consumidor", abbr: "CDC" },
  { id: "ctn", name: "Código Tributário Nacional", abbr: "CTN" },
  { id: "eca", name: "Estatuto da Criança e do Adolescente", abbr: "ECA" },
  { id: "lei_maria_penha", name: "Lei Maria da Penha", abbr: "Lei 11.340/06" },
  { id: "lgpd", name: "Lei Geral de Proteção de Dados", abbr: "LGPD" },
];

export function getXPForLevel(level) { return level * 100; }
export function getLevelFromXP(xp) { return Math.floor(xp / 100) + 1; }
export function getLevelTitle(level) {
  if (level <= 5) return "Estudante";
  if (level <= 10) return "Acadêmico";
  if (level <= 20) return "Jurista";
  if (level <= 30) return "Mestre";
  if (level <= 50) return "Doutor";
  return "Catedrático";
}
