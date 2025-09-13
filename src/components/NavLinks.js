"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart,
  Settings,
  Workflow,
  Mail,
  ListTodo,
  Network,
  ChevronsUpDown,
  ClipboardList,
  FileText,
  MapPin,
  Contact,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';

// --- CONFIGURAÇÃO DE NAVEGAÇÃO ATUALIZADA COM permissionKey ---
// Cada link agora é controlado por uma ou mais chaves de permissão.
const navConfig = {
  mainLinks: [
    {
      href: '/principal',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permissionKey: 'dashboard:view'
    },
    {
      href: '/solicitacoes',
      label: 'Solicitações',
      icon: ClipboardList,
      // O usuário precisa ter pelo menos UMA dessas permissões para ver o link principal
      permissionKey: ['requests:read:own', 'requests:read:company', 'requests:read:all']
    },
  ],
  cadastrosSubLinks: [
    { href: '/pessoas', label: 'Pessoas', icon: Users, permissionKey: 'employees:read' },
    { href: '/clientes', label: 'Clientes', icon: Contact, permissionKey: 'companies:read' },
    { href: '/contratos', label: 'Contratos', icon: FileText, permissionKey: 'contracts:read' },
    { href: '/locais-de-trabalho', label: 'Locais de Trabalho', icon: MapPin, permissionKey: 'work-locations:read' },
    { href: '/cargos', label: 'Categorias', icon: Briefcase, permissionKey: 'positions:read' },
  ],
  adminSubLinks: [
    { href: '/admin/usuarios', label: 'Usuários', icon: Users, permissionKey: 'users:read' },
    { href: '/admin/settings', label: 'Config. de E-mail', icon: Mail, permissionKey: 'email-settings:read' },
  ],
  settingsSubLinks: [
    { href: '/configuracoes/etapas', label: 'Etapas', icon: ListTodo, permissionKey: 'steps:read' },
    { href: '/configuracoes/montagem-fluxos', label: 'Montagem de Fluxos', icon: Workflow, permissionKey: 'workflows:read' },
    { href: '/configuracoes/alocacao-transicoes', label: 'Alocação e Transições', icon: Network, permissionKey: 'workflows:write' },
  ],
  relatorios: {
    href: '/relatorios',
    label: 'Relatórios',
    icon: BarChart,
    permissionKey: 'reports:view'
  },
};

export function NavLinks() {
  const pathname = usePathname();
  // O hook useAuth decodifica o token, que agora contém o array 'permissions'
  const { user } = useAuth();

  if (!user) {
    // Renderiza nada ou um skeleton enquanto o usuário não é carregado
    return null;
  }

  /**
   * Verifica se o usuário logado tem permissão para ver um item de navegação.
   * @param {object} item - O objeto do link de navegação do navConfig.
   * @returns {boolean} - True se o usuário puder ver, senão false.
   */
  const canView = (item) => {
    // Regra 1: ADMIN sempre pode ver tudo.
    if (user.profile === 'ADMIN') {
      return true;
    }
    // Regra 2: Se não houver um array de permissões no token, nega o acesso.
    if (!user.permissions) {
      return false;
    }
    
    // Regra 3: Verifica a(s) permissão(ões) necessária(s).
    if (Array.isArray(item.permissionKey)) {
      // Se a permissão for um array, o usuário precisa ter pelo menos UMA delas.
      return item.permissionKey.some(key => user.permissions.includes(key));
    }
    
    // Se a permissão for uma string, verifica se ela existe no array de permissões do usuário.
    return user.permissions.includes(item.permissionKey);
  };

  // Calcula se os menus colapsáveis devem ser renderizados
  const canViewCadastros = navConfig.cadastrosSubLinks.some(canView);
  const canViewAdmin = navConfig.adminSubLinks.some(canView);
  const canViewSettings = navConfig.settingsSubLinks.some(canView);

  return (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium">
      {/* Links Principais */}
      {navConfig.mainLinks.filter(canView).map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === href && "bg-muted text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}

      {/* Seção de Cadastros */}
      {canViewCadastros && (
        <Collapsible defaultOpen={navConfig.cadastrosSubLinks.some(link => pathname.startsWith(link.href))}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary">
              <div className="flex items-center gap-3"><ClipboardList className="h-4 w-4" /><span>Cadastros</span></div>
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-6 pt-2 space-y-2">
            {navConfig.cadastrosSubLinks.filter(canView).map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-xs", pathname === href && "bg-muted text-primary")}>
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Link de Relatórios */}
      {canView(navConfig.relatorios) && (
        <Link
          href="/relatorios"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === "/relatorios" && "bg-muted text-primary"
          )}
        >
          <BarChart className="h-4 w-4" />
          Relatórios
        </Link>
      )}

      {/* Seção de Admin */}
      {canViewAdmin && (
        <Collapsible defaultOpen={navConfig.adminSubLinks.some(link => pathname.startsWith(link.href))}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary">
              <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4" /><span>Admin</span></div>
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-6 pt-2 space-y-2">
            {navConfig.adminSubLinks.filter(canView).map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-xs", pathname === href && "bg-muted text-primary")}>
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Seção de Configurações */}
      {canViewSettings && (
        <Collapsible defaultOpen={navConfig.settingsSubLinks.some(link => pathname.startsWith(link.href))}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-primary">
              <div className="flex items-center gap-3"><Settings className="h-4 w-4" /><span>Configurações</span></div>
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
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