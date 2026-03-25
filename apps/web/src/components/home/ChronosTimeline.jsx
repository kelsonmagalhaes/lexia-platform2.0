import { CURRICULUM } from '@/lib/curriculum';
import { CheckCircle2, Circle, BookOpen } from 'lucide-react';

export default function ChronosTimeline({ currentPeriod = 1 }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Sua Jornada</h2>
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        {CURRICULUM.map(({ period, name, subjects }) => {
          const isDone = period < currentPeriod;
          const isCurrent = period === currentPeriod;
          return (
            <div key={period} className={`flex gap-3 items-start ${!isDone && !isCurrent ? 'opacity-40' : ''}`}>
              <div className="flex flex-col items-center mt-0.5">
                {isDone ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" /> : isCurrent ? <BookOpen className="w-5 h-5 text-primary shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
                {period < 10 && <div className="w-px h-4 bg-border mt-1" />}
              </div>
              <div className="pb-2">
                <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{subjects.length} disciplinas</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
