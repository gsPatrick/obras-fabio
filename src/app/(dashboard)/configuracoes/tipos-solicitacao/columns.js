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
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
  },
  {
    accessorKey: "description",
    header: "Descrição",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status")
        const variant = status === "Ativo" ? "default" : "secondary"
        return <Badge variant={variant} className={status === "Ativo" ? "bg-green-100 text-green-800" : ""}>{status}</Badge>
    }
  },
]