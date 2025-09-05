"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '../../../../lib/api';

import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Skeleton } from '../../../../components/ui/skeleton';

export default function EmailSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/settings/resend');
        setApiKey(response.data.apiKey || '');
      } catch (error) {
        toast.error("Não foi possível carregar as configurações de e-mail.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/settings/resend', { apiKey });
      toast.success("API Key do Resend salva com sucesso!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao salvar a API Key.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações de E-mail</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie a integração para o disparo de e-mails transacionais.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full max-w-2xl" />
      ) : (
        <form onSubmit={handleSaveChanges}>
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Integração com Resend</CardTitle>
              <CardDescription>
                Insira a API Key fornecida pelo seu painel do Resend.com para habilitar o envio de e-mails de boas-vindas para novos usuários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Resend API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="re_xxxxxxxx_xxxxxxxxxxxx"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}