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
  },
  {
    // Acessa o nome do contrato dentro do objeto aninhado 'contract'
    accessorFn: row => row.contract?.name,
    id: "contract",
    header: "Contrato",
  },
  {
    accessorKey: "address",
    header: "Endereço",
    cell: ({ row }) => row.getValue("address") || "-", // Exibe '-' se o endereço for nulo
  },
]