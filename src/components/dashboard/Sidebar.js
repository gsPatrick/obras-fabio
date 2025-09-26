// components/dashboard/Sidebar.js - VERSÃO CORRIGIDA
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText, // Ícone mais apropriado para Relatórios
  ClipboardPlus, // Ícone mais apropriado para Despesas
  LayoutGrid, // Ícone mais apropriado para Categorias
  Package2,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// <<< MUDANÇA 1: Lista de navegação unificada e correta >>>
const navItems = [
  { href: "/Painel", icon: Home, label: "Dashboard" },
  { href: "/expenses", icon: ClipboardPlus, label: "Despesas" },
  { href: "/reports", icon: FileText, label: "Relatórios" },
  { href: "/categories", icon: LayoutGrid, label: "Categorias" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-white sm:flex dark:bg-gray-950">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
  
        
          {navItems.map((item) => {
            // Verifica se o link ativo corresponde ao início do href para sub-rotas
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                      isActive
                        ? "bg-blue-100 text-blue-600 dark:bg-gray-800 dark:text-gray-50"
                        : "text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        
        {/* <<< MUDANÇA 2: Link de Configurações movido para o final, de forma consistente >>> */}
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                    pathname === '/settings'
                        ? "bg-blue-100 text-blue-600 dark:bg-gray-800 dark:text-gray-50"
                        : "text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50"
                }`}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Configurações</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Configurações</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}