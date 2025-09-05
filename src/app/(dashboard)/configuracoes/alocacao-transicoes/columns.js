"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { MultiSelect } from "./multi-select"

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
      // --- CORREÇÃO APLICADA AQUI ---
      // O valor do select será o override ou 'default' se for nulo.
      const selectedValue = currentStep.profileOverride || 'default';

      const handleValueChange = (newValue) => {
        // Se o usuário selecionar 'default', enviamos null para a API.
        const valueToUpdate = newValue === 'default' ? null : newValue;
        onUpdate(currentStep.id, 'profileOverride', valueToUpdate);
      };

      return (
        <Select 
            value={selectedValue}
            onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-[180px]">
            {/* O SelectValue agora exibe o valor selecionado ou o placeholder */}
            <SelectValue placeholder={`Padrão (${currentStep.defaultProfile})`} />
          </SelectTrigger>
          <SelectContent>
            {/* O item "Padrão" agora tem um valor não-vazio */}
            <SelectItem value="default">Padrão ({currentStep.defaultProfile})</SelectItem>
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
      const options = allSteps
        .filter(step => step.id !== currentStep.id)
        .map(step => ({ value: step.id, label: step.name }));
      
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
