import { CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

// O componente agora espera o array 'history' vindo da API
export function Timeline({ history }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum histórico para exibir.</p>;
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border -translate-x-1/2"></div>
      <div className="space-y-8">
        {history.map((item, index) => (
          <div key={item.id || index} className="relative flex items-start">
            <div className="h-12 flex items-center">
                <span className="relative z-10 flex h-6 w-6 items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-500 bg-background" />
                </span>
            </div>
            <div className="ml-6 flex-1">
                <div className="p-4 rounded-lg border bg-muted/40">
                    <p className="font-semibold text-foreground">{item.status.replace(/_/g, ' ')}</p>
                    <time className="block text-xs text-muted-foreground mt-0.5">
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")} por {item.responsible?.name || 'Sistema'}
                    </time>
                    <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}