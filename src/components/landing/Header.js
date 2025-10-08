// components/dashboard/Header.js
'use client';

import Link from "next/link";
import { Home, FileText, ClipboardPlus, LayoutGrid, Menu, Package2, Settings, Users, TrendingUp } from "lucide-react"; // Adicionado TrendingUp
import { useAuth } from "@/context/AuthContext";
import { ProfileSwitcher } from "./ProfileSwitcher"; 
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator"; // Adicionado Separator

const navItems = [
    { href: "/Painel", icon: Home, label: "Dashboard" },
    { href: "/expenses", icon: ClipboardPlus, label: "Despesas" },
    { href: "/reports", icon: FileText, label: "Relatórios" },
    { href: "/categories", icon: LayoutGrid, label: "Categorias" },
    { href: "/guests", icon: Users, label: "Convidados" },
    { href: "/settings", icon: Settings, label: "Configurações" },
];

const adminNavItems = [
    { href: "/admin/users", icon: Users, label: "Usuários" },
    { href: "/admin/profits", icon: TrendingUp, label: "Lucros" },
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
          <nav className="grid gap-6 text-lg font-medium pt-8">
            <div className="flex items-center gap-2 px-2.5 mb-4 border-b pb-4">
                 <Package2 className="h-5 w-5 text-blue-600" />
                 <span className="font-semibold text-gray-950 dark:text-gray-50">Controle de Obra</span>
            </div>
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
            {/* <<< INÍCIO: RENDERIZAÇÃO CONDICIONAL PARA ADMIN NO MOBILE >>> */}
            {user?.email === 'fabio@gmail.com' && (
                <>
                    <Separator className="my-2 bg-border" />
                     <p className="px-2.5 text-sm font-semibold text-muted-foreground">Admin</p>
                    {adminNavItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-4 px-2.5 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-50"
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </>
            )}
            {/* <<< FIM: RENDERIZAÇÃO CONDICIONAL >>> */}
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="relative ml-auto flex-1 md:grow-0"></div>
      {user && currentProfileId && <ProfileSwitcher currentProfileId={currentProfileId} />}
    </header>
  );
}