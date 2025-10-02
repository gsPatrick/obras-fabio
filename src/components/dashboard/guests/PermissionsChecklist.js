// components/dashboard/guests/PermissionsChecklist.js
'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Lista de permissões de ACESSO A MÓDULO solicitadas
const modulePermissions = [
    { name: 'can_access_dashboard', label: 'Dashboard (Visão Geral)' },
    { name: 'can_access_reports', label: 'Relatórios (e Exportação)' },
    { name: 'can_access_categories', label: 'Categorias (Visualizar/Gerenciar)' },
    { name: 'can_access_expenses', label: 'Despesas (Visão Detalhada/CRUD)' },
    // A permissão can_edit_or_delete_expense pode ser aninhada na can_access_expenses
];

export function PermissionsChecklist({ permissions, onPermissionChange, isEditing = false }) {
    
    // Converte o objeto de permissões para um formato mais fácil de manipular
    const initialPerms = permissions || {};
    
    const handleChange = (name, checked) => {
        // Lógica de dependência: A permissão 'can_access_expenses' implica o CRUD manual,
        // mas vamos tratar isso no backend/service. No frontend, apenas repassa.
        onPermissionChange(name, checked);
    };

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-sm">Permissões de Acesso ao Módulo:</h4>
            <div className="grid gap-3">
                {modulePermissions.map(field => (
                    <div key={field.name} className="flex items-start space-x-3">
                        <Checkbox 
                            id={field.name} 
                            checked={!!initialPerms[field.name]}
                            onCheckedChange={(checked) => handleChange(field.name, checked)}
                            // Permitimos a edição de categorias e despesas na página de convidados
                            // para que o dono possa remover esse acesso.
                            disabled={false} 
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={field.name} className="text-sm font-medium cursor-pointer">
                                {field.label}
                            </Label>
                        </div>
                    </div>
                ))}
                
                 <div className="border-t pt-3 mt-3">
                     <h4 className="font-semibold text-xs text-muted-foreground">Permissões Específicas (Não Editáveis aqui):</h4>
                     <p className="text-xs text-muted-foreground mt-1">Permissão para lançar via WhatsApp é sempre ATIVA para convidados.</p>
                 </div>
            </div>
        </div>
    );
}