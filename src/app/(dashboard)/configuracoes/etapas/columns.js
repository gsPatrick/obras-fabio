"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"

export const columns = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome da Etapa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
  },
  {
    accessorKey: "defaultProfile",
    header: "Perfil Responsável Padrão",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("defaultProfile")}</Badge>
  },
  // A coluna de status foi removida pois não existe no novo modelo 'Step'
]