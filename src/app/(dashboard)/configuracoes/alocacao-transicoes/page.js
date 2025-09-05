"use client"

import * as React from "react"
import Link from "next/link";
import { toast } from "sonner";
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Button } from "../../../../components/ui/button"
import api from "../../../../lib/api";
import { Loader2, ListTodo, PlusCircle } from "lucide-react";
import { Skeleton } from "../../../../components/ui/skeleton";

export default function AlocacaoPage() {
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isWorkflowLoading, setIsWorkflowLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [workflows, setWorkflows] = React.useState([]);
  const [allSteps, setAllSteps] = React.useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState('');
  
  const [flowConfig, setFlowConfig] = React.useState([]);

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
      const configuredSteps = response.data.workflowSteps.map(ws => ({
        ...ws.step,
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

  const handleUpdateConfig = (stepId, field, value) => {
    setFlowConfig(currentConfig =>
      currentConfig.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
  };

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

  const columns = React.useMemo(() => getColumns(allSteps, handleUpdateConfig), [allSteps]);

  // --- NOVO: Renderização condicional ---
  const renderContent = () => {
    if (isInitialLoading) {
        return <Skeleton className="h-[500px] w-full" />;
    }

    if (allSteps.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma Etapa Cadastrada</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Para configurar alocações e transições, você precisa primeiro criar as etapas.
                </p>
                <div className="mt-6">
                    <Link href="/configuracoes/etapas">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Cadastrar Etapas
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
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
        </>
    );
  };

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Alocação e Transições</h1>
        <p className="text-muted-foreground mt-1">
          Para cada etapa de um fluxo, defina o perfil responsável e as próximas etapas possíveis.
        </p>
      </div>
      {renderContent()}
    </div>
  )
}