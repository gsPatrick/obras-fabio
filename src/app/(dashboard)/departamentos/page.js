
import { columnsDeps } from "./columns-deps"
import { DataTableDeps } from "./data-table-deps"

// Dados mockados para simular a API de Departamentos
const mockData = [
  {
    id: "DEP001",
    name: "Recursos Humanos",
    manager: "Ana Silva",
    employeeCount: 8,
  },
  {
    id: "DEP002",
    name: "Tecnologia da Informação",
    manager: "Marcos Oliveira",
    employeeCount: 25,
  },
  {
    id: "DEP003",
    name: "Financeiro",
    manager: "Carlos Pereira",
    employeeCount: 12,
  },
  {
    id: "DEP004",
    name: "Marketing",
    manager: "Daniela Souza",
    employeeCount: 15,
  },
  {
    id: "DEP005",
    name: "Operações",
    manager: "Ricardo Almeida",
    employeeCount: 40,
  },
]

export default function DepartamentosPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Departamentos</h1>
        <p className="text-muted-foreground mt-1">
          Visualize, crie e gerencie os departamentos da sua organização.
        </p>
      </div>
      <DataTableDeps columns={columnsDeps} data={mockData} />
    </div>
  )
}