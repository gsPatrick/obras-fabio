"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"

export const columnsCargos = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome do Cargo <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("description") || "-"}</div>
  },
]