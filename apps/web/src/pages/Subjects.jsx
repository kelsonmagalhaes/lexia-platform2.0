import { useState } from 'react';
import { CURRICULUM } from '@/lib/curriculum';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Subjects() {
  const [searchParams] = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState(parseInt(searchParams.get('period')) || 1);
  const currentCurriculum = CURRICULUM.find(c => c.period === selectedPeriod);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Currículo</h1>
        <p className="text-sm text-muted-foreground mt-1">Selecione o período e explore as disciplinas</p>
      </div>
      <div className="overflow-x-auto -mx-4 px-4">
        <Tabs value={String(selectedPeriod)} onValueChange={v => setSelectedPeriod(parseInt(v))}>
          <TabsList className="bg-secondary inline-flex w-auto">
            {CURRICULUM.map(c => <TabsTrigger key={c.period} value={String(c.period)} className="text-xs px-3">{c.period}º</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={selectedPeriod} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{currentCurriculum?.name}</h2>
          {currentCurriculum?.subjects.map(subject => (
            <Link key={subject} to={`/subject-detail?period=${selectedPeriod}&subject=${encodeURIComponent(subject)}`} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">{subject}</h3>
                <p className="text-xs text-muted-foreground">{selectedPeriod}º Período</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
