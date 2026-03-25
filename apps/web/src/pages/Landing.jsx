import { useState } from 'react';
import { Scale, Brain, BookOpen, GraduationCap, Trophy, Shield, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleStart = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    login(email, name);
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
          {!showLogin ? (
            <Button size="lg" className="text-base px-8" onClick={() => setShowLogin(true)}>
              Começar Gratuitamente <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <form onSubmit={handleStart} className="max-w-sm mx-auto bg-card border border-border rounded-2xl p-6 space-y-4 text-left">
              <h2 className="text-lg font-bold text-foreground text-center">Criar sua conta</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Seu nome</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" required className="w-full h-10 bg-secondary border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Seu e-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full h-10 bg-secondary border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <Button type="submit" className="w-full">Entrar no LexStudy</Button>
              <p className="text-xs text-muted-foreground text-center">Ao entrar, você concorda com nossos <a href="/terms" className="text-primary hover:underline">Termos</a> e <a href="/privacy" className="text-primary hover:underline">Privacidade</a>.</p>
            </form>
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
        <Button size="lg" className="text-base px-10" onClick={() => setShowLogin(true)}>
          Criar minha conta grátis <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">© 2025 LexStudy. Todos os direitos reservados. <a href="/privacy" className="hover:text-primary">Privacidade</a> · <a href="/terms" className="hover:text-primary">Termos</a></p>
      </footer>
    </div>
  );
}
