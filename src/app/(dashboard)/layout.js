// app/(dashboard)/layout.js
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import ErrorBoundary from "@/components/ErrorBoundary"; // <<< IMPORTAR

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100/40 dark:bg-gray-800/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <ErrorBoundary> {/* <<< ENVOLVER O CHILDREN */}
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}