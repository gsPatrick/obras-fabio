"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { format } from "date-fns"

// Componente auxiliar para o filtro
const Filter = ({ column, title }) => {
  const columnFilterValue = column.getFilterValue()

  return (
    <div className="flex flex-col gap-2">
      <span>{title}</span>
      <Input
        className="max-w-sm h-8"
        onChange={(e) => column.setFilterValue(e.target.value)}
        onClick={(e) => e.stopPropagation()} // Impede que o clique no input acione a ordenação
        placeholder={`Filtrar ${title}...`}
        value={columnFilterValue ?? ""}
      />
    </div>
  )
}

export const columns = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    // Adicionamos o filtro diretamente aqui para manter a ordenação
    filterFn: 'includesString',
  },
  { 
    accessorKey: "cpf",
    header: "CPF" ,
    filterFn: 'includesString',
  },
  { 
    accessorKey: "registration",
    header: "Matrícula",
    filterFn: 'includesString',
  },
  { 
    accessorKey: "admissionDate",
    header: "Data de Admissão",
    cell: ({ row }) => {
        const date = row.getValue("admissionDate");
        return date ? format(new Date(date), "dd/MM/yyyy") : "-";
    },
    filterFn: 'includesString',
  },
  { 
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => row.getValue("category") || "-",
    filterFn: 'includesString',
  },
  { 
    accessorFn: row => row.position?.name,
    id: 'position',
    header: "Cargo",
    filterFn: 'includesString',
  },
  { 
    accessorFn: row => row.contract?.name,
    id: 'contract',
    header: "Contrato",
    filterFn: 'includesString',
  },
  { 
    accessorFn: row => row.workLocation?.name,
    id: 'workLocation',
    header: "Local de Trabalho",
    filterFn: 'includesString',
  },
]