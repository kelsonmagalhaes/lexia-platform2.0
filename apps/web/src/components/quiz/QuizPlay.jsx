import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function QuizPlay({ questions, quizType, _subject, _period, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { updateProfile, profile } = useAuth();

  const q = questions[current];

  const handleSelect = (opt) => {
    if (showResult) return;
    setSelected(opt);
    setShowResult(true);
    const isCorrect = opt === q.correct_answer;
    if (isCorrect) setScore(s => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      const xpGained = score * 10;
      updateProfile({ xp: (profile?.xp || 0) + xpGained });
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="text-5xl font-bold text-primary mb-2">{pct}%</div>
          <p className="text-foreground font-semibold text-lg">{score}/{questions.length} corretas</p>
          <p className="text-muted-foreground mt-1 text-sm">+{score * 10} XP ganhos!</p>
          <div className="flex gap-3 mt-6 justify-center">
            <Button variant="outline" onClick={onBack}><RotateCcw className="w-4 h-4 mr-2" />Novo Quiz</Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizType === 'essay') {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <p className="text-xs text-muted-foreground">Questão {current + 1} de {questions.length}</p>
          <p className="text-foreground font-medium">{q.question}</p>
          <div className="bg-secondary rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Pontos-chave:</p>
            <ul className="space-y-1">{(q.key_points || []).map((p, i) => <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-primary">•</span>{p}</li>)}</ul>
          </div>
          {q.model_answer && <div className="bg-primary/5 border border-primary/20 rounded-xl p-4"><p className="text-xs text-primary mb-1 font-semibold uppercase tracking-wider">Resposta modelo:</p><p className="text-sm text-foreground">{q.model_answer}</p></div>}
          <Button onClick={next} className="w-full">{current + 1 < questions.length ? <><ArrowRight className="w-4 h-4 mr-2" />Próxima</> : 'Finalizar'}</Button>
        </div>
      </div>
    );
  }

  const opts = q.options ? Object.entries(q.options) : [];
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Questão {current + 1}/{questions.length}</p>
          <div className="h-2 bg-secondary rounded-full w-32 overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((current) / questions.length) * 100}%` }} /></div>
        </div>
        <p className="text-foreground font-medium leading-relaxed">{q.question}</p>
        <div className="space-y-2">
          {opts.map(([key, val]) => {
            let cls = "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ";
            if (!showResult) cls += "border-border hover:border-primary/40 hover:bg-secondary";
            else if (key === q.correct_answer) cls += "border-green-500 bg-green-500/10";
            else if (key === selected && key !== q.correct_answer) cls += "border-red-500 bg-red-500/10";
            else cls += "border-border opacity-50";
            return (
              <div key={key} className={cls} onClick={() => handleSelect(key)}>
                <span className="font-bold text-sm text-primary shrink-0 mt-0.5">{key})</span>
                <span className="text-sm text-foreground">{val}</span>
                {showResult && key === q.correct_answer && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 ml-auto mt-0.5" />}
                {showResult && key === selected && key !== q.correct_answer && <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-auto mt-0.5" />}
              </div>
            );
          })}
        </div>
        {showResult && (
          <div className="space-y-3">
            {q.explanation && <div className="bg-secondary rounded-xl p-4"><p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Explicação:</p><p className="text-sm text-foreground">{q.explanation}</p></div>}
            <Button onClick={next} className="w-full">{current + 1 < questions.length ? <><ArrowRight className="w-4 h-4 mr-2" />Próxima</> : 'Ver Resultado'}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
