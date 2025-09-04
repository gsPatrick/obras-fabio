import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { Workflow, FilePlus, ListTodo, Users } from "lucide-react";

const flowSections = [
    { title: "Tipos de Solicitação", description: "Crie e edite tipos como Admissão, Desligamento, etc.", icon: FilePlus },
    { title: "Etapas", description: "Gerencie o 'cardápio' de etapas possíveis para os fluxos.", icon: ListTodo },
    { title: "Montagem de Fluxos", description: "Associe sequências de etapas a cada tipo de solicitação.", icon: Workflow },
    { title: "Alocação por Perfil", description: "Defina qual perfil de usuário é responsável por cada etapa.", icon: Users },
]

export function FlowSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Fluxos</CardTitle>
        <CardDescription>
          Gerencie todos os aspectos do motor de fluxos de trabalho do sistema. Esta área é restrita a Administradores.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {flowSections.map((section, index) => (
            <div key={section.title}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <section.icon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-grow">
                        <h3 className="font-semibold">{section.title}</h3>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                    <Button variant="outline" className="w-full md:w-auto">Gerenciar</Button>
                </div>
                {index < flowSections.length - 1 && <Separator className="my-6" />}
            </div>
        ))}
      </CardContent>
    </Card>
  );
}