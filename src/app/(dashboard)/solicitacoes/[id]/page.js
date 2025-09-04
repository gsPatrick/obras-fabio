"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { Timeline } from "../../../../components/Timeline";
import { Skeleton } from '../../../../components/ui/skeleton';
import { ActionPanel } from './components/ActionPanel';
import api from '../../../../lib/api';
import { toast } from 'sonner';

export default function SolicitacaoDetalhesPage({ params }) {
  const [solicitation, setSolicitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/requests/${params.id}`);
      setSolicitation(response.data);
    } catch (error) {
      toast.error("Falha ao carregar os detalhes da solicitação.");
      setSolicitation(null);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserProfile(decodedToken.profile);
    }
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (!solicitation) {
    return <div className="text-center">Solicitação não encontrada ou você não tem permissão para visualizá-la.</div>;
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detalhes da Solicitação</h1>
          <p className="text-muted-foreground mt-1">Protocolo: {solicitation.protocol}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Badge className="text-base">{solicitation.status.replace(/_/g, ' ')}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Informações Principais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Candidato/Col.</span><span className="font-medium text-right">{solicitation.candidateName || solicitation.employee?.name}</span></div><Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">CPF</span><span className="font-medium">{solicitation.candidateCpf || solicitation.employee?.cpf}</span></div><Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Cargo</span><span className="font-medium text-right">{solicitation.position?.name}</span></div><Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Empresa</span><span className="font-medium text-right">{solicitation.company?.corporateName}</span></div><Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Solicitante</span><span className="font-medium text-right">{solicitation.solicitant?.name}</span></div>
            </CardContent>
          </Card>
          
          <ActionPanel solicitation={solicitation} userProfile={userProfile} refetchData={fetchData} />
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader><CardTitle>Histórico da Solicitação</CardTitle></CardHeader>
            <CardContent><Timeline history={solicitation.statusHistory} /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}