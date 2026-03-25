import { Link } from 'react-router-dom';
import { Brain, GraduationCap, Scale, FileText, BookOpen, BarChart2 } from 'lucide-react';

const actions = [
  { to: '/lexia', icon: Brain, label: 'Lex IA', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { to: '/quiz', icon: GraduationCap, label: 'Quiz', color: 'text-green-400', bg: 'bg-green-400/10' },
  { to: '/vademecum', icon: Scale, label: 'Vade Mecum', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { to: '/pdf-tools', icon: FileText, label: 'PDF', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { to: '/subjects', icon: BookOpen, label: 'Currículo', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { to: '/performance', icon: BarChart2, label: 'Desempenho', color: 'text-pink-400', bg: 'bg-pink-400/10' },
];

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Acesso Rápido</h2>
      <div className="grid grid-cols-3 gap-3">
        {actions.map(({ to, icon: Icon, label, color, bg }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <span className="text-xs font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
