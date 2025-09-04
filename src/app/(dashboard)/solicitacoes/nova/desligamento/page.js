"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '../../../../../lib/api';
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Textarea } from "../../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";

export default function FormDesligamentoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({ employeeId: '', reason: '' });

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsDataLoading(true);
      try {
        const response = await api.get('/employees'); 
        setEmployees(response.data.employees || []);
      } catch (error) {
        toast.error("Falha ao carregar a lista de colaboradores.");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setSelectedEmployee(employee || null);
    handleChange('employeeId', employeeId);
  };

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedEmployee) {
      toast.warning("Por favor, selecione um colaborador.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        employeeId: formData.employeeId,
        reason: formData.reason,
        type: 'DESLIGAMENTO',
        companyId: selectedEmployee.contract?.companyId,
        contractId: selectedEmployee.contractId,
        workLocationId: selectedEmployee.workLocationId,
      };
      await api.post('/requests/resignation', payload);
      toast.success("Solicitação de desligamento enviada com sucesso!");
      router.push('/solicitacoes');
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao enviar solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-2">
      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Formulário de Desligamento</CardTitle>
            <CardDescription>Selecione o colaborador para iniciar o processo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Nome do Colaborador</Label>
                <Select onValueChange={handleEmployeeChange} value={formData.employeeId} disabled={isDataLoading} required>
                  <SelectTrigger><SelectValue placeholder={isDataLoading ? "Carregando..." : "Selecione um colaborador"} /></SelectTrigger>
                  <SelectContent>{employees.map(emp => (<SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.registration})</SelectItem>))}</SelectContent>
                </Select>
              </div>
              {selectedEmployee && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md bg-muted/50">
                  <div className="space-y-2"><Label>CPF</Label><Input value={selectedEmployee.cpf || ''} disabled /></div>
                  <div className="space-y-2"><Label>Cargo Atual</Label><Input value={selectedEmployee.position?.name || ''} disabled /></div>
                  <div className="space-y-2"><Label>Contrato</Label><Input value={selectedEmployee.contract?.name || ''} disabled /></div>
                  <div className="space-y-2"><Label>Local de Trabalho</Label><Input value={selectedEmployee.workLocation?.name || ''} disabled /></div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo do Desligamento</Label>
                <Textarea id="reason" value={formData.reason} onChange={(e) => handleChange('reason', e.target.value)} required />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" type="button" onClick={() => router.push('/solicitacoes/nova')} disabled={isLoading}>Cancelar</Button>
                  <Button type="submit" disabled={isLoading || isDataLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Enviando..." : "Enviar Solicitação"}
                  </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}