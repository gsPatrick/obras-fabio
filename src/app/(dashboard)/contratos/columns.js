"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { format } from "date-fns"

export const columns = [
  {
    accessorKey: "contractNumber", 
    header: "Número do Contrato",
    cell: ({ row }) => row.getValue("contractNumber") || "-",
    filterFn: 'includesString', // Habilita filtro
  },
  {
    accessorKey: "name",
    header: "Nome do Contrato",
    filterFn: 'includesString', // Habilita filtro
  },
  {
    accessorFn: row => row.company?.tradeName,
    id: "client",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Cliente <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: 'includesString', // Habilita filtro
  },
  {
    accessorKey: "startDate",
    header: "Data de Início",
    cell: ({ row }) => {
        const date = row.getValue("startDate");
        return date ? format(new Date(date), "dd/MM/yyyy") : "-";
    },
    filterFn: 'includesString', // Habilita filtro
  },
  {
    accessorKey: "endDate",
    header: "Data de Fim",
    cell: ({ row }) => {
        const date = row.getValue("endDate");
        return date ? format(new Date(date), "dd/MM/yyyy") : "-";
    },
    filterFn: 'includesString', // Habilita filtro
  },
]