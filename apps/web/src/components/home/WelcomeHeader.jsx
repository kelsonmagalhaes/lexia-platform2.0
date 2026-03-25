import { getLevelTitle, getLevelFromXP } from '@/lib/curriculum';
import { Trophy } from 'lucide-react';

export default function WelcomeHeader({ user, profile }) {
  const level = getLevelFromXP(profile?.xp || 0);
  const title = getLevelTitle(level);
  const xpProgress = (profile?.xp || 0) % 100;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">{user?.name?.split(' ')[0] || 'Estudante'}</h1>
          <p className="text-sm text-primary mt-1 font-medium">{title} • Nível {level}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>XP: {profile?.xp || 0}</span>
          <span>Próximo nível: {level * 100}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">Período atual: <span className="text-foreground font-medium">{profile?.current_period || 1}º Período</span></p>
      </div>
    </div>
  );
}
