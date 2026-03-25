import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CURRICULUM } from '@/lib/curriculum';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Loader2, Play, Database, Sparkles } from 'lucide-react';
import QuizPlay from '../components/quiz/QuizPlay';
import { invokeLLMJSON } from '@/lib/gemini';
import { getSubjectQuiz } from '@/lib/contentDB';

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get('period') || '');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [quizType, setQuizType] = useState('multiple_choice');
  const [questionCount, setQuestionCount] = useState('5');
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionsSource, setQuestionsSource] = useState('static');

  const periodSubjects = selectedPeriod
    ? CURRICULUM.find(c => c.period === parseInt(selectedPeriod))?.subjects || []
    : [];

  const generateQuiz = async () => {
    setLoading(true);
    const subject = selectedSubject || 'Direito Geral';
    const count = parseInt(questionCount);

    if (quizType === 'multiple_choice') {
      const staticQuiz = getSubjectQuiz(subject);
      if (staticQuiz && staticQuiz.length > 0) {
        const shuffled = [...staticQuiz].sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, Math.min(count, shuffled.length)));
        setQuestionsSource('static');
        setLoading(false);
        return;
      }
    }

    try {
      const prompt = quizType === 'multiple_choice'
        ? `Crie ${count} questões de múltipla escolha sobre "${subject}" para estudantes de Direito. Nível OAB. Retorne JSON com array "questions", cada item com: question (string), options (objeto com A,B,C,D strings), correct_answer (string "A","B","C" ou "D"), explanation (string).`
        : `Crie ${count} questões discursivas sobre "${subject}" para estudantes de Direito. Nível OAB. Retorne JSON com array "questions", cada item com: question (string), key_points (array strings), model_answer (string).`;
      const schema = { questions: [] };
      const result = await invokeLLMJSON(prompt, schema);
      if (result?.questions?.length > 0) {
        setQuestions(result.questions);
        setQuestionsSource('ai');
      } else {
        alert('Não foi possível gerar questões. Tente novamente ou selecione uma disciplina diferente.');
      }
    } catch (_) {
      alert('Erro ao gerar questões. Verifique sua conexão e tente novamente.');
    }
    setLoading(false);
  };

  if (questions?.length > 0) {
    return <QuizPlay questions={questions} quizType={quizType} subject={selectedSubject} period={selectedPeriod} onBack={() => setQuestions(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />Quiz & Simulados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure e inicie seu quiz</p>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-xl p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Período</label>
          <Select value={selectedPeriod} onValueChange={v => { setSelectedPeriod(v); setSelectedSubject(''); }}>
            <SelectTrigger><SelectValue placeholder="Selecione o período" /></SelectTrigger>
            <SelectContent>{CURRICULUM.map(c => <SelectItem key={c.period} value={String(c.period)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Disciplina</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedPeriod}>
            <SelectTrigger><SelectValue placeholder="Selecione a disciplina" /></SelectTrigger>
            <SelectContent>{periodSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo</label>
            <Select value={quizType} onValueChange={setQuizType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                <SelectItem value="essay">Discursivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Questões</label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedSubject && quizType === 'multiple_choice' && getSubjectQuiz(selectedSubject) && (
          <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
            <Database className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-xs text-muted-foreground">Questões do banco local disponíveis para esta disciplina.</p>
          </div>
        )}

        <Button onClick={generateQuiz} disabled={loading || !selectedSubject} className="w-full">
          {loading
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Carregando questões...</>
            : <><Play className="w-4 h-4 mr-2" />Iniciar Quiz</>}
        </Button>
      </div>
    </div>
  );
}
