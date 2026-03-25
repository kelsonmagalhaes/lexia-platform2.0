import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Voltar</Link>
      <h1 className="text-2xl font-bold text-foreground">Termos de Uso</h1>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">1. Aceitação:</strong> Ao usar o LexStudy você concorda com estes termos. O uso é permitido para maiores de 16 anos.</p>
        <p><strong className="text-foreground">2. Finalidade:</strong> O LexStudy é uma plataforma educacional para estudantes de Direito. O conteúdo gerado pela IA é para fins de estudo e não constitui consultoria ou assessoria jurídica profissional.</p>
        <p><strong className="text-foreground">3. Uso adequado:</strong> É proibido usar o aplicativo para fins ilegais, difamatórios ou que violem direitos de terceiros.</p>
        <p><strong className="text-foreground">4. Propriedade intelectual:</strong> O conteúdo, design e funcionalidades do LexStudy são protegidos por direitos autorais.</p>
        <p><strong className="text-foreground">5. Limitação de responsabilidade:</strong> O LexStudy não se responsabiliza por decisões tomadas com base no conteúdo gerado pela IA. Consulte sempre um advogado para questões legais específicas.</p>
        <p><strong className="text-foreground">6. Alterações:</strong> Reservamos o direito de modificar estes termos. Usuários serão notificados de mudanças significativas.</p>
      </div>
    </div>
  );
}
