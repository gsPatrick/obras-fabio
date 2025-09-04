"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { FlowBuilder } from "./FlowBuilder";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Loader2 } from 'lucide-react';
import api from '../../../../lib/api';
import { Skeleton } from '../../../../components/ui/skeleton';

export default function MontagemFluxosPage() {
  // Estados de carregamento refinados
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Para a carga inicial de workflows e steps
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(false); // Para quando um workflow é selecionado
  const [isSaving, setIsSaving] = useState(false);
  
  const [workflows, setWorkflows] = useState([]);
  const [allSteps, setAllSteps] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  
  const [flowItems, setFlowItems] = useState([]);

  // Busca a lista de workflows e a lista de todas as etapas disponíveis na montagem do componente
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsInitialLoading(true);
      try {
        const [workflowsRes, stepsRes] = await Promise.all([
          api.get('/workflows'),
          api.get('/steps')
        ]);
        setWorkflows(workflowsRes.data || []);
        setAllSteps(stepsRes.data.steps || []);
      } catch (error) {
        toast.error("Falha ao carregar dados de configuração.");
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Busca os detalhes de um workflow específico quando o usuário seleciona no dropdown
  const handleWorkflowChange = useCallback(async (workflowId) => {
    if (!workflowId) {
      setFlowItems([]);
      setSelectedWorkflowId('');
      return;
    }
    setIsWorkflowLoading(true); // Ativa o loading específico do workflow
    setSelectedWorkflowId(workflowId);
    try {
      const response = await api.get(`/workflows/${workflowId}`);
      const configuredSteps = response.data.workflowSteps.map(ws => ({
        ...ws.step,
        order: ws.order
      }));
      setFlowItems(configuredSteps);
    } catch (error) {
      toast.error("Falha ao carregar as etapas do fluxo selecionado.");
      setFlowItems([]);
    } finally {
      setIsWorkflowLoading(false); // Desativa o loading específico do workflow
    }
  }, []);

  const handleSaveFlow = async () => {
    if (!selectedWorkflowId) {
      toast.warning("Por favor, selecione um fluxo para salvar.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = flowItems.map((item, index) => ({
        stepId: item.id,
        order: index + 1,
        profileOverride: item.profileOverride || null, 
        allowedNextStepIds: item.allowedNextStepIds || []
      }));

      await api.put(`/workflows/${selectedWorkflowId}/steps`, payload);
      toast.success("Fluxo de trabalho salvo com sucesso!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao salvar o fluxo de trabalho.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">Montagem de Fluxos de Trabalho</h1>
        <p className="text-muted-foreground mt-1">
          Selecione um tipo de solicitação e arraste as etapas para montar o fluxo desejado.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 p-4 border rounded-lg">
        <div className="w-full md:w-auto flex-grow">
            <label className="text-sm font-medium">Tipo de Solicitação</label>
            {/* O seletor agora é desabilitado apenas durante a carga inicial */}
            <Select onValueChange={handleWorkflowChange} value={selectedWorkflowId} disabled={isInitialLoading}>
                <SelectTrigger>
                    <SelectValue placeholder={isInitialLoading ? "Carregando fluxos..." : "Selecione um tipo..."} />
                </SelectTrigger>
                <SelectContent>
                    {workflows.map(wf => (
                      <SelectItem key={wf.id} value={wf.id}>{wf.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="w-full md:w-auto self-end">
            <Button className="w-full" onClick={handleSaveFlow} disabled={isSaving || isInitialLoading || !selectedWorkflowId}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Salvando..." : "Salvar Fluxo"}
            </Button>
        </div>
      </div>
      
      {/* Exibe skeleton enquanto o workflow específico está carregando */}
      {isWorkflowLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <FlowBuilder 
            allSteps={allSteps} 
            flowItems={flowItems}
            setFlowItems={setFlowItems}
        />
      )}
    </div>
  );
}