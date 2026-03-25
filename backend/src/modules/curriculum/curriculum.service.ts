import { pool } from '../../config/database';
import { DEFAULT_CURRICULUM } from '@lexstudy/shared';
import { AppError } from '../../middleware/errorHandler';

export async function getCurriculum(institutionId?: string) {
  if (!institutionId) {
    return DEFAULT_CURRICULUM;
  }

  const result = await pool.query(
    `SELECT c.period, c.display_order, d.id, d.name, d.description, d.is_ead, d.prerequisites
     FROM curricula c
     JOIN disciplines d ON c.discipline_id = d.id
     WHERE c.institution_id = $1
     ORDER BY c.period, c.display_order`,
    [institutionId]
  );

  if (result.rows.length === 0) {
    return DEFAULT_CURRICULUM;
  }

  const byPeriod: Record<number, typeof result.rows> = {};
  for (const row of result.rows) {
    if (!byPeriod[row.period]) byPeriod[row.period] = [];
    byPeriod[row.period].push(row);
  }

  return Object.entries(byPeriod).map(([period, disciplines]) => ({
    period: Number(period),
    label: `${period}º Período`,
    disciplines: disciplines.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      isEad: d.is_ead,
      prerequisites: d.prerequisites || [],
    })),
  }));
}

export async function getPeriodCurriculum(period: number, institutionId?: string) {
  if (period < 1 || period > 10) {
    throw new AppError(400, 'Período deve ser entre 1 e 10');
  }

  const full = await getCurriculum(institutionId);
  const periodData = full.find((p: { period: number }) => p.period === period);

  if (!periodData) {
    throw new AppError(404, 'Período não encontrado');
  }

  return periodData;
}

export async function seedDefaultCurriculum() {
  for (const period of DEFAULT_CURRICULUM) {
    for (const disc of period.disciplines) {
      await pool.query(
        `INSERT INTO disciplines (name, period_default, is_ead)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [disc.name, period.period, disc.isEad ?? false]
      );
    }
  }
}
