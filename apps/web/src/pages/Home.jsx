import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Brain, GraduationCap, Scale, FileText, BookOpen, BarChart2, Trophy, ChevronRight } from 'lucide-react';
import { getLevelTitle, getLevelFromXP, CURRICULUM } from '@/lib/curriculum';

const quickActions = [
  { to: '/lexia', icon: Brain, label: 'Lex IA', desc: 'Pergunte à IA jurídica', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'hover:border-blue-400/40' },
  { to: '/quiz', icon: GraduationCap, label: 'Quiz', desc: 'Questões e simulados', color: 'text-green-400', bg: 'bg-green-400/10', border: 'hover:border-green-400/40' },
  { to: '/vademecum', icon: Scale, label: 'Vade Mecum', desc: 'Consulte as leis', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'hover:border-yellow-400/40' },
  { to: '/pdf-tools', icon: FileText, label: 'PDF', desc: 'Resumo e quiz de PDF', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'hover:border-purple-400/40' },
  { to: '/subjects', icon: BookOpen, label: 'Currículo', desc: '10 períodos de Direito', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'hover:border-orange-400/40' },
  { to: '/performance', icon: BarChart2, label: 'Desempenho', desc: 'Sua evolução e XP', color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'hover:border-pink-400/40' },
];

export default function Home() {
  const { user, profile } = useAuth();
  const xp = profile?.xp || 0;
  const level = getLevelFromXP(xp);
  const title = getLevelTitle(level);
  const xpProgress = xp % 100;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      {/* Welcome card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">{user?.name?.split(' ')[0] || 'Estudante'}</h1>
            <p className="text-sm text-primary mt-1 font-medium">{title} · Nível {level}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{xp} XP</span><span>Próximo nível: {level * 100} XP</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Período atual: <span className="text-foreground font-medium">{profile?.current_period || 1}º Período</span></p>
          <Link to="/subjects" className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver currículo <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Acesso Rápido</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ to, icon: Icon, label, desc, color, bg, border }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 p-4 rounded-xl bg-card border border-border ${border} transition-all duration-200 hover:shadow-md active:scale-95`}
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Current Period shortcut */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Disciplinas do seu período</h2>
        <PeriodSubjects period={profile?.current_period || 1} />
      </div>
    </div>
  );
}

function PeriodSubjects({ period }) {
  const cur = CURRICULUM.find(c => c.period === period);
  if (!cur) return null;
  return (
    <div className="space-y-2">
      {cur.subjects.slice(0, 4).map(subject => (
        <Link
          key={subject}
          to={`/subject-detail?period=${period}&subject=${encodeURIComponent(subject)}`}
          className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-foreground flex-1 truncate">{subject}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
      ))}
      <Link
        to={`/subjects?period=${period}`}
        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all text-sm"
      >
        Ver todas as disciplinas <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
