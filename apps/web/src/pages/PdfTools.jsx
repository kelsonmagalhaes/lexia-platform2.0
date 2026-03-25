import { useState, useRef } from 'react';
import { FileText, Loader2, GraduationCap, BookOpen, Upload, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeLLM, invokeLLMJSON } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';

async function extractTextFromPDF(file) {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (e) {
    console.error('PDF extraction error:', e);
    throw new Error('Não foi possível ler o PDF. Tente copiar e colar o texto manualmente.');
  }
}

export default function PdfTools() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [summary, setSummary] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSummary(null);
    setQuiz(null);

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setText(ev.target.result);
        setFileName(file.name);
      };
      reader.readAsText(file);
      return;
    }

    if (file.type === 'application/pdf') {
      setExtracting(true);
      try {
        const extracted = await extractTextFromPDF(file);
        if (!extracted || extracted.length < 50) {
          setError('O PDF não contém texto extraível (pode ser uma imagem). Cole o texto manualmente na caixa abaixo.');
          setExtracting(false);
          return;
        }
        setText(extracted);
        setFileName(file.name);
      } catch (err) {
        setError(err.message);
      }
      setExtracting(false);
      return;
    }

    setError('Formato não suportado. Use PDF (.pdf) ou texto (.txt).');
  };

  const clearFile = () => {
    setText('');
    setFileName('');
    setSummary(null);
    setQuiz(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateSummary = async () => {
    if (!text.trim()) return;
    setSummary(null);
    setQuiz(null);
    setLoading('summary');
    const prompt = `Você é um assistente de estudos jurídicos. Analise o seguinte texto e crie um resumo completo e didático, destacando: conceitos-chave, definições importantes, pontos que costumam cair em provas e OAB, e uma conclusão. Use markdown com títulos e listas.\n\nTexto:\n${text.substring(0, 8000)}`;
    const r = await invokeLLM(prompt);
    setSummary(r);
    setLoading(null);
  };

  const generateQuiz = async () => {
    if (!text.trim()) return;
    setSummary(null);
    setQuiz(null);
    setLoading('quiz');
    const prompt = `Crie 5 questões de múltipla escolha baseadas no seguinte texto jurídico. Questões de nível OAB/universitário. Retorne JSON com array "questions", cada item com: question (string), options (objeto com A, B, C, D como strings), correct_answer (string: "A", "B", "C" ou "D"), explanation (string com justificativa).\n\nTexto:\n${text.substring(0, 6000)}`;
    const r = await invokeLLMJSON(prompt, { questions: [] });
    if (r?.questions?.length > 0) {
      setQuiz(r.questions);
    } else {
      setError('Não foi possível gerar questões. Verifique o texto e tente novamente.');
    }
    setLoading(null);
  };

  const hasContent = text.trim().length > 50;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ferramentas PDF</h1>
          <p className="text-sm text-muted-foreground">Envie um PDF ou cole o texto e gere resumo ou quiz com IA</p>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {!fileName && !extracting && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 flex flex-col items-center gap-3 transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Clique para selecionar PDF</p>
              <p className="text-xs text-muted-foreground mt-1">Suporta .pdf e .txt — até 30 páginas</p>
            </div>
          </button>
        )}

        {extracting && (
          <div className="w-full border-2 border-primary/30 rounded-xl p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Lendo PDF...</p>
          </div>
        )}

        {fileName && !extracting && (
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">{text.length.toLocaleString()} caracteres extraídos</p>
            </div>
            <button onClick={clearFile} className="shrink-0 p-1.5 hover:bg-border rounded-lg transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Manual text area */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Ou cole o texto manualmente:</label>
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setFileName(''); setSummary(null); setQuiz(null); }}
            placeholder="Cole aqui o conteúdo do PDF, apostila ou material de estudo..."
            rows={6}
            className="w-full bg-secondary border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={generateSummary}
            disabled={!hasContent || !!loading || extracting}
            variant="outline"
            className="flex-1"
          >
            {loading === 'summary'
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resumindo...</>
              : <><BookOpen className="w-4 h-4 mr-2" />Gerar Resumo</>}
          </Button>
          <Button
            onClick={generateQuiz}
            disabled={!hasContent || !!loading || extracting}
            className="flex-1"
          >
            {loading === 'quiz'
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando Quiz...</>
              : <><GraduationCap className="w-4 h-4 mr-2" />Gerar Quiz</>}
          </Button>
        </div>

        {!hasContent && (
          <p className="text-xs text-center text-muted-foreground">
            Envie um arquivo ou cole pelo menos 50 caracteres para habilitar os botões.
          </p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />Resumo Inteligente
            </h2>
            <button onClick={() => setSummary(null)} className="text-xs text-muted-foreground hover:text-foreground">Fechar</button>
          </div>
          <div className="legal-prose"><ReactMarkdown>{summary}</ReactMarkdown></div>
        </div>
      )}

      {/* Quiz */}
      {quiz && quiz.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />Quiz do Material
            </h2>
            <button onClick={() => setQuiz(null)} className="text-xs text-muted-foreground hover:text-foreground">Fechar</button>
          </div>
          {quiz.map((q, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <p className="text-sm font-medium text-foreground">{i + 1}. {q.question}</p>
              <div className="space-y-1.5">
                {Object.entries(q.options || {}).map(([k, v]) => (
                  <p key={k} className={`text-sm px-3 py-2 rounded-lg ${k === q.correct_answer ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'text-muted-foreground bg-secondary'}`}>
                    <strong>{k})</strong> {v}
                  </p>
                ))}
              </div>
              {q.explanation && (
                <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                  {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
