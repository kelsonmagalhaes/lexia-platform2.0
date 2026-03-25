import { pool } from '../../config/database';
import { geminiFlash, LEX_IA_SYSTEM_PROMPT } from '../../config/gemini';
import { extractTextFromPdf, truncateText } from '../../utils/pdf-parser';
import { AppError } from '../../middleware/errorHandler';

export async function uploadAndProcessPdf(userId: string, file: Express.Multer.File, disciplineId?: string) {
  const existing = await pool.query(
    "SELECT COUNT(*) FROM pdf_uploads WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 day'",
    [userId]
  );
  if (Number(existing.rows[0].count) >= 3) throw new AppError(429, 'Limite de 3 PDFs por dia atingido');

  const result = await pool.query(
    "INSERT INTO pdf_uploads (user_id, filename, status, discipline_id) VALUES ($1, $2, 'processing', $3) RETURNING id",
    [userId, file.originalname, disciplineId ?? null]
  );
  const pdfId = result.rows[0].id;

  setImmediate(async () => {
    try {
      const rawText = await extractTextFromPdf(file.buffer);
      const truncated = truncateText(rawText, 12000);
      const [summaryMd, quizResult] = await Promise.all([
        generateSummary(truncated, file.originalname),
        generatePdfQuiz(truncated),
      ]);
      await pool.query(
        'INSERT INTO pdf_results (pdf_id, summary_md, quiz) VALUES ($1, $2, $3)',
        [pdfId, summaryMd, JSON.stringify(quizResult)]
      );
      await pool.query("UPDATE pdf_uploads SET status = 'done' WHERE id = $1", [pdfId]);
    } catch (err) {
      await pool.query("UPDATE pdf_uploads SET status = 'error' WHERE id = $1", [pdfId]);
      console.error('PDF processing error:', err);
    }
  });

  return { pdfId, status: 'processing' };
}

async function generateSummary(text: string, filename: string): Promise<string> {
  const prompt = `${LEX_IA_SYSTEM_PROMPT}\n\nResuma o documento jurídico "${filename}":\n\n${text}\n\nFormate em Markdown com: 1.Tema Central 2.Conceitos-Chave 3.Fundamentos Legais 4.Pontos Principais 5.Conclusão`;
  const result = await geminiFlash.generateContent(prompt);
  return result.response.text();
}

async function generatePdfQuiz(text: string) {
  const prompt = `${LEX_IA_SYSTEM_PROMPT}\n\nBaseado no documento, gere 5 questões de múltipla escolha:\n\n${text}\n\nRetorne APENAS JSON sem markdown:\n{"questions":[{"content":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"correctAnswer":"A","explanation":"..."}]}`;
  const result = await geminiFlash.generateContent(prompt);
  const cleaned = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try { return JSON.parse(cleaned); } catch { return { questions: [] }; }
}

export async function getMyPdfs(userId: string) {
  const result = await pool.query(
    'SELECT pu.id, pu.filename, pu.status, pu.created_at, d.name as discipline_name FROM pdf_uploads pu LEFT JOIN disciplines d ON d.id = pu.discipline_id WHERE pu.user_id = $1 ORDER BY pu.created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function getPdfSummary(userId: string, pdfId: string) {
  const result = await pool.query(
    'SELECT pr.summary_md, pu.filename, pu.status FROM pdf_uploads pu LEFT JOIN pdf_results pr ON pr.pdf_id = pu.id WHERE pu.id = $1 AND pu.user_id = $2',
    [pdfId, userId]
  );
  if (result.rows.length === 0) throw new AppError(404, 'PDF não encontrado');
  return result.rows[0];
}

export async function getPdfQuiz(userId: string, pdfId: string) {
  const result = await pool.query(
    'SELECT pr.quiz, pu.filename, pu.status FROM pdf_uploads pu LEFT JOIN pdf_results pr ON pr.pdf_id = pu.id WHERE pu.id = $1 AND pu.user_id = $2',
    [pdfId, userId]
  );
  if (result.rows.length === 0) throw new AppError(404, 'PDF não encontrado');
  return result.rows[0];
}