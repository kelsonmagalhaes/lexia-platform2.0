export interface PeriodInfo {
  period: number;
  label: string;
  disciplines: DisciplineRef[];
}

export interface DisciplineRef {
  name: string;
  isEad?: boolean;
  prerequisites?: string[];
}

export interface CurriculumPeriod {
  period: number;
  label: string;
  disciplines: DisciplineRef[];
}
