"use client";

import { useRouter } from 'next/navigation';
import { Menu, Building2, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { NavLinks } from './NavLinks';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    toast.success('Você saiu com segurança!');
    router.push('/login');
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu de navegação</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Building2 className="h-6 w-6 text-primary" />
              <span>SAGEPE</span>
          </div>
          <NavLinks />
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1"></div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar><AvatarFallback><User /></AvatarFallback></Avatar>
              <span className="sr-only">Abrir menu do usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}