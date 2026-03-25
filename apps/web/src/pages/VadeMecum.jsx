import { useState } from 'react';
import { VADE_MECUM_LAWS } from '@/lib/curriculum';
import { invokeLLM } from '@/lib/gemini';
import { searchVadeMecum, formatArticleResult } from '@/lib/vadeMecumDB';
import { Scale, Search, Loader2, BookMarked, ChevronRight, Database, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

const LAW_INTROS = {
  cf: `## Constituição Federal de 1988\n\nA Constituição Federal é a lei suprema do Brasil, promulgada em 5 de outubro de 1988.\n\n**Principais temas disponíveis:**\n- Art. 1º — Fundamentos da República (SCDVP)\n- Art. 3º — Objetivos fundamentais\n- Art. 5º — Direitos e garantias fundamentais, remédios constitucionais\n- Art. 7º — Direitos dos trabalhadores\n- Art. 37 — Administração pública (LIMPE)\n- Art. 60 — Emenda constitucional e cláusulas pétreas\n- Art. 225 — Meio ambiente\n\n**Digite o tema ou número do artigo para buscar.**`,
  cc: `## Código Civil — Lei 10.406/2002\n\nO Código Civil regula as relações entre particulares.\n\n**Principais temas disponíveis:**\n- Personalidade e capacidade civil (arts. 2º, 3º, 4º)\n- Desconsideração da personalidade jurídica (art. 50)\n- Ato ilícito e responsabilidade civil (arts. 186, 927)\n- Prescrição e prazos (art. 206)\n- Propriedade (art. 1.228)\n- Família: regime de bens (art. 1.640), união estável (art. 1.723)\n\n**Digite o tema ou número do artigo para buscar.**`,
  cp: `## Código Penal — Decreto-Lei 2.848/1940\n\n**Principais temas disponíveis:**\n- Art. 1º — Princípio da legalidade\n- Art. 23 — Excludentes de ilicitude\n- Art. 25 — Legítima defesa\n- Art. 121 — Homicídio\n- Art. 155 — Furto\n- Art. 157 — Roubo e latrocínio\n- Art. 171 — Estelionato\n- Arts. 312-317 — Crimes contra a Administração Pública\n\n**Digite o crime ou artigo para buscar.**`,
  cpc: `## Código de Processo Civil — Lei 13.105/2015\n\n**Principais temas disponíveis:**\n- Arts. 1º-12 — Normas fundamentais\n- Art. 17 — Condições da ação\n- Art. 47 — Competência em ações imobiliárias\n- Art. 319 — Petição inicial\n- Arts. 485/487 — Sentença\n\n**Digite o tema ou artigo para buscar.**`,
  clt: `## CLT — Consolidação das Leis do Trabalho\n\n**Principais temas disponíveis:**\n- Arts. 2º-3º — Empregador e empregado\n- Art. 58 — Jornada de trabalho\n- Art. 129/130 — Férias\n- Art. 482 — Justa causa\n\n**Digite o tema ou artigo para buscar.**`,
  cdc: `## Código de Defesa do Consumidor — Lei 8.078/1990\n\n**Principais temas disponíveis:**\n- Arts. 2º-3º — Consumidor e fornecedor\n- Art. 6º — Direitos básicos, inversão do ônus da prova\n- Arts. 12-14 — Responsabilidade pelo fato do produto\n- Art. 26 — Prazos para reclamar (30/90 dias)\n- Art. 39 — Práticas abusivas\n\n**Digite o tema para buscar.**`,
};

export default function VadeMecum() {
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [intro, setIntro] = useState(null);
  const [source, setSource] = useState('static');

  const selectLaw = (lawId) => {
    setSelectedLaw(lawId);
    setResult(null);
    setQuery('');
    setSource('static');
    setIntro(LAW_INTROS[lawId] || null);
  };

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setIntro(null);
    setSource('static');

    const staticResults = searchVadeMecum(query.trim(), selectedLaw);
    if (staticResults.length > 0) {
      const formatted = formatArticleResult(staticResults);
      setResult(formatted);
      setSource('static');
      setLoading(false);
      tryAIEnhance(query);
      return;
    }

    await tryAIEnhance(query);
  };

  const tryAIEnhance = async (q) => {
    setLoading(true);
    try {
      const lawName = selectedLaw
        ? VADE_MECUM_LAWS.find(l => l.id === selectedLaw)?.name
        : 'legislação brasileira';
      const prompt = `Você é assistente jurídico. O usuário busca na ${lawName}: "${q}". Apresente os artigos relevantes com redação e explicação didática em português. Use markdown, cite número dos artigos.`;
      const r = await invokeLLM(prompt);
      if (r && !r.startsWith('_Erro') && !r.startsWith('_A IA')) {
        setResult(r);
        setSource('ai');
      } else if (!result) {
        setResult(`Nenhum resultado encontrado para "${q}" na legislação selecionada. Tente outro termo ou selecione outra lei.`);
      }
    } catch (_) {
      if (!result) setResult(`Nenhum resultado encontrado para "${q}". Tente outro termo.`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vade Mecum Digital</h1>
          <p className="text-sm text-muted-foreground">Consulte a legislação brasileira</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button onClick={() => { setSelectedLaw(null); setIntro(null); setResult(null); }}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedLaw ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
          Todos
        </button>
        {VADE_MECUM_LAWS.map(law => (
          <button key={law.id} onClick={() => selectLaw(law.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedLaw === law.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            {law.abbr}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder={selectedLaw ? `Buscar em ${VADE_MECUM_LAWS.find(l=>l.id===selectedLaw)?.abbr}...` : 'Ex: Art. 5º, habeas corpus, prescrição...'}
          className="flex-1 h-10 bg-secondary border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        <Button size="icon" onClick={search} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {intro && !result && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="legal-prose"><ReactMarkdown>{intro}</ReactMarkdown></div>
        </div>
      )}

      {loading && !result && <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}

      {result && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            {source === 'ai' ? (
              <><Sparkles className="w-3.5 h-3.5 text-primary" /><span className="text-xs text-primary font-medium">Resposta da Lex IA</span></>
            ) : (
              <><Database className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Banco de legislação</span>
              {loading && <span className="text-xs text-blue-400 ml-1">· buscando mais com IA...</span>}</>
            )}
          </div>
          <div className="legal-prose"><ReactMarkdown>{result}</ReactMarkdown></div>
          <button onClick={() => { setResult(null); setQuery(''); }} className="mt-4 text-xs text-muted-foreground hover:text-foreground">← Nova busca</button>
        </div>
      )}

      {!selectedLaw && !result && !intro && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {VADE_MECUM_LAWS.map(law => (
            <button key={law.id} onClick={() => selectLaw(law.id)}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all text-left active:scale-95">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <BookMarked className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{law.abbr}</p>
                <p className="text-xs text-muted-foreground">{law.name}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
