// app/(profile)/layout.js
import { Suspense } from 'react'; // Importar Suspense
import { Loader2 } from 'lucide-react'; // Importar um ícone de carregamento para o Fallback

export default function ProfileLayout({ children }) {
  return (
    <main className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
      {/* CRÍTICO: Envolver o children em Suspense para o useSearchParams */}
      <Suspense fallback={
          <div className="flex flex-col items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Carregando Perfil...</p>
          </div>
      }>
        {children}
      </Suspense>
    </main>
  );
}