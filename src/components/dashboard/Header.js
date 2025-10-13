// components/dashboard/Header.js
'use client';

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Package, Users, LineChart, Settings, PanelLeft, CreditCard, ListChecks } from "lucide-react";
import Link from "next/link";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { useAuth } from "@/context/AuthContext"; // Importar para checar admin
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
    const { user } = useAuth();
    const pathname = usePathname();

    const navLinks = [
        { href: "/dashboard", icon: Home, label: "Painel" },
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

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                    <nav className="grid gap-6 text-lg font-medium">
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className={cn("flex items-center gap-4 px-2.5", pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        ))}
                         {user?.email === 'fabio@gmail.com' && adminLinks.map(link => (
                             <Link key={link.href} href={link.href} className={cn("flex items-center gap-4 px-2.5", pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                         ))}
                    </nav>
                </SheetContent>
            </Sheet>

            <div className="relative ml-auto flex-1 md:grow-0">
                {/* O Profile Switcher é renderizado aqui */}
            </div>
            <ProfileSwitcher />
        </header>
    );
}