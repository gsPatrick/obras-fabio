"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '../../../../../lib/api';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Label } from '../../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Textarea } from '../../../../../components/ui/textarea';

export function ActionPanel({ solicitation, userProfile, refetchData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [nextStepName, setNextStepName] = useState('');
  const [allowedNextSteps, setAllowedNextSteps] = useState([]);
  const [isTransitionsLoading, setIsTransitionsLoading] = useState(false);

  // Busca as transições permitidas para o status atual
  useEffect(() => {
    const fetchAllowedTransitions = async () => {
      if (solicitation && solicitation.workflowId) {
        setIsTransitionsLoading(true);
        try {
          // A API de workflows nos diz quais são as próximas etapas permitidas
          const response = await api.get(`/workflows/${solicitation.workflowId}`);
          const workflowSteps = response.data.workflowSteps || [];
          const currentStepConfig = workflowSteps.find(ws => ws.step.name === solicitation.status);
          
          if (currentStepConfig && currentStepConfig.allowedNextStepIds && currentStepConfig.allowedNextStepIds.length > 0) {
            // Se há próximas etapas definidas, busca os detalhes delas
            const allStepsResponse = await api.get('/steps');
            const allSteps = allStepsResponse.data.steps || [];
            const nextSteps = allSteps.filter(step => currentStepConfig.allowedNextStepIds.includes(step.id));
            setAllowedNextSteps(nextSteps);
          } else {
            // Se allowedNextStepIds for vazio ou nulo, significa que qualquer transição é possível (para o perfil correto)
            // ou que é o fim do fluxo. Por segurança, limpamos o array.
            setAllowedNextSteps([]);
          }
        } catch (error) {
          console.error("Failed to fetch allowed transitions", error);
          setAllowedNextSteps([]);
        } finally {
          setIsTransitionsLoading(false);
        }
      }
    };
    fetchAllowedTransitions();
  }, [solicitation]);

  // Função genérica para submeter a mudança de status
  const handleStatusUpdate = async (targetStepName, userNotes) => {
    setIsLoading(true);
    try {
      await api.patch(`/requests/${solicitation.id}/status`, { newStepName: targetStepName, notes: userNotes });
      toast.success(`Solicitação movida para "${targetStepName.replace(/_/g, ' ')}".`);
      refetchData();
      setNotes('');
      setNextStepName('');
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao atualizar o status.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!nextStepName) {
      toast.warning("Por favor, selecione a próxima etapa.");
      return;
    }
    handleStatusUpdate(nextStepName, notes);
  };

  // --- LÓGICA DE RENDERIZAÇÃO REFINADA ---
  const renderPanelContent = () => {
    // Cenário 1: Ação da GESTÃO para aprovar/reprovar a solicitação inicial.
    // O status inicial deve ser algo como "EM_ANALISE_GESTAO".
    const isManagerApprovalStep = solicitation.status === 'EM_ANALISE_GESTAO';
    if (userProfile === 'GESTAO' && isManagerApprovalStep) {
      return (
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="notes">Observações (Obrigatório para reprovar)</Label><Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div className="flex gap-4">
             {/* O nome do próximo status ('APROVADO_PELA_GESTAO') deve existir na tabela Steps */}
            <Button className="flex-1" onClick={() => handleStatusUpdate('APROVADO_PELA_GESTAO', notes || 'Aprovado pela gestão.')} disabled={isLoading}>Aprovar</Button>
            {/* O nome do próximo status ('REPROVADO_PELA_GESTAO') deve existir na tabela Steps */}
            <Button variant="destructive" className="flex-1" onClick={() => handleStatusUpdate('REPROVADO_PELA_GESTAO', notes)} disabled={isLoading || !notes}>Reprovar</Button>
          </div>
        </CardContent>
      );
    }

    // Cenário 2: Ação do RH/Admin para avançar o fluxo, DESDE QUE não seja a etapa de aprovação da gestão.
    const isRhOrAdminAction = (userProfile === 'RH' || userProfile === 'ADMIN') && !isManagerApprovalStep;
    if (isRhOrAdminAction && (allowedNextSteps.length > 0 || isTransitionsLoading)) {
      return (
        <form onSubmit={handleFormSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="next-status">Próximo Status</Label>
              <Select onValueChange={setNextStepName} value={nextStepName} required disabled={isTransitionsLoading}>
                <SelectTrigger><SelectValue placeholder={isTransitionsLoading ? "Carregando..." : "Selecione a próxima etapa"} /></SelectTrigger>
                <SelectContent>{allowedNextSteps.map(step => (<SelectItem key={step.id} value={step.name}>{step.name.replace(/_/g, ' ')}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label htmlFor="notes-rh">Observações</Label><Textarea id="notes-rh" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Atualizar Status</Button>
          </CardContent>
        </form>
      );
    }
    
    // Cenário Padrão: Nenhuma ação disponível
    return <CardContent><p className="text-sm text-muted-foreground">Nenhuma ação disponível para seu perfil nesta etapa.</p></CardContent>;
  };

  return (
    <Card>
      <CardHeader><CardTitle>Painel de Ações</CardTitle><CardDescription>Atualize o andamento da solicitação.</CardDescription></CardHeader>
      {renderPanelContent()}
    </Card>
  );
}