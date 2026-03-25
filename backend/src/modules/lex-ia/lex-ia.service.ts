import { geminiFlash, geminiPro, LEX_IA_SYSTEM_PROMPT } from '../../config/gemini';
import { redis } from '../../config/redis';
import { AppError } from '../../middleware/errorHandler';

const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 20;

async function checkRateLimit(userId: string): Promise<void> {
  const key = `lex-ia:ratelimit:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW);
  if (count > RATE_LIMIT_MAX) {
    throw new AppError(429, 'Limite de uso da LEX IA atingido. Aguarde 1 minuto.');
  }
}

export async function chat(userId: string, message: string, history?: Array<{ role: string; parts: string }>) {
  await checkRateLimit(userId);
  const chatSession = geminiFlash.startChat({
    history: [
      { role: 'user', parts: [{ text: LEX_IA_SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Entendido. Estou pronto para auxiliar estudantes de Direito com precisão e rigor jurídico.' }] },
      ...(history ?? []).map((h) => ({ role: h.role, parts: [{ text: h.parts }] })),
    ],
  });
  const result = await chatSession.sendMessage(message);
  return result.response.text();
}

export async function explainContent(userId: string, content: string, disciplineName?: string) {
  await checkRateLimit(userId);
  const prompt = `${LEX_IA_SYSTEM_PROMPT}\n\nDisciplina: ${disciplineName ?? 'Direito'}\n\nExplique o seguinte conteúdo de forma didática:\n\n${content}\n\nEstruture com: 1. Conceito, 2. Fundamento legal, 3. Aplicação prática, 4. Exemplo`;
  const result = await geminiFlash.generateContent(prompt);
  return result.response.text();
}

export async function generateQuiz(userId: string, params: { topic: string; disciplineName?: string; count?: number; difficulty?: string }) {
  await checkRateLimit(userId);
  const count = params.count ?? 5;
  const prompt = `${LEX_IA_SYSTEM_PROMPT}\n\nGere ${count} questões de múltipla escolha sobre: "${params.topic}"\nDisciplina: ${params.disciplineName ?? 'Direito'}\nDificuldade: ${params.difficulty ?? 'medium'}\n\nRetorne APENAS JSON válido sem markdown:\n{"questions":[{"content":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"correctAnswer":"A","explanation":"..."}]}`;
  const result = await geminiFlash.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try { return JSON.parse(text); } catch { throw new AppError(500, 'Erro ao processar resposta da LEX IA'); }
}

export async function correctEssay(userId: string, params: { question: string; answer: string; disciplineName?: string }) {
  await checkRateLimit(userId);
  const prompt = `${LEX_IA_SYSTEM_PROMPT}\n\nQuestão: ${params.question}\n\nResposta do aluno: ${params.answer}\n\nAvalie e retorne APENAS JSON sem markdown:\n{"score":7.5,"maxScore":10,"feedback":"...","strengths":["..."],"improvements":["..."],"suggestedAnswer":"..."}`;
  const result = await geminiPro.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try { return JSON.parse(text); } catch { throw new AppError(500, 'Erro ao processar correção da LEX IA'); }
}

export async function simulateExam(userId: string, params: { disciplineName: string; examType: 'oab' | 'concurso' | 'regular'; count?: number }) {
  await checkRateLimit(userId);
  const count = params.count ?? 10;
  const examContext = { oab: 'Exame da OAB', concurso: 'Concurso público jurídico', regular: 'Prova acadêmica' }[params.examType];
  const prompt = `${LEX_IA_SYSTEM_PROMPT}\n\nGere simulado: ${examContext}\nDisciplina: ${params.disciplineName}\nQuestões: ${count}\n\nRetorne APENAS JSON sem markdown:\n{"title":"...","description":"...","timeMinutes":60,"questions":[{"content":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"correctAnswer":"A","explanation":"..."}]}`;
  const result = await geminiPro.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try { return JSON.parse(text); } catch { throw new AppError(500, 'Erro ao gerar simulado'); }
}