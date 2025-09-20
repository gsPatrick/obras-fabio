"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '../../../../../lib/utils';
import api from '../../../../../lib/api';
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Textarea } from "../../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from '../../../../../components/ui/popover';
import { Calendar } from '../../../../../components/ui/calendar';
import { Separator } from '../../../../../components/ui/separator';
import { SearchableSelect } from '../components/SearchableSelect'; // <-- MUDANÇA

export default function FormTrocaDeLocalPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [allWorkLocations, setAllWorkLocations] = useState([]);
  
  const [availableWorkLocations, setAvailableWorkLocations] = useState([]);
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({ 
      employeeId: '', 
      newWorkLocationId: '', 
      reason: '', 
      suggestedDate: null 
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsDataLoading(true);
      try {
        const [employeesRes, locationsRes] = await Promise.all([
          api.get('/employees?all=true'),
          api.get('/work-locations?all=true')
        ]);
        setEmployees(employeesRes.data.employees || []);
        setAllWorkLocations(locationsRes.data.workLocations || []);
      } catch (error) {
        toast.error("Falha ao carregar os dados necessários para o formulário.");
        console.error("Erro ao buscar dados iniciais:", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setSelectedEmployee(employee || null);
    handleChange('employeeId', employeeId);

    handleChange('newWorkLocationId', ''); 

    if (employee) {
      const availableLocations = allWorkLocations.filter(loc => loc.id !== employee.workLocationId);
      setAvailableWorkLocations(availableLocations);
    } else {
      setAvailableWorkLocations([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedEmployee) {
      toast.warning("Por favor, selecione um colaborador.");
      return;
    }

    if (formData.suggestedDate && new Date(formData.suggestedDate) < new Date().setHours(0, 0, 0, 0)) {
        toast.error("A data sugerida para a mudança não pode ser uma data passada.");
        return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        companyId: selectedEmployee.contract.companyId,
        contractId: selectedEmployee.contractId,
        workLocationId: selectedEmployee.workLocationId,
        positionId: selectedEmployee.positionId,
      };
      
      if (!payload.suggestedDate) {
          delete payload.suggestedDate;
      }

      await api.post('/requests/workplace-change', payload);
      toast.success("Solicitação de troca de local enviada com sucesso!");
      router.push('/solicitacoes');
    } catch (error) {
      toast.error(error.response?.data?.error || "Ocorreu um erro ao enviar a solicitação.");
      console.error("Erro no submit do formulário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (Matrícula: ${emp.registration})`
  }));

  return (
    <div className="container mx-auto py-2">
      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Formulário de Troca de Local de Trabalho</CardTitle>
            <CardDescription>Selecione o colaborador, o novo local desejado e justifique o motivo da mudança.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="font-semibold">Colaborador</Label>
              <SearchableSelect
                id="employeeId"
                options={employeeOptions}
                value={formData.employeeId}
                onChange={handleEmployeeChange}
                placeholder={isDataLoading ? "Carregando..." : "Selecione um colaborador"}
                disabled={isDataLoading}
              />
            </div>
            
            {selectedEmployee && (
              <div className="p-4 border rounded-md bg-muted/40 space-y-4">
                <h3 className="text-md font-semibold mb-2">Detalhes da Troca</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <Label>Local de Trabalho Atual</Label>
                    <Input value={selectedEmployee.workLocation?.name || 'Não definido'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newWorkLocationId" className="required">Local de Trabalho Desejado</Label>
                    <Select onValueChange={(value) => handleChange('newWorkLocationId', value)} value={formData.newWorkLocationId} disabled={!selectedEmployee} required>
                        <SelectTrigger id="newWorkLocationId">
                            <SelectValue placeholder="Selecione o novo local" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWorkLocations.length > 0 ? (
                            availableWorkLocations.map(loc => (<SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>))
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">Nenhum outro local disponível.</div>
                          )}
                        </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <Separator />
            
            <div className="space-y-2">
                <Label htmlFor="suggestedDate">Data Sugerida para Mudança (Opcional)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button id="suggestedDate" variant={"outline"} className={cn("w-full sm:w-[280px] justify-start text-left font-normal", !formData.suggestedDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.suggestedDate ? format(formData.suggestedDate, "dd 'de' LLLL 'de' yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={formData.suggestedDate} onSelect={(date) => handleChange('suggestedDate', date)} initialFocus locale={ptBR} />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="font-semibold required">Motivo / Justificativa</Label>
              <Textarea 
                id="reason" 
                value={formData.reason} 
                onChange={(e) => handleChange('reason', e.target.value)} 
                placeholder="Descreva detalhadamente o motivo para a solicitação de troca de local..."
                required 
                rows={5}
              />
            </div>
            
            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <Button variant="outline" type="button" onClick={() => router.push('/solicitacoes')} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || isDataLoading}>
                  {(isSubmitting || isDataLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Enviando..." : (isDataLoading ? "Carregando Dados..." : "Enviar Solicitação")}
                </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}