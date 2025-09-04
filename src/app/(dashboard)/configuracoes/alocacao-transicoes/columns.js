"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { MultiSelect } from "./multi-select"

// Esta função gera as colunas dinamicamente, pois precisa da lista de todas as etapas
// e da função de atualização do componente pai.
export const getColumns = (allSteps, onUpdate) => [
  {
    accessorKey: "order",
    header: "#",
    cell: ({ row }) => <div className="font-bold">{row.original.order}</div>,
  },
  {
    accessorKey: "name",
    header: "Nome da Etapa",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "profileOverride",
    header: "Perfil Responsável (Override)",
    cell: ({ row }) => {
      const currentStep = row.original;
      return (
        <Select 
            // O valor é o override, ou uma string vazia para usar o padrão
            value={currentStep.profileOverride || ''}
            onValueChange={(newValue) => onUpdate(currentStep.id, 'profileOverride', newValue || null)} // Envia nulo se "Padrão" for selecionado
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Padrão" />
          </SelectTrigger>
          <SelectContent>
            {/* A primeira opção sempre reseta para o padrão */}
            <SelectItem value="">Padrão ({currentStep.defaultProfile})</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="RH">RH</SelectItem>
            <SelectItem value="GESTAO">Gestão</SelectItem>
            <SelectItem value="SOLICITANTE">Solicitante</SelectItem>
          </SelectContent>
        </Select>
      )
    },
  },
  {
    accessorKey: "allowedNextStepIds",
    header: "Próximas Etapas Possíveis",
    cell: ({ row }) => {
      const currentStep = row.original;
      // Opções para o MultiSelect são todas as etapas, exceto a própria etapa
      const options = allSteps
        .filter(step => step.id !== currentStep.id)
        .map(step => ({ value: step.id, label: step.name }));
      
      // Encontra os objetos completos das etapas selecionadas com base nos IDs
      const selected = (currentStep.allowedNextStepIds || []).map(stepId => 
        options.find(opt => opt.value === stepId)
      ).filter(Boolean);

      return (
        <MultiSelect 
            options={options} 
            selected={selected}
            onChange={(newSelection) => onUpdate(currentStep.id, 'allowedNextStepIds', newSelection.map(s => s.value))}
            className="w-[300px]"
            placeholder="Qualquer etapa (Padrão)"
        />
      )
    },
  },
]