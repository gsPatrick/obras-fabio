"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"

export const columns = [
  {
    accessorKey: "corporateName", 
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Razão Social <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "tradeName",
    header: "Nome Fantasia",
  },
  {
    accessorKey: "cnpj",
    header: "CNPJ",
  },
  {
    // --- COLUNA ADICIONADA ---
    accessorKey: "address",
    header: "Endereço",
  },
]