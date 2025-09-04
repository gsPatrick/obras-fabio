import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { Toaster } from 'sonner'; // Importar o Toaster

export default function DashboardLayout({ children }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
      {/* Adicione o Toaster aqui. Ele fica invisível até ser chamado. */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
