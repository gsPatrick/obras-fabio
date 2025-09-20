"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"

export const columns = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome da Categoria/Cargo <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    filterFn: 'includesString', // Habilita filtro
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => row.getValue("description") || "-",
    filterFn: 'includesString', // Habilita filtro
  },
]