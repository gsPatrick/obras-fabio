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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { Textarea } from "../../../../../components/ui/textarea";

export default function FormAdmissaoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();

  const [companies, setCompanies] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [positions, setPositions] = useState([]);
  
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedContract, setSelectedContract] = useState('');

  const [formData, setFormData] = useState({
    companyId: '', contractId: '', workLocationId: '', positionId: '',
    candidateName: '', candidateCpf: '', candidatePhone: '', reason: '',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsDataLoading(true);
      try {
        const [companiesRes, positionsRes] = await Promise.all([
          api.get('/companies'),
          api.get('/positions')
        ]);
        setCompanies(companiesRes.data.companies || []);
        setPositions(positionsRes.data.positions || []);
      } catch (error) { toast.error("Falha ao carregar dados de apoio."); } 
      finally { setIsDataLoading(false); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      if (selectedCompany) {
        setIsDataLoading(true);
        setContracts([]); handleChange('contractId', '');
        try {
          const response = await api.get(`/contracts?companyId=${selectedCompany}`);
          setContracts(response.data.contracts || []);
        } catch (error) { toast.error("Falha ao carregar contratos da empresa."); } 
        finally { setIsDataLoading(false); }
      } else {
        setContracts([]); handleChange('contractId', '');
      }
    };
    fetchContracts();
  }, [selectedCompany]);

  useEffect(() => {
    const fetchWorkLocations = async () => {
      if (selectedContract) {
        setIsDataLoading(true);
        setWorkLocations([]); handleChange('workLocationId', '');
        try {
          const response = await api.get(`/work-locations?contractId=${selectedContract}`);
          setWorkLocations(response.data.workLocations || []);
        } catch (error) { toast.error("Falha ao carregar locais de trabalho."); } 
        finally { setIsDataLoading(false); }
      } else {
        setWorkLocations([]); handleChange('workLocationId', '');
      }
    };
    fetchWorkLocations();
  }, [selectedContract]);

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/requests/admission', formData);
      toast.success("Solicitação de admissão enviada com sucesso!");
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
        <CardHeader>
          <CardTitle className="text-2xl">Formulário de Admissão</CardTitle>
          <CardDescription>Preencha os dados para iniciar o processo de contratação.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label htmlFor="candidateName">Nome do Candidato</Label><Input id="candidateName" value={formData.candidateName} onChange={(e) => handleChange('candidateName', e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="candidateCpf">CPF do Candidato</Label><Input id="candidateCpf" value={formData.candidateCpf} onChange={(e) => handleChange('candidateCpf', e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="candidatePhone">Telefone do Candidato</Label><Input id="candidatePhone" value={formData.candidatePhone} onChange={(e) => handleChange('candidatePhone', e.target.value)} required /></div>
            <div className="space-y-2">
              <Label htmlFor="companyId">Empresa</Label>
              <Select value={selectedCompany} onValueChange={(value) => { setSelectedCompany(value); handleChange('companyId', value); }} disabled={isDataLoading} required>
                <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.corporateName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="contractId">Contrato</Label>
                    <Select value={selectedContract} onValueChange={(value) => { setSelectedContract(value); handleChange('contractId', value); }} disabled={!selectedCompany || isDataLoading} required>
                        <SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
                        <SelectContent>{contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="workLocationId">Local de Trabalho</Label>
                    <Select value={formData.workLocationId} onValueChange={(value) => handleChange('workLocationId', value)} disabled={!selectedContract || isDataLoading} required>
                        <SelectTrigger><SelectValue placeholder="Selecione o local" /></SelectTrigger>
                        <SelectContent>{workLocations.map(wl => <SelectItem key={wl.id} value={wl.id}>{wl.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="positionId">Cargo</Label>
                <Select value={formData.positionId} onValueChange={(value) => handleChange('positionId', value)} disabled={isDataLoading} required>
                    <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
                    <SelectContent>{positions.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2"><Label htmlFor="reason">Motivo / Justificativa</Label><Textarea id="reason" value={formData.reason} onChange={(e) => handleChange('reason', e.target.value)} required /></div>
            <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" type="button" onClick={() => router.push('/solicitacoes/nova')} disabled={isLoading}>Cancelar</Button>
                <Button type="submit" disabled={isLoading || isDataLoading}>
                    {(isLoading || isDataLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Enviando..." : (isDataLoading ? "Carregando..." : "Enviar Solicitação")}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}