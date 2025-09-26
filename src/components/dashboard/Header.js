// components/dashboard/Header.js - VERSÃO CORRIGIDA
'use client';

import Link from "next/link";
import {
  Home,
  FileText,
  ClipboardPlus,
  LayoutGrid,
  Menu,
  Package2,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// <<< MUDANÇA 1: Lista de navegação idêntica à do Sidebar para consistência >>>
const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/expenses", icon: ClipboardPlus, label: "Despesas" },
    { href: "/reports", icon: FileText, label: "Relatórios" },
    { href: "/categories", icon: LayoutGrid, label: "Categorias" },
    { href: "/settings", icon: Settings, label: "Configurações" }, // Adicionado aqui
];

export function Header() {
  const { user, logout } = useAuth();

  // Pega as iniciais do email do usuário para o Avatar
  const getInitials = (email) => {
    if (!email) return '..';
    const parts = email.split('@');
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 dark:bg-gray-950">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 text-lg font-semibold text-white md:text-base"
            >
              <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Controle de Obra</span>
            </Link>
            {/* O menu mobile agora reflete todos os links corretamente */}
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 px-2.5 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50"
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Espaço para um futuro campo de busca, se necessário */}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <Avatar>
                {/* O Fallback usa as iniciais do usuário logado */}
                <AvatarFallback>{user ? getInitials(user.email) : '..'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Configurações</Link>
          </DropdownMenuItem>
          {/* <<< MUDANÇA 2: Removido o item "Suporte" que não tinha função >>> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}