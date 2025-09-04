"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  LayoutDashboard, Users, Building, Briefcase, BarChart, Settings, Workflow,
  ListTodo, FilePlus, Network, ChevronsUpDown, ClipboardList, FileText, MapPin, Contact, ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';

// Definição de acesso completa e correta
const navConfig = {
  mainLinks: [
    { href: '/principal', label: 'Dashboard', icon: LayoutDashboard, profiles: ['ADMIN', 'RH', 'GESTAO', 'SOLICITANTE'] },
    { href: '/solicitacoes', label: 'Solicitações', icon: ClipboardList, profiles: ['ADMIN', 'RH', 'GESTAO', 'SOLICITANTE'] },
  ],
  cadastrosSubLinks: [
      { href: '/pessoas', label: 'Pessoas', icon: Users, profiles: ['ADMIN', 'RH'] },
      { href: '/clientes', label: 'Clientes', icon: Contact, profiles: ['ADMIN', 'RH', 'GESTAO'] },
      { href: '/contratos', label: 'Contratos', icon: FileText, profiles: ['ADMIN', 'RH', 'GESTAO'] },
      { href: '/locais-de-trabalho', label: 'Locais de Trabalho', icon: MapPin, profiles: ['ADMIN', 'RH', 'GESTAO'] },
      { href: '/cargos', label: 'Cargos', icon: Briefcase, profiles: ['ADMIN', 'RH'] },
  ],
  adminSubLinks: [
      { href: '/admin/usuarios', label: 'Usuários', icon: Users, profiles: ['ADMIN'] },
  ],
  // --- ESTRUTURA DE CONFIGURAÇÕES RESTAURADA ---
  settingsSubLinks: [
    // O link "Geral" foi removido pois a página de configurações agora tem abas,
    // então apontamos para o primeiro sub-item como padrão.
    { href: '/configuracoes/tipos-solicitacao', label: 'Tipos de Solicitação', icon: FilePlus, profiles: ['ADMIN', 'RH'] },
    { href: '/configuracoes/etapas', label: 'Etapas', icon: ListTodo, profiles: ['ADMIN', 'RH'] },
    { href: '/configuracoes/montagem-fluxos', label: 'Montagem de Fluxos', icon: Workflow, profiles: ['ADMIN', 'RH'] },
    { href: '/configuracoes/alocacao-transicoes', label: 'Alocação e Transições', icon: Network, profiles: ['ADMIN', 'RH'] },
  ],
  relatorios: { href: '/relatorios', label: 'Relatórios', icon: BarChart, profiles: ['ADMIN', 'RH', 'GESTAO'] },
};

export function NavLinks() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const canView = (item) => item.profiles.includes(user.profile);
  const canViewCadastros = navConfig.cadastrosSubLinks.some(canView);
  const canViewAdmin = navConfig.adminSubLinks.some(canView);
  const canViewSettings = navConfig.settingsSubLinks.some(canView);

  return (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium">
      {/* Links Principais */}
      {navConfig.mainLinks.filter(canView).map(({ href, label, icon: Icon }) => (
        <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname === href && "bg-muted text-primary")}>
          <Icon className="h-4 w-4" />{label}
        </Link>
      ))}

      {/* Menu de Cadastros Colapsável */}
      {canViewCadastros && (
        <Collapsible defaultOpen={navConfig.cadastrosSubLinks.some(link => pathname.startsWith(link.href))}>
          <CollapsibleTrigger asChild><Button variant="ghost" className="w-full flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary"><div className="flex items-center gap-3"><ClipboardList className="h-4 w-4" /><span>Cadastros</span></div><ChevronsUpDown className="h-4 w-4" /></Button></CollapsibleTrigger>
          <CollapsibleContent className="pl-6 pt-2 space-y-2">
            {navConfig.cadastrosSubLinks.filter(canView).map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-xs", pathname === href && "bg-muted text-primary")}><Icon className="h-3 w-3" />{label}</Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {/* Relatórios */}
      {canView(navConfig.relatorios) && (
        <Link href="/relatorios" className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname === "/relatorios" && "bg-muted text-primary")}><BarChart className="h-4 w-4" />Relatórios</Link>
      )}

      {/* Menu de Admin */}
      {canViewAdmin && (
        <Collapsible defaultOpen={navConfig.adminSubLinks.some(link => pathname.startsWith(link.href))}>
          <CollapsibleTrigger asChild><Button variant="ghost" className="w-full flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary"><div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4" /><span>Admin</span></div><ChevronsUpDown className="h-4 w-4" /></Button></CollapsibleTrigger>
          <CollapsibleContent className="pl-6 pt-2 space-y-2">
            {navConfig.adminSubLinks.filter(canView).map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-xs", pathname === href && "bg-muted text-primary")}><Icon className="h-3 w-3" />{label}</Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* --- MENU DE CONFIGURAÇÕES CORRIGIDO E RESTAURADO --- */}
      {canViewSettings && (
        <Collapsible defaultOpen={navConfig.settingsSubLinks.some(link => pathname.startsWith(link.href.split('/')[1] + '/' + link.href.split('/')[2]))}>
          <CollapsibleTrigger asChild><Button variant="ghost" className="w-full flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary"><div className="flex items-center gap-3"><Settings className="h-4 w-4" /><span>Configurações</span></div><ChevronsUpDown className="h-4 w-4" /></Button></CollapsibleTrigger>
          <CollapsibleContent className="pl-6 pt-2 space-y-2">
            {navConfig.settingsSubLinks.filter(canView).map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-xs", pathname === href && "bg-muted text-primary")}>
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </nav>
  );
}