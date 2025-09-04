"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"

// A coluna de ações foi removida daqui
export const columnsDeps = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome do Departamento <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
  },
  {
    accessorKey: "manager",
    header: "Gestor Responsável",
  },
  {
    accessorKey: "employeeCount",
    header: "Nº de Colaboradores",
    cell: ({ row }) => <div className="text-center">{row.getValue("employeeCount")}</div>
  },
]