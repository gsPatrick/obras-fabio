"use client" // Necessário para usar hooks

import Link from 'next/link';
import { UserPlus, UserMinus, Repeat } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { useAuth } from '../../../../hooks/useAuth'; // Importando nosso hook de autenticação
import { Skeleton } from '../../../../components/ui/skeleton';

// Agora, os tipos de solicitação têm uma propriedade 'profiles' para controle de acesso
const requestTypes = [
  {
    href: "/solicitacoes/nova/admissao",
    title: "Admissão",
    description: "Iniciar o processo para contratar um novo colaborador.",
    icon: UserPlus,
    profiles: ['ADMIN', 'RH', 'GESTAO', 'SOLICITANTE'], // Todos podem solicitar uma nova admissão
  },
  {
    href: "/solicitacoes/nova/desligamento",
    title: "Desligamento",
    description: "Formalizar o desligamento de um colaborador.",
    icon: UserMinus,
    profiles: ['ADMIN', 'RH', 'GESTAO'], // Apenas perfis internos podem desligar
  },
  {
    href: "/solicitacoes/nova/substituicao",
    title: "Substituição",
    description: "Solicitar a substituição de um colaborador existente.",
    icon: Repeat,
    profiles: ['ADMIN', 'RH', 'GESTAO'], // Apenas perfis internos podem substituir
  },
];

export default function NovaSolicitacaoPage() {
  const { user } = useAuth(); // Pega as informações do usuário logado

  // Se o usuário ainda não foi carregado, exibe um skeleton
  if (!user) {
    return (
        <div className="container mx-auto py-2">
            <div className="mb-8 text-center">
                <Skeleton className="h-8 w-64 mx-auto" />
                <Skeleton className="h-4 w-96 mx-auto mt-4" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    );
  }

  // Filtra os tipos de solicitação que o usuário atual tem permissão para ver
  const availableRequestTypes = requestTypes.filter(type => type.profiles.includes(user.profile));

  return (
    <div className="container mx-auto py-2">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Nova Solicitação</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Selecione o tipo de solicitação que deseja iniciar. Cada processo seguirá um fluxo específico definido pelo RH.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
        {availableRequestTypes.map((type) => (
          <Link href={type.href} key={type.title}>
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <type.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{type.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{type.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}