"use client"

import * as React from "react"
import { toast } from "sonner";
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Button } from "../../../../components/ui/button"
import api from "../../../../lib/api";
import { Loader2 } from "lucide-react";
import { Skeleton } from "../../../../components/ui/skeleton";

export default function AlocacaoPage() {
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isWorkflowLoading, setIsWorkflowLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [workflows, setWorkflows] = React.useState([]);
  const [allSteps, setAllSteps] = React.useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState('');
  
  // Estado que armazena os dados da tabela
  const [flowConfig, setFlowConfig] = React.useState([]);

  // Busca inicial de workflows e todas as etapas
  React.useEffect(() => {
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

  // Busca a configuração de um workflow específico
  const handleWorkflowChange = React.useCallback(async (workflowId) => {
    if (!workflowId) {
      setFlowConfig([]);
      setSelectedWorkflowId('');
      return;
    }
    setIsWorkflowLoading(true);
    setSelectedWorkflowId(workflowId);
    try {
      const response = await api.get(`/workflows/${workflowId}`);
      // Mapeia os dados para o formato que a tabela espera
      const configuredSteps = response.data.workflowSteps.map(ws => ({
        ...ws.step, // id, name, defaultProfile
        order: ws.order,
        profileOverride: ws.profileOverride,
        allowedNextStepIds: ws.allowedNextStepIds,
      }));
      setFlowConfig(configuredSteps);
    } catch (error) {
      toast.error("Falha ao carregar a configuração do fluxo.");
      setFlowConfig([]);
    } finally {
      setIsWorkflowLoading(false);
    }
  }, []);

  // Função para atualizar o estado da configuração em tempo real
  const handleUpdateConfig = (stepId, field, value) => {
    setFlowConfig(currentConfig =>
      currentConfig.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
  };

  // Função para salvar a configuração na API
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const payload = flowConfig.map(step => ({
        stepId: step.id,
        order: step.order,
        profileOverride: step.profileOverride,
        allowedNextStepIds: step.allowedNextStepIds,
      }));
      await api.put(`/workflows/${selectedWorkflowId}/steps`, payload);
      toast.success("Configurações do fluxo salvas com sucesso!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao salvar as configurações.");
    } finally {
      setIsSaving(false);
    }
  };

  // Gera as colunas passando os dados e a função de callback
  const columns = React.useMemo(() => getColumns(allSteps, handleUpdateConfig), [allSteps]);

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Alocação e Transições</h1>
        <p className="text-muted-foreground mt-1">
          Para cada etapa de um fluxo, defina o perfil responsável e as próximas etapas possíveis.
        </p>
      </div>
       <div className="flex flex-col md:flex-row items-center gap-4 mb-6 p-4 border rounded-lg">
        <div className="w-full md:w-auto flex-grow">
            <label className="text-sm font-medium">Selecione o Fluxo para Configurar</label>
            <Select onValueChange={handleWorkflowChange} value={selectedWorkflowId} disabled={isInitialLoading}>
                <SelectTrigger>
                    <SelectValue placeholder={isInitialLoading ? "Carregando..." : "Selecione um fluxo"} />
                </SelectTrigger>
                <SelectContent>
                    {workflows.map(wf => (
                      <SelectItem key={wf.id} value={wf.id}>{wf.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="w-full md:w-auto self-end">
            <Button className="w-full" onClick={handleSaveChanges} disabled={isSaving || !selectedWorkflowId}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
        </div>
      </div>

      {isWorkflowLoading ? <Skeleton className="h-64 w-full" /> : <DataTable columns={columns} data={flowConfig} />}
    </div>
  )
}