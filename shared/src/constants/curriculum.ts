import { CurriculumPeriod } from '../types/curriculum';

export const DEFAULT_CURRICULUM: CurriculumPeriod[] = [
  {
    period: 1,
    label: '1º Período',
    disciplines: [
      { name: 'Introdução à Ciência Jurídica' },
      { name: 'Português Jurídico' },
      { name: 'Metodologia de Pesquisa Científica' },
      { name: 'Psicologia e Proficiência Acadêmica' },
      { name: 'Introdução ao Pensamento Filosófico' },
      { name: 'Sociologia e Antropologia' },
      { name: 'Teoria Geral do Estado e Ciência Política' },
    ],
  },
  {
    period: 2,
    label: '2º Período',
    disciplines: [
      { name: 'Filosofia do Direito', prerequisites: ['Introdução ao Pensamento Filosófico'] },
      { name: 'História do Direito', isEad: true },
      { name: 'Sociologia Jurídica', prerequisites: ['Sociologia e Antropologia'] },
      { name: 'Direito Constitucional I', prerequisites: ['Teoria Geral do Estado e Ciência Política'] },
      { name: 'Direito Civil I (Parte Geral)', prerequisites: ['Introdução à Ciência Jurídica'] },
      { name: 'Teoria Geral do Direito', prerequisites: ['Introdução à Ciência Jurídica'] },
      { name: 'Direito Penal I', prerequisites: ['Introdução à Ciência Jurídica'] },
    ],
  },
  {
    period: 3,
    label: '3º Período',
    disciplines: [
      { name: 'Hermenêutica Jurídica', prerequisites: ['Teoria Geral do Direito'] },
      { name: 'Economia', isEad: true },
      { name: 'Direito Constitucional II', prerequisites: ['Direito Constitucional I'] },
      { name: 'Direito Civil II (Obrigações)', prerequisites: ['Direito Civil I (Parte Geral)'] },
      { name: 'Teoria Geral do Processo', prerequisites: ['Teoria Geral do Direito'] },
      { name: 'Direito Penal II', prerequisites: ['Direito Penal I'] },
    ],
  },
  {
    period: 4,
    label: '4º Período',
    disciplines: [
      { name: 'Direito Constitucional III', prerequisites: ['Direito Constitucional II'] },
      { name: 'Direitos Humanos', prerequisites: ['Direito Constitucional II'] },
      { name: 'Direito Civil III (Responsabilidade Civil e Contratos I)', prerequisites: ['Direito Civil II (Obrigações)'] },
      { name: 'Direito Processual Civil I', prerequisites: ['Teoria Geral do Processo'] },
      { name: 'Direito Penal III', prerequisites: ['Direito Penal II'] },
    ],
  },
  {
    period: 5,
    label: '5º Período',
    disciplines: [
      { name: 'Direito Civil IV (Contratos II)', prerequisites: ['Direito Civil III (Responsabilidade Civil e Contratos I)'] },
      { name: 'Direito Processual Civil II', prerequisites: ['Direito Processual Civil I'] },
      { name: 'Direito Processual Penal I', prerequisites: ['Direito Penal III', 'Teoria Geral do Processo'] },
      { name: 'Direito Empresarial I', prerequisites: ['Direito Civil II (Obrigações)'] },
      { name: 'Direito Administrativo I', prerequisites: ['Direito Constitucional II'] },
    ],
  },
  {
    period: 6,
    label: '6º Período',
    disciplines: [
      { name: 'Direito Civil V (Direito das Coisas)', prerequisites: ['Direito Civil IV (Contratos II)'] },
      { name: 'Direito Processual Civil III', prerequisites: ['Direito Processual Civil II'] },
      { name: 'Direito Processual Penal II', prerequisites: ['Direito Processual Penal I'] },
      { name: 'Direito do Trabalho I', prerequisites: ['Direito Constitucional II'] },
      { name: 'Direito Empresarial II', prerequisites: ['Direito Empresarial I'] },
      { name: 'Direito Administrativo II', prerequisites: ['Direito Administrativo I'] },
    ],
  },
  {
    period: 7,
    label: '7º Período',
    disciplines: [
      { name: 'Direito Civil VI (Direito de Família)', prerequisites: ['Direito Civil V (Direito das Coisas)'] },
      { name: 'Direito Processual Civil IV', prerequisites: ['Direito Processual Civil III'] },
      { name: 'Direito do Trabalho II', prerequisites: ['Direito do Trabalho I'] },
      { name: 'Direito Empresarial III', prerequisites: ['Direito Empresarial II'] },
      { name: 'Estágio I - Prática Simulada Penal', prerequisites: ['Direito Processual Penal II'] },
      { name: 'Estágio I - Prática Real', prerequisites: ['Direito Processual Penal II'] },
    ],
  },
  {
    period: 8,
    label: '8º Período',
    disciplines: [
      { name: 'Direito Civil VII (Sucessões)', prerequisites: ['Direito Civil VI (Direito de Família)'] },
      { name: 'Direito Processual do Trabalho I', prerequisites: ['Direito do Trabalho II'] },
      { name: 'Direito Tributário I', prerequisites: ['Direito Administrativo II'] },
      { name: 'Ética Profissional', prerequisites: ['Direito Civil I (Parte Geral)'] },
      { name: 'Estágio II - Prática Simulada Civil', prerequisites: ['Direito Processual Civil IV'] },
      { name: 'Estágio II - Prática Real', prerequisites: ['Direito Processual Civil IV'] },
      { name: 'Direito do Trabalho III', prerequisites: ['Direito do Trabalho II'] },
      { name: 'TCC (Trabalho de Conclusão de Curso)', prerequisites: ['Metodologia de Pesquisa Científica'] },
    ],
  },
  {
    period: 9,
    label: '9º Período',
    disciplines: [
      { name: 'Direito Internacional I', prerequisites: ['Direito Constitucional III', 'Direitos Humanos'] },
      { name: 'Direito Tributário II', prerequisites: ['Direito Tributário I'] },
      { name: 'Direito do Consumidor', prerequisites: ['Direito Civil IV (Contratos II)'] },
      { name: 'Direito Ambiental I', prerequisites: ['Direito Administrativo II'] },
      { name: 'Direito Processual do Trabalho II', prerequisites: ['Direito Processual do Trabalho I'] },
      { name: 'Estágio III - Prática Simulada Trabalho', prerequisites: ['Direito Processual do Trabalho I'] },
      { name: 'Estágio III - Prática Real Trabalho', prerequisites: ['Direito Processual do Trabalho I'] },
    ],
  },
  {
    period: 10,
    label: '10º Período',
    disciplines: [
      { name: 'Direito Ambiental II', prerequisites: ['Direito Ambiental I'] },
      { name: 'Direito e Tecnologia na Contemporaneidade', prerequisites: ['Direito Civil I (Parte Geral)'] },
      { name: 'Direito Financeiro', prerequisites: ['Direito Tributário II'] },
      { name: 'Direito Internacional II', prerequisites: ['Direito Internacional I'] },
      { name: 'Direito Previdenciário', prerequisites: ['Direito do Trabalho III'] },
      { name: 'Estágio IV - Prática Real (Área Adm. Pública e Dir. Difusos)', prerequisites: ['Direito Administrativo II', 'Direito Ambiental I'] },
      { name: 'Estágio IV - Prática Simulada', prerequisites: ['Direito Administrativo II'] },
      { name: 'Mediação, Conciliação e Arbitragem', prerequisites: ['Teoria Geral do Processo'] },
      { name: 'Tópicos em Controle de Constitucionalidade', prerequisites: ['Direito Constitucional III'] },
    ],
  },
];

export const PERIOD_LABELS: Record<number, string> = {
  1: '1º Período', 2: '2º Período', 3: '3º Período', 4: '4º Período',
  5: '5º Período', 6: '6º Período', 7: '7º Período', 8: '8º Período',
  9: '9º Período', 10: '10º Período',
};
