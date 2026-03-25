import { useAuth } from '@/lib/AuthContext';
import { getLevelTitle, getLevelFromXP, getXPForLevel } from '@/lib/curriculum';
import { BarChart2, Trophy, Target, TrendingUp } from 'lucide-react';

export default function Performance() {
  const { profile } = useAuth();
  const xp = profile?.xp || 0;
  const level = getLevelFromXP(xp);
  const title = getLevelTitle(level);
  const nextXP = getXPForLevel(level);
  const progress = (xp % 100);

  const stats = [
    { label: 'XP Total', value: xp, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Nível Atual', value: level, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Período', value: `${profile?.current_period || 1}º`, icon: Target, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Desempenho</h1>
          <p className="text-sm text-muted-foreground">Acompanhe sua evolução</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <div className="text-4xl font-bold text-primary mb-1">{title}</div>
        <p className="text-muted-foreground text-sm">Seu título atual</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{xp} XP</span><span>{nextXP} XP</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{100 - progress} XP para o próximo nível</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold text-foreground mb-4">Níveis e Títulos</h2>
        <div className="space-y-2">
          {[['Estudante','1-5'],['Acadêmico','6-10'],['Jurista','11-20'],['Mestre','21-30'],['Doutor','31-50'],['Catedrático','51+']].map(([t, r]) => (
            <div key={t} className={`flex justify-between items-center px-4 py-2.5 rounded-lg ${t === title ? 'bg-primary/10 border border-primary/30' : 'bg-secondary'}`}>
              <span className={`text-sm font-medium ${t === title ? 'text-primary' : 'text-foreground'}`}>{t}</span>
              <span className="text-xs text-muted-foreground">Nível {r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
