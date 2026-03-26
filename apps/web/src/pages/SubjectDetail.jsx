import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Brain, GraduationCap, Loader2, Sparkles, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeLLM } from '@/lib/gemini';
import { getSubjectContent } from '@/lib/contentDB';
import ReactMarkdown from 'react-markdown';

export default function SubjectDetail() {
  const [searchParams] = useSearchParams();
  const subject = searchParams.get('subject') || '';
  const period = searchParams.get('period') || '1';
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAI, setIsAI] = useState(false);
  const [contentCache, setContentCache] = useState({});

  useEffect(() => {
    if (subject) loadContent('overview');
  }, [subject]);

  const loadContent = async (type) => {
    setActiveTab(type);

    // Serve from cache if available
    if (contentCache[type]) {
      setContent(contentCache[type].text);
      setIsAI(contentCache[type].isAI);
      setLoading(false);
      return;
    }

    setIsAI(false);

    const staticContent = getSubjectContent(subject, type);
    if (staticContent) {
      setContent(staticContent);
      setLoading(false);
      setContentCache(prev => ({ ...prev, [type]: { text: staticContent, isAI: false } }));
      return;
    }

    setContent(null);
    setLoading(true);
    try {
      const prompts = {
        overview: `Gere uma visão geral completa e didática sobre "${subject}" do curso de Direito (${period}º período). Inclua: ementa, objetivos, temas principais, importância para a formação jurídica. Use markdown com títulos e listas.`,
        topics: `Liste os principais tópicos e subtópicos de "${subject}" (${period}º período). Para cada tópico, dê uma breve descrição. Use markdown com ## para grupos e - para itens.`,
        summary: `Crie um resumo completo para estudo de "${subject}" (${period}º período). Inclua conceitos-chave, definições e pontos que costumam cair em provas e OAB. Use markdown.`,
      };
      const result = await invokeLLM(prompts[type] || prompts.overview);
      // Error responses from invokeLLM start with '_' (markdown italic wrapper)
      if (result && !result.startsWith('_')) {
        setContent(result);
        setIsAI(true);
        setContentCache(prev => ({ ...prev, [type]: { text: result, isAI: true } }));
      } else {
        setContent(null);
      }
    } catch (_) {
      setContent(null);
    }
    setLoading(false);
  };

  const tabs = [
    ['overview', 'Visão Geral', BookOpen],
    ['topics', 'Tópicos', Brain],
    ['summary', 'Resumo', GraduationCap],
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/subjects?period=${period}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{subject}</h1>
          <p className="text-xs text-muted-foreground">{period}º Período</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tabs.map(([type, label, Icon]) => (
          <Button
            key={type}
            variant={activeTab === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => loadContent(type)}
            className="text-xs"
          >
            <Icon className="w-3.5 h-3.5 mr-1.5" />{label}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Gerando conteúdo com IA...</p>
          </div>
        </div>
      )}

      {!loading && content && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            {isAI ? (
              <><Sparkles className="w-3.5 h-3.5 text-primary" /><span className="text-xs text-primary font-medium">Gerado por IA</span></>
            ) : (
              <><Database className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Banco de conteúdo</span></>
            )}
          </div>
          <div className="legal-prose"><ReactMarkdown>{content}</ReactMarkdown></div>
        </div>
      )}

      {!loading && !content && (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Não foi possível carregar o conteúdo via IA.</p>
          <Button variant="outline" size="sm" onClick={() => loadContent(activeTab)}>
            Tentar novamente
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Link to={`/quiz?subject=${encodeURIComponent(subject)}&period=${period}`} className="flex-1">
          <Button variant="outline" className="w-full text-sm"><GraduationCap className="w-4 h-4 mr-2" />Fazer Quiz</Button>
        </Link>
        <Link to={`/lexia?subject=${encodeURIComponent(subject)}`} className="flex-1">
          <Button className="w-full text-sm"><Brain className="w-4 h-4 mr-2" />Perguntar à Lex IA</Button>
        </Link>
      </div>
    </div>
  );
}
