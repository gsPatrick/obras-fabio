"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"

export const columns = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Local de Trabalho <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: 'includesString', // Habilita filtro
  },
  {
    accessorFn: row => row.contract?.name,
    id: "contract",
    header: "Contrato",
    filterFn: 'includesString', // Habilita filtro
  },
  {
    accessorKey: "address",
    header: "Endereço",
    cell: ({ row }) => row.getValue("address") || "-",
    filterFn: 'includesString', // Habilita filtro
  },
]