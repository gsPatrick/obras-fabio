"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Checkbox } from "../../../components/ui/checkbox"
import { format } from "date-fns"

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { 
    accessorKey: "cpf",
    header: "CPF" 
  },
  { 
    accessorKey: "registration",
    header: "Matrícula" 
  },
  { 
    accessorKey: "admissionDate",
    header: "Data de Admissão",
    cell: ({ row }) => {
        const date = row.getValue("admissionDate");
        return date ? format(new Date(date), "dd/MM/yyyy") : "-";
    }
  },
  { 
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => row.getValue("category") || "-",
  },
  { 
    accessorFn: row => row.position?.name,
    id: 'position',
    header: "Cargo" 
  },
  { 
    accessorFn: row => row.contract?.name,
    id: 'contract',
    header: "Contrato" 
  },
  { 
    accessorFn: row => row.workLocation?.name,
    id: 'workLocation',
    header: "Local de Trabalho" 
  },
]