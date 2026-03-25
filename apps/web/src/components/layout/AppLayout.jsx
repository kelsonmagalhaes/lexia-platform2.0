import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, Brain, FileText, BarChart2, User, Settings, Scale, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/subjects', icon: BookOpen, label: 'Currículo' },
  { to: '/quiz', icon: GraduationCap, label: 'Quiz' },
  { to: '/lexia', icon: Brain, label: 'Lex IA' },
  { to: '/vademecum', icon: Scale, label: 'Vade Mecum' },
  { to: '/pdf-tools', icon: FileText, label: 'PDF' },
  { to: '/performance', icon: BarChart2, label: 'Desempenho' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

export default function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border p-4 gap-1">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">LexStudy</span>
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`
          }>
            <Icon className="w-4 h-4" />{label}
          </NavLink>
        ))}
        <div className="mt-auto">
          <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
            <Settings className="w-4 h-4" />Configurações
          </NavLink>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground w-full transition-colors mt-1">
            <LogOut className="w-4 h-4" />Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`
            }>
              <Icon className="w-5 h-5" /><span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
