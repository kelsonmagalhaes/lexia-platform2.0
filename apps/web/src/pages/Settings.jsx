import { useAuth } from '@/lib/AuthContext';
import { Settings as SettingsIcon, Shield, FileText, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        <Link to="/privacy" className="flex items-center gap-4 p-4 hover:bg-secondary transition-colors">
          <Shield className="w-5 h-5 text-primary" />
          <div><p className="text-sm font-medium text-foreground">Política de Privacidade</p><p className="text-xs text-muted-foreground">Como seus dados são tratados</p></div>
        </Link>
        <Link to="/terms" className="flex items-center gap-4 p-4 hover:bg-secondary transition-colors">
          <FileText className="w-5 h-5 text-primary" />
          <div><p className="text-sm font-medium text-foreground">Termos de Uso</p><p className="text-xs text-muted-foreground">Regras e condições de uso</p></div>
        </Link>
        <div className="flex items-center gap-4 p-4">
          <Info className="w-5 h-5 text-muted-foreground" />
          <div><p className="text-sm font-medium text-foreground">Versão</p><p className="text-xs text-muted-foreground">LexStudy v1.0.0</p></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Conta</h2>
        <p className="text-sm text-muted-foreground mb-1">{user?.name}</p>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>
    </div>
  );
}
