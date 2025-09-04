"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '../../../../lib/api';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Skeleton } from '../../../../components/ui/skeleton';

export function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // Pega o usuário logado do hook
  
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });

  // Popula o formulário com os dados do usuário quando o componente carrega
  useEffect(() => {
    if (user) {
      // A API pode não retornar o telefone, então tratamos o caso de ser nulo
      // Buscamos os dados completos do usuário para ter a informação mais atualizada
      api.get(`/users/${user.id}`).then(response => {
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          password: ''
        });
      });
    }
  }, [user]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Não envia senha se vazia
      if (!payload.phone) delete payload.phone;

      await api.put('/users/profile/me', payload);
      toast.success("Perfil atualizado com sucesso!");
      // Limpa o campo de senha após o sucesso
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao atualizar o perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <form onSubmit={handleSaveProfile}>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Gerencie as informações da sua conta pessoal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Deixe em branco para não alterar" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}