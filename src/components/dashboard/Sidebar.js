// components/dashboard/Sidebar.js - VERSÃO FINAL CORRIGIDA
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText, 
  ClipboardPlus, // Despesas
  LayoutGrid, // Categorias
  Settings,
  Users, // Convidados
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Lista de navegação unificada
const navItems = [
  { href: "/Painel", icon: Home, label: "Dashboard" },
  { href: "/expenses", icon: ClipboardPlus, label: "Despesas" },
  { href: "/reports", icon: FileText, label: "Relatórios" },
  { href: "/categories", icon: LayoutGrid, label: "Categorias" },
  { href: "/guests", icon: Users, label: "Convidados" }, 
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-white sm:flex dark:bg-gray-950">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
  
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                      isActive
                        // O estilo de ATIVO agora usa cores neutras que adaptam ao tema
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
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
        
        {/* Link de Configurações */}
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                    pathname === '/settings'
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
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