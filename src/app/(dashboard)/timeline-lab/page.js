import { Clock } from 'lucide-react';
import { Timeline } from '../../../components/Timeline'; // Importando nosso novo componente
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card';

// Dados mockados, exatamente como na imagem do cliente
const mockTimelineData = [
  {
    title: "Solicitação Criada",
    date: "22/08/2025 14:57",
    description: "Gestor: Solicitação aberta pelo usuário.",
  },
  {
    title: "Em Análise pela Gestão",
    date: "22/08/2025 14:57",
    description: "Gestor: Promoção automática para análise.",
  },
  {
    title: "Aprovada pela Gestão",
    date: "22/08/2025 15:00",
    description: "Gestor: Candidato novo não possui histórico junto a empresa.",
  },
  {
    title: "Entrevista RH",
    date: "22/08/2025 15:18",
    description: "RH: Candidato não possui histórico junto a empresa.",
  },
  {
    title: "Prova RH",
    date: "27/08/2025 17:59",
    description: "RH: Apto",
  },
  {
    title: "Exame Médico RH",
    date: "27/08/2025 18:00",
    description: "RH: Candidata com pendencia de Título de eleitor, aguardando informação para passar para etapa de coleta.",
  },
];

export default function TimelineLabPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Laboratório da Timeline</h1>
        <p className="text-muted-foreground mt-1">
          Componente de timeline desenvolvido isoladamente para testes.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Timeline / Histórico da Solicitação</CardTitle>
        </CardHeader>
        <CardContent>
            <Timeline items={mockTimelineData} />
        </CardContent>
      </Card>
    </div>
  );
}