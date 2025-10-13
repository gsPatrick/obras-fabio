// components/dashboard/Sidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  Users,
  LineChart,
  Settings,
  CreditCard,
  ListChecks,
  Banknote,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navLinks = [
    { href: "/Painel", icon: Home, label: "Painel" }, // ROTA CORRIGIDA
    { href: "/revenues", icon: Banknote, label: "Entradas" },
    { href: "/expenses", icon: Package, label: "Custos" },
    { href: "/credit-cards", icon: CreditCard, label: "Cartões de Crédito" },
    { href: "/categories", icon: ListChecks, label: "Categorias" },
    { href: "/reports", icon: LineChart, label: "Relatórios" },
    { href: "/guests", icon: Users, label: "Convidados" },
  ];

  const adminLinks = [
    { href: "/admin/users", icon: Users, label: "Admin: Usuários" },
    { href: "/admin/profits", icon: LineChart, label: "Admin: Lucros" },
  ];

  const renderLink = (link) => {
    const isActive = pathname === link.href;
    return (
      <Tooltip key={link.href}>
        <TooltipTrigger asChild>
          <Link
            href={link.href}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
              isActive 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <link.icon className="h-5 w-5" />
            <span className="sr-only">{link.label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{link.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {navLinks.map(link => renderLink(link))}
          
          {/* SEPARADOR VISUAL PARA LINKS DE ADMIN */}
          {user?.email === 'fabio@gmail.com' && (
            <div className="my-2 w-full border-t border-border" />
          )}

          {user?.email === 'fabio@gmail.com' && adminLinks.map(link => renderLink(link))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          {renderLink({ href: "/settings", icon: Settings, label: "Configurações" })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}