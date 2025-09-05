"use client"
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../../lib/api';
import { Button } from "../../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { MultiSelect } from '../../configuracoes/alocacao-transicoes/multi-select';

export function FormDialog({ open, onOpenChange, initialData, onSave }) {
  const isEditing = Boolean(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', profile: '', password: '', isActive: true });
  
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [isAssociationLoading, setIsAssociationLoading] = useState(false);

  const showCompanyAssociation = formData.profile === 'GESTAO' || formData.profile === 'SOLICITANTE';

  // --- LÓGICA DO useEffect SIMPLIFICADA E CORRIGIDA ---
  useEffect(() => {
    // Popula o formulário com dados iniciais ou reseta quando o modal abre
    if (open) {
      if (initialData) {
        setFormData({ name: initialData.name || '', email: initialData.email || '', phone: initialData.phone || '', profile: initialData.profile || '', password: '', isActive: initialData.isActive });
      } else {
        setFormData({ name: '', email: '', phone: '', profile: '', password: '', isActive: true });
      }
      // Sempre reseta as empresas selecionadas ao abrir o modal
      setSelectedCompanies([]);
    }
  }, [open, initialData]);

  // useEffect separado para lidar apenas com a busca de dados de associação
  useEffect(() => {
    const fetchAssociationData = async () => {
      // Condição para mostrar o campo de associação
      if (open && (formData.profile === 'GESTAO' || formData.profile === 'SOLICITANTE')) {
        setIsAssociationLoading(true);
        try {
          const companiesRes = await api.get('/companies');
          setAllCompanies(companiesRes.data.companies.map(c => ({ value: c.id, label: c.corporateName })) || []);

          // Se estiver editando um usuário que já tem associações, carrega-as
          if (isEditing && initialData.id) {
            const associatedRes = await api.get(`/associations/users/${initialData.id}/companies`);
            setSelectedCompanies(associatedRes.data.map(c => ({ value: c.id, label: c.corporateName })) || []);
          }
        } catch (error) {
          toast.error("Falha ao carregar dados de associação de empresas.");
        } finally {
          setIsAssociationLoading(false);
        }
      }
    };
    
    fetchAssociationData();
  }, [open, isEditing, initialData, formData.profile]); // Depende do perfil para ser reativado

  const handleChange = (id, value) => setFormData(prev => ({ ...prev, [id]: value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const payload = { ...formData };
    if (!payload.password) delete payload.password;
    if (!payload.phone) delete payload.phone;
    
    const savedUser = await onSave(payload);

    if (savedUser && showCompanyAssociation) {
        try {
            const companyIds = selectedCompanies.map(c => c.value);
            await api.post(`/associations/users/${savedUser.id}/companies`, { companyIds });
            toast.success("Associação de empresas salva com sucesso!");
        } catch (error) {
            toast.error("Houve um erro ao salvar a associação de empresas.");
        }
    }
    
    setIsLoading(false);
    if (savedUser) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar" : "Novo"} Usuário</DialogTitle>
            <DialogDescription>Preencha os dados do usuário do sistema.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="phone">Telefone</Label><Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="profile">Perfil</Label>
              <Select value={formData.profile} onValueChange={(value) => handleChange('profile', value)} required>
                <SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="RH">RH</SelectItem>
                  <SelectItem value="GESTAO">Gestão</SelectItem>
                  <SelectItem value="SOLICITANTE">Solicitante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showCompanyAssociation && (
              <div className="space-y-2">
                <Label htmlFor="companies">Empresas Associadas</Label>
                {isAssociationLoading ? <p className="text-sm text-muted-foreground">Carregando empresas...</p> : (
                  <MultiSelect
                    options={allCompanies}
                    selected={selectedCompanies}
                    onChange={setSelectedCompanies}
                    placeholder="Selecione as empresas..."
                  />
                )}
              </div>
            )}

            <div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} placeholder={isEditing ? "Deixe em branco para não alterar" : ""} required={!isEditing} /></div>
            <div className="flex items-center space-x-2 pt-2"><Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleChange('isActive', checked)} /><Label htmlFor="isActive">Usuário Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}