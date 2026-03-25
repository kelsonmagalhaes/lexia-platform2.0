import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, Send, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeLLM } from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';

const SYSTEM_PROMPT = `Você é Lex IA, assistente jurídica especializada em Direito brasileiro. Ajude estudantes de Direito com explicações didáticas, resumos, análise de casos e preparação para provas e OAB. Use linguagem clara e cite fundamentos legais quando relevante. Não forneça consultoria jurídica profissional.`;

export default function LexIA() {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Olá! Sou a **Lex IA**, sua assistente jurídica. ${initialSubject ? `Vejo que você quer estudar **${initialSubject}**. Como posso ajudar?` : 'Posso explicar conceitos, criar resumos, gerar questões e muito mais. O que você gostaria de estudar hoje?'}` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);
    const history = messages.map(m => `${m.role === 'user' ? 'Usuário' : 'Lex IA'}: ${m.content}`).join('\n');
    const prompt = `${SYSTEM_PROMPT}\n\nHistórico:\n${history}\n\nUsuário: ${userMsg}\n\nLex IA:`;
    let reply;
    try {
      reply = await invokeLLM(prompt);
    } catch (e) {
      reply = `**Erro:** ${e.message}`;
    }
    setMessages(m => [...m, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen pb-16 md:pb-0">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-sm">Lex IA</h1>
            <p className="text-xs text-muted-foreground">Assistente Jurídica</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMessages([{ role: 'assistant', content: 'Olá! Como posso ajudar com seus estudos jurídicos?' }])}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
              {msg.role === 'assistant' ? <div className="legal-prose prose-sm"><ReactMarkdown>{msg.content}</ReactMarkdown></div> : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Analisando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {['Explique habeas corpus','O que é prescrição?','Direitos fundamentais','Princípios do Direito Penal'].map(s => (
            <button key={s} onClick={() => { setInput(s); }} className="shrink-0 text-xs bg-secondary border border-border rounded-full px-3 py-1.5 text-foreground hover:border-primary/40 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 shrink-0">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Pergunte sobre qualquer tema jurídico..." className="flex-1 h-10 bg-secondary border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <Button size="icon" onClick={send} disabled={loading || !input.trim()}><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}
