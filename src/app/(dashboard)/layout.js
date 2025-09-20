import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { Toaster } from 'sonner';

export default function DashboardLayout({ children }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      {/* --- CORREÇÃO APLICADA AQUI --- */}
      <div className="flex flex-col min-w-0">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}