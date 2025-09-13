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
import { Checkbox } from '../../../../components/ui/checkbox';
import { MultiSelect } from '../../configuracoes/alocacao-transicoes/multi-select';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Separator } from '../../../../components/ui/separator';

// Mapeia quais permissões precisam de qual tipo de escopo para renderizar o seletor correto
const PERMISSION_SCOPES = {
  'requests:read:company': 'COMPANY',
  'reports:view': 'CONTRACT',
  'dashboard:view': 'COMPANY',
  'contracts:read': 'COMPANY',
  'work-locations:read': 'COMPANY',
  'employees:read': 'COMPANY',
};

export function FormDialog({ open, onOpenChange, initialData, onSave }) {
  const isEditing = Boolean(initialData);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', profile: '', password: '', isActive: true });
  
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [scopeData, setScopeData] = useState({ COMPANY: [], CONTRACT: [] });

  useEffect(() => {
    const fetchFormData = async () => {
      if (open) {
        setIsPermissionsLoading(true);
        try {
          const [permsRes, companiesRes, contractsRes] = await Promise.all([
            api.get('/associations/permissions'),
            api.get('/companies?all=true'),
            api.get('/contracts?all=true')
          ]);

          setAllPermissions(permsRes.data || []);
          setScopeData({
            COMPANY: companiesRes.data.companies.map(c => ({ value: c.id, label: c.tradeName })) || [],
            CONTRACT: contractsRes.data.contracts.map(c => ({ value: c.id, label: c.name })) || [],
          });
          
          if (isEditing && initialData.id) {
            setFormData({ name: initialData.name || '', email: initialData.email || '', phone: initialData.phone || '', profile: initialData.profile || '', password: '', isActive: initialData.isActive });
            const userPermsRes = await api.get(`/associations/users/${initialData.id}/permissions`);
            setUserPermissions(userPermsRes.data || []);
          } else {
            setFormData({ name: '', email: '', phone: '', profile: 'SOLICITANTE', password: '', isActive: true });
            setUserPermissions([]);
          }
        } catch (error) {
          toast.error("Falha ao carregar dados de configuração. Verifique a API.");
          console.error("Erro ao buscar dados do formulário:", error);
        } finally {
          setIsPermissionsLoading(false);
        }
      }
    };
    fetchFormData();
  }, [open, initialData, isEditing]);

  const handleChange = (id, value) => setFormData(prev => ({ ...prev, [id]: value }));

  const handlePermissionChange = (permissionKey, isChecked) => {
    if (isChecked) {
      setUserPermissions(prev => [...prev, { permissionKey, scopeType: null, scopeId: null }]);
    } else {
      setUserPermissions(prev => prev.filter(p => p.permissionKey !== permissionKey));
    }
  };

  const handleScopeChange = (permissionKey, scopeType, selectedOptions) => {
    const otherPermissions = userPermissions.filter(p => p.permissionKey !== permissionKey);
    const newScopedPermissions = selectedOptions.map(option => ({
      permissionKey,
      scopeType,
      scopeId: option.value,
    }));

    if (newScopedPermissions.length === 0) {
        newScopedPermissions.push({ permissionKey, scopeType: null, scopeId: null });
    }
    setUserPermissions([...otherPermissions, ...newScopedPermissions]);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const basicPayload = { ...formData };
      if (!basicPayload.password) delete basicPayload.password;
      if (!basicPayload.phone) delete basicPayload.phone;
      const savedUser = await onSave(basicPayload);
  
      if (savedUser) {
        const finalPermissions = userPermissions.filter((p, index, self) => 
            p.scopeId !== null || 
            !self.some(other => other.permissionKey === p.permissionKey && other.scopeId !== null)
        );

        await api.put(`/associations/users/${savedUser.id}/permissions`, { permissions: finalPermissions });
        toast.success("Usuário e permissões salvos com sucesso!");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Ocorreu um erro ao salvar o usuário ou suas permissões.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderScopeSelector = (permission) => {
    const scopeType = PERMISSION_SCOPES[permission.key];
    if (!scopeType) return null;

    const isPermissionSelected = userPermissions.some(p => p.permissionKey === permission.key);
    if (!isPermissionSelected) return null;
    
    const selectedScopes = userPermissions
      .filter(p => p.permissionKey === permission.key && p.scopeId)
      .map(p => scopeData[p.scopeType]?.find(s => s.value === p.scopeId))
      .filter(Boolean);

    return (
      <div className="pl-8 mt-2 mb-3">
        <Label className="text-xs text-muted-foreground">Restringir a {scopeType === 'COMPANY' ? 'Clientes' : 'Contratos'}</Label>
        <MultiSelect
          options={scopeData[scopeType]}
          selected={selectedScopes}
          onChange={(newSelection) => handleScopeChange(permission.key, scopeType, newSelection)}
          placeholder="Acesso a todos (Padrão)"
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar" : "Novo"} Usuário</DialogTitle>
            <DialogDescription>Preencha os dados e defina as permissões de acesso do usuário.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* CAMPOS BÁSICOS DO USUÁRIO */}
            <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="phone">Telefone</Label><Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="profile">Perfil Principal</Label>
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

            {/* --- SEÇÃO DE PERMISSÕES (MOVIDA PARA CIMA E COM DIAGNÓSTICO) --- */}
            <Separator className="my-2" />
            <div className="space-y-2">
              <Label className="text-base font-semibold">Permissões de Acesso</Label>
              {isPermissionsLoading ? <Skeleton className="h-40 w-full"/> : (
                <div className="space-y-1 rounded-md border p-4 max-h-64 overflow-y-auto">
                  {allPermissions.length > 0 ? (
                    allPermissions.map(permission => (
                      <div key={permission.key}>
                        <div className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={permission.key}
                            checked={userPermissions.some(p => p.permissionKey === permission.key)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                          />
                          <label htmlFor={permission.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {permission.description}
                          </label>
                        </div>
                        {renderScopeSelector(permission)}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma permissão encontrada. Verifique se a API está respondendo corretamente em `/api/associations/permissions`.
                    </p>
                  )}
                </div>
              )}
            </div>
            <Separator className="my-2" />
            {/* --- FIM DA SEÇÃO DE PERMISSÕES --- */}
            
            <div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} placeholder={isEditing ? "Deixe em branco para não alterar" : ""} required={!isEditing} /></div>
            <div className="flex items-center space-x-2 pt-2"><Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleChange('isActive', checked)} /><Label htmlFor="isActive">Usuário Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || isPermissionsLoading}>{(isLoading || isPermissionsLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}