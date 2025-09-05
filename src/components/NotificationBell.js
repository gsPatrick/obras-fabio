"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import api from '../lib/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Usamos uma Ref para rastrear as notificações já exibidas como toast,
  // para não mostrar o mesmo pop-up repetidamente.
  const toastedIds = useRef(new Set());

  useEffect(() => {
    const fetchNotifications = async () => {
      // Na primeira carga, não queremos mostrar toasts de notificações antigas.
      const isFirstLoad = isLoading; 
      
      try {
        const response = await api.get('/notifications/me?limit=10');
        const fetchedNotifications = response.data.notifications || [];
        setNotifications(fetchedNotifications);

        const unread = fetchedNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);

        // --- LÓGICA PARA EXIBIR O POP-UP (TOAST) ---
        if (!isFirstLoad) {
            const newUnread = fetchedNotifications.filter(n => !n.isRead && !toastedIds.current.has(n.id));

            newUnread.forEach(n => {
                toast.info(n.title, {
                    description: n.message,
                    action: {
                        label: "Ver",
                        onClick: () => window.location.href = n.link || '#',
                    },
                });
                toastedIds.current.add(n.id); // Adiciona ao set para não mostrar de novo
            });
        } else {
            // Na primeira carga, apenas popula o set com as notificações existentes
            fetchedNotifications.forEach(n => toastedIds.current.add(n.id));
        }

      } catch (error) {
        console.error("Falha ao buscar notificações.");
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Busca a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("Todas as notificações foram marcadas como lidas.");
    } catch (error) {
      toast.error("Não foi possível marcar todas como lidas.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">{unreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notificações
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto px-2 py-1 text-xs">
              <CheckCheck className="mr-1 h-3 w-3"/>
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-2 space-y-2">
            <Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <Link href={n.link || '#'} key={n.id} passHref>
              <DropdownMenuItem className={`flex flex-col items-start gap-1 whitespace-normal ${!n.isRead ? 'bg-muted/50' : ''}`}>
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground self-end">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </DropdownMenuItem>
            </Link>
          ))
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação encontrada.</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}