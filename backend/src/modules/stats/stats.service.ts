import { pool } from '../../config/database';
import PDFDocument from 'pdfkit';

export async function getMyStats(userId: string) {
  const [user, progress, quizStats, studyTime, topDisciplines] = await Promise.all([
    pool.query('SELECT name, xp, level, streak_days, current_period FROM users WHERE id = $1', [userId]),
    pool.query("SELECT COUNT(*) FILTER (WHERE status = 'completed') as completed_lessons, ROUND(AVG(score) FILTER (WHERE score IS NOT NULL), 2) as avg_score FROM user_progress WHERE user_id = $1", [userId]),
    pool.query('SELECT COUNT(*) as total_quizzes, ROUND(AVG(score), 2) as avg_quiz_score, SUM(correct_answers) as total_correct, SUM(total_questions) as total_answered FROM quiz_attempts WHERE user_id = $1 AND completed = TRUE', [userId]),
    pool.query('SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60), 0) as total_minutes FROM study_sessions WHERE user_id = $1 AND ended_at IS NOT NULL', [userId]),
    pool.query("SELECT d.name as discipline, COUNT(*) as lessons_completed FROM user_progress up JOIN lessons l ON l.id = up.lesson_id JOIN topics t ON t.id = l.topic_id JOIN disciplines d ON d.id = t.discipline_id WHERE up.user_id = $1 AND up.status = 'completed' GROUP BY d.name ORDER BY lessons_completed DESC LIMIT 5", [userId]),
  ]);
  return {
    user: user.rows[0],
    progress: progress.rows[0],
    quiz: quizStats.rows[0],
    studyTimeMinutes: Number(studyTime.rows[0]?.total_minutes ?? 0),
    topDisciplines: topDisciplines.rows,
  };
}

export async function exportStatsPdf(userId: string): Promise<Buffer> {
  const stats = await getMyStats(userId);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);
    doc.fontSize(24).fillColor('#1A2B4A').text('LexStudy - Academia Jurídica', { align: 'center' });
    doc.fontSize(16).fillColor('#C9A84C').text('Relatório de Desempenho', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).fillColor('#333333');
    doc.text(`Aluno: ${stats.user?.name ?? 'N/A'}`);
    doc.text(`Nível: ${stats.user?.level ?? 'N/A'} | XP: ${stats.user?.xp ?? 0}`);
    doc.text(`Período: ${stats.user?.current_period ?? 1}º | Streak: ${stats.user?.streak_days ?? 0} dias`);
    doc.moveDown();
    doc.fontSize(14).fillColor('#1A2B4A').text('Progresso de Aulas');
    doc.fontSize(12).fillColor('#333333');
    doc.text(`Concluídas: ${stats.progress?.completed_lessons ?? 0} | Média: ${stats.progress?.avg_score ?? 0}%`);
    doc.moveDown();
    doc.fontSize(14).fillColor('#1A2B4A').text('Desempenho em Quizzes');
    doc.fontSize(12).fillColor('#333333');
    doc.text(`Total: ${stats.quiz?.total_quizzes ?? 0} | Média: ${stats.quiz?.avg_quiz_score ?? 0}% | Respondidas: ${stats.quiz?.total_answered ?? 0}`);
    doc.moveDown();
    const hours = Math.floor(stats.studyTimeMinutes / 60);
    const mins = Math.round(stats.studyTimeMinutes % 60);
    doc.fontSize(14).fillColor('#1A2B4A').text('Tempo de Estudo');
    doc.fontSize(12).fillColor('#333333').text(`Total: ${hours}h ${mins}min`);
    doc.moveDown();
    if (stats.topDisciplines.length > 0) {
      doc.fontSize(14).fillColor('#1A2B4A').text('Top Disciplinas');
      doc.fontSize(12).fillColor('#333333');
      for (const d of stats.topDisciplines as Array<{ discipline: string; lessons_completed: number }>) {
        doc.text(`• ${d.discipline}: ${d.lessons_completed} aulas`);
      }
    }
    doc.moveDown();
    doc.fontSize(10).fillColor('#888888').text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} — LexStudy Academia Jurídica`, { align: 'center' });
    doc.end();
  });
}