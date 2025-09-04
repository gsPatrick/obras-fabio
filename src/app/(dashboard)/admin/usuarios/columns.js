"use client"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"

export const columns = [
  { accessorKey: "name", header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nome <ArrowUpDown className="ml-2 h-4 w-4" /></Button>), },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Telefone", cell: ({ row }) => row.getValue("phone") || "-" },
  { accessorKey: "profile", header: "Perfil", cell: ({ row }) => <Badge variant="secondary">{row.getValue("profile")}</Badge> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      const status = isActive ? "Ativo" : "Inativo";
      const variant = isActive ? "default" : "secondary";
      return <Badge variant={variant} className={isActive ? "bg-green-100 text-green-800" : ""}>{status}</Badge>
    }
  },
]