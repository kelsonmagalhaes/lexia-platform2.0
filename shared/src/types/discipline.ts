export interface Discipline {
  id: string;
  name: string;
  periodDefault: number;
  description?: string;
  prerequisites: string[];
  isEad: boolean;
}

export interface Topic {
  id: string;
  disciplineId: string;
  title: string;
  description?: string;
  contentMd?: string;
  displayOrder: number;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  contentMd: string;
  durationMin: number;
  displayOrder: number;
  xpReward: number;
}

export interface Institution {
  id: string;
  name: string;
  slug: string;
  isCustom: boolean;
}

export interface CurriculumEntry {
  id: string;
  institutionId?: string;
  period: number;
  disciplineId: string;
  displayOrder: number;
  isCustom: boolean;
  discipline?: Discipline;
}
