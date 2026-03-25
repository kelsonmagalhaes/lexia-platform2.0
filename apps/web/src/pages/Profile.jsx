import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { CURRICULUM } from '@/lib/curriculum';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, profile, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(profile?.institution || '');
  const [period, setPeriod] = useState(String(profile?.current_period || 1));
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateProfile({ institution, current_period: parseInt(period) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Nome</label>
          <div className="h-10 bg-secondary border border-border rounded-lg px-3 flex items-center text-sm text-muted-foreground">{user?.name}</div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Instituição de Ensino</label>
          <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Ex: Universidade Federal de MG" className="w-full h-10 bg-secondary border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Período Atual</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CURRICULUM.map(c => <SelectItem key={c.period} value={String(c.period)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={save} className="w-full">
          <Save className="w-4 h-4 mr-2" />{saved ? 'Salvo!' : 'Salvar Alterações'}
        </Button>
      </div>

      <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 rounded-xl bg-card border border-border text-destructive hover:bg-destructive/5 transition-colors">
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Sair da conta</span>
      </button>
    </div>
  );
}
