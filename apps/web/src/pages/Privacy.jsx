import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Voltar</Link>
      <h1 className="text-2xl font-bold text-foreground">Política de Privacidade</h1>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">1. Dados coletados:</strong> Nome e e-mail fornecidos no cadastro, dados de uso e progresso de estudo armazenados localmente em seu dispositivo.</p>
        <p><strong className="text-foreground">2. Uso dos dados:</strong> Seus dados são utilizados exclusivamente para personalizar sua experiência de estudo. Não vendemos ou compartilhamos dados pessoais com terceiros.</p>
        <p><strong className="text-foreground">3. Armazenamento:</strong> Os dados são armazenados localmente no seu navegador (localStorage). Você pode apagá-los a qualquer momento nas configurações do navegador.</p>
        <p><strong className="text-foreground">4. IA e Gemini:</strong> As perguntas feitas à Lex IA são processadas pela API do Google Gemini. Não armazenamos o histórico de conversas em servidores próprios.</p>
        <p><strong className="text-foreground">5. LGPD:</strong> Em conformidade com a Lei 13.709/2018. Para exercer seus direitos (acesso, correção, exclusão), entre em contato: contato@lexstudy.com.br</p>
        <p><strong className="text-foreground">6. Cookies:</strong> Utilizamos apenas cookies essenciais para funcionamento do aplicativo.</p>
      </div>
    </div>
  );
}
