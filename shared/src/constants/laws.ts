export interface LawInfo {
  code: string;
  name: string;
  shortName: string;
  planaltoPath: string;
}

export const LAWS: LawInfo[] = [
  {
    code: 'CF',
    name: 'Constituição Federal de 1988',
    shortName: 'CF/88',
    planaltoPath: 'constituicao/constituicao.htm',
  },
  {
    code: 'CC',
    name: 'Código Civil',
    shortName: 'CC',
    planaltoPath: 'leis/2002/l10406compilada.htm',
  },
  {
    code: 'CP',
    name: 'Código Penal',
    shortName: 'CP',
    planaltoPath: 'decreto-lei/del2848compilado.htm',
  },
  {
    code: 'CPC',
    name: 'Código de Processo Civil',
    shortName: 'CPC',
    planaltoPath: 'leis/2015/l13105.htm',
  },
  {
    code: 'CPP',
    name: 'Código de Processo Penal',
    shortName: 'CPP',
    planaltoPath: 'decreto-lei/del3689compilado.htm',
  },
  {
    code: 'CLT',
    name: 'Consolidação das Leis do Trabalho',
    shortName: 'CLT',
    planaltoPath: 'decreto-lei/del5452compilado.htm',
  },
  {
    code: 'CDC',
    name: 'Código de Defesa do Consumidor',
    shortName: 'CDC',
    planaltoPath: 'leis/l8078compilado.htm',
  },
  {
    code: 'CTN',
    name: 'Código Tributário Nacional',
    shortName: 'CTN',
    planaltoPath: 'leis/l5172compilado.htm',
  },
  {
    code: 'ECA',
    name: 'Estatuto da Criança e do Adolescente',
    shortName: 'ECA',
    planaltoPath: 'leis/l8069compilado.htm',
  },
  {
    code: 'LGPD',
    name: 'Lei Geral de Proteção de Dados',
    shortName: 'LGPD',
    planaltoPath: 'leis/2018/l13709.htm',
  },
];

export const LAW_CODES = LAWS.map((l) => l.code);
