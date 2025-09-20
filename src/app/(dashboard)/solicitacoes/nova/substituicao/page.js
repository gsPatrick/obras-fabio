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
import { Separator } from "../../../../../components/ui/separator";
import { Textarea } from '../../../../../components/ui/textarea';
import { SearchableSelect } from '../components/SearchableSelect'; // <-- MUDANÇA

export default function FormSubstituicaoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    candidateName: '',
    candidateCpf: '',
    candidatePhone: '',
    reason: '',
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsDataLoading(true);
      try {
        const response = await api.get('/employees');
        setEmployees(response.data.employees || []);
      } catch (error) { toast.error("Falha ao carregar a lista de colaboradores."); } 
      finally { setIsDataLoading(false); }
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
      toast.warning("Por favor, selecione o colaborador a ser substituído.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        type: 'SUBSTITUICAO',
        companyId: selectedEmployee.contract?.companyId,
        contractId: selectedEmployee.contractId,
        workLocationId: selectedEmployee.workLocationId,
        positionId: selectedEmployee.positionId,
      };
      await api.post('/requests/resignation', payload);
      toast.success("Solicitação de substituição enviada com sucesso!");
      router.push('/solicitacoes');
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao enviar solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.registration})`
  }));

  return (
    <div className="container mx-auto py-2">
      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Formulário de Substituição</CardTitle>
            <CardDescription>Informe quem sai e os dados do novo candidato.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                  <h3 className="text-lg font-medium">Colaborador a ser Substituído</h3>
                  <div className="space-y-2 mt-2">
                      <Label htmlFor="employeeId">Nome do Colaborador</Label>
                      <SearchableSelect
                        options={employeeOptions}
                        value={formData.employeeId}
                        onChange={handleEmployeeChange}
                        placeholder={isDataLoading ? "Carregando..." : "Selecione um colaborador"}
                        disabled={isDataLoading}
                      />
                  </div>
              </div>
              <Separator />
              <div>
                  <h3 className="text-lg font-medium">Novo Candidato</h3>
                  <div className="space-y-4 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2"><Label htmlFor="candidateName">Nome</Label><Input id="candidateName" value={formData.candidateName} onChange={(e) => handleChange('candidateName', e.target.value)} required /></div>
                          <div className="space-y-2"><Label htmlFor="candidateCpf">CPF</Label><Input id="candidateCpf" value={formData.candidateCpf} onChange={(e) => handleChange('candidateCpf', e.target.value)} required /></div>
                      </div>
                      <div className="space-y-2"><Label htmlFor="candidatePhone">Telefone</Label><Input id="candidatePhone" value={formData.candidatePhone} onChange={(e) => handleChange('candidatePhone', e.target.value)} required /></div>
                  </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo / Justificativa</Label>
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