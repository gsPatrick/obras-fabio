// components/dashboard/Header.js - VERSÃO FINAL CORRIGIDA
'use client';

import Link from "next/link";
import {
  Home,
  FileText,
  ClipboardPlus, // Despesas
  LayoutGrid, // Categorias
  Menu,
  Package2, // Ícone do Logo, mas será removido da lista de navegação
  Settings,
  Users, // Convidados
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProfileSwitcher } from "./ProfileSwitcher"; 
//agr
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Usado no ProfileSwitcher, mas mantido por precaução

// Lista de navegação (corrigida para incluir Despesas e Convidados)
const navItems = [
    { href: "/Painel", icon: Home, label: "Dashboard" },
    { href: "/expenses", icon: ClipboardPlus, label: "Despesas" }, // CRÍTICO: Adicionado Despesas
    { href: "/reports", icon: FileText, label: "Relatórios" },
    { href: "/categories", icon: LayoutGrid, label: "Categorias" },
    { href: "/guests", icon: Users, label: "Convidados" }, // Novo Link
    { href: "/settings", icon: Settings, label: "Configurações" },
];

export function Header() {
  const { user } = useAuth();
  
  const currentProfileId = typeof window !== 'undefined' ? localStorage.getItem('currentProfileId') : null;

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
          <nav className="grid gap-6 text-lg font-medium pt-8"> {/* Removido o Link do Logo e ajustado o padding */}
            
            {/* Adiciona o Logo/Título principal no topo do menu */}
            <div className="flex items-center gap-2 px-2.5 mb-4 border-b pb-4">
                 <Package2 className="h-5 w-5 text-blue-600" />
                 <span className="font-semibold text-gray-950 dark:text-gray-50">Controle de Obra</span>
            </div>
            
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    // Adicionando espaçamento e ícone
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
        {/* Espaço para busca */}
      </div>

      {/* INTEGRAÇÃO DO PROFILE SWITCHER */}
      {user && currentProfileId && <ProfileSwitcher currentProfileId={currentProfileId} />}
    </header>
  );
}