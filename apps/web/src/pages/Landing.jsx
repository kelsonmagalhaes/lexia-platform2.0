import { useState } from 'react';
import { Scale, Brain, BookOpen, GraduationCap, Trophy, Shield, ChevronRight, Star, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CURRICULUM } from '@/lib/curriculum';

const INPUT_CLASS = 'w-full h-10 bg-secondary border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary';

function PasswordInput({ value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={INPUT_CLASS + ' pr-10'}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function Landing() {
  const { loginAccount, register } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regPeriod, setRegPeriod] = useState('1');
  const [regInstitution, setRegInstitution] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const result = await loginAccount(loginEmail, loginPassword);
    setLoginLoading(false);
    if (result.error) { setLoginError(result.error); return; }
    navigate('/');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (regPassword !== regConfirm) { setRegError('As senhas não coincidem.'); return; }
    if (regPassword.length < 8) { setRegError('A senha deve ter pelo menos 8 caracteres.'); return; }
    setRegLoading(true);
    const result = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      period: regPeriod,
      institution: regInstitution,
    });
    setRegLoading(false);
    if (result.error) { setRegError(result.error); return; }
    navigate('/');
  };

  const features = [
    { icon: Brain, title: 'Lex IA', desc: 'IA jurídica que explica, resume e cria questões sobre qualquer tema do Direito.' },
    { icon: GraduationCap, title: 'Quiz & Simulados', desc: 'Questões de múltipla escolha e discursivas com gabarito e explicação detalhada.' },
    { icon: Scale, title: 'Vade Mecum Digital', desc: 'CF, CC, CP, CPC, CLT e mais — busca rápida por artigos e dispositivos.' },
    { icon: BookOpen, title: 'Grade Curricular', desc: 'Todo o currículo do 1º ao 10º período organizado por disciplina e tema.' },
    { icon: Trophy, title: 'Gamificação', desc: 'XP, níveis e títulos — do Estudante ao Catedrático — para manter o foco.' },
    { icon: Shield, title: 'Conformidade LGPD', desc: 'Seus dados protegidos com total transparência e controle nas suas mãos.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Star className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-medium">Academia Jurídica com IA</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Estude Direito com<br />
            <span className="text-primary">Inteligência Artificial</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            A plataforma completa para estudantes de Direito — do 1º ao 10º período. Quiz, Vade Mecum digital, IA jurídica e muito mais.
          </p>

          {!showAuth ? (
            <Button size="lg" className="text-base px-8" onClick={() => setShowAuth(true)}>
              Começar Gratuitamente <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="max-w-sm mx-auto bg-card border border-border rounded-2xl p-6 text-left">
              <Tabs defaultValue="login">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="login" className="flex-1 gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />Entrar
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex-1 gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />Cadastrar
                  </TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-3">
                    <h2 className="text-base font-bold text-foreground text-center mb-1">Bem-vindo de volta!</h2>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">E-mail</label>
                      <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="seu@email.com" required className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Senha</label>
                      <PasswordInput value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Sua senha" required />
                    </div>
                    {loginError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{loginError}</p>}
                    <Button type="submit" className="w-full" disabled={loginLoading}>
                      {loginLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Não tem conta? Clique em <strong>Cadastrar</strong> acima.</p>
                  </form>
                </TabsContent>

                {/* REGISTER TAB */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-3">
                    <h2 className="text-base font-bold text-foreground text-center mb-1">Crie sua conta grátis</h2>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Nome completo <span className="text-red-400">*</span></label>
                      <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Ex: João Silva" required className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">E-mail <span className="text-red-400">*</span></label>
                      <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="seu@email.com" required className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Telefone / WhatsApp</label>
                      <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="(11) 99999-9999" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Período atual <span className="text-red-400">*</span></label>
                      <Select value={regPeriod} onValueChange={setRegPeriod}>
                        <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CURRICULUM.map(c => (
                            <SelectItem key={c.period} value={String(c.period)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Instituição de ensino</label>
                      <input value={regInstitution} onChange={e => setRegInstitution(e.target.value)} placeholder="Ex: Universidade Federal de MG" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Senha <span className="text-red-400">*</span></label>
                      <PasswordInput value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Confirmar senha <span className="text-red-400">*</span></label>
                      <PasswordInput value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Repita a senha" required />
                    </div>
                    {regError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{regError}</p>}
                    <Button type="submit" className="w-full" disabled={regLoading}>
                      {regLoading ? 'Cadastrando...' : 'Criar minha conta'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Ao cadastrar, você concorda com nossos <a href="/terms" className="text-primary hover:underline">Termos</a> e <a href="/privacy" className="text-primary hover:underline">Privacidade</a>.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-10">Tudo que você precisa para ser aprovado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Pronto para começar?</h2>
        <p className="text-muted-foreground mb-8">Junte-se a milhares de estudantes de Direito. Totalmente gratuito.</p>
        <Button size="lg" className="text-base px-10" onClick={() => setShowAuth(true)}>
          Criar minha conta grátis <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">© 2025 LexStudy. Todos os direitos reservados. <a href="/privacy" className="hover:text-primary">Privacidade</a> · <a href="/terms" className="hover:text-primary">Termos</a></p>
      </footer>
    </div>
  );
}
