"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { format } from "date-fns"

export const columns = [
  {
    accessorKey: "protocol",
    header: "Protocolo",
  },
  {
    // Acessa o nome do workflow através da associação
    accessorFn: row => row.workflow?.name,
    id: "type",
    header: "Tipo",
  },
  {
    accessorKey: "candidateName",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Candidato/Colaborador
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    // Exibe o nome do candidato (admissão) ou do funcionário (desligamento)
    cell: ({ row }) => row.original.candidateName || row.original.employee?.name || "-",
  },
  {
    accessorKey: "status",
    header: "Status Atual",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("status")}</Badge>
  },
  {
    accessorKey: "updatedAt",
    header: "Última Atualização",
    cell: ({ row }) => format(new Date(row.getValue("updatedAt")), "dd/MM/yyyy HH:mm"),
  },
]