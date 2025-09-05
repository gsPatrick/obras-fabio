"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Users, UserPlus, UserMinus, Activity } from 'lucide-react';
import api from '../../../lib/api'; 

import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { DepartmentChart } from './components/department-chart';

function DashboardSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-40 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-full lg:col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="pl-2 space-y-4">
              <div className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-48" />
                </div>
              </div>
               <div className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full min-h-[150px]">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, activitiesRes, departmentRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-activities'),
          api.get('/dashboard/department-distribution')
        ]);

        setStats(statsRes.data);
        setActivities(activitiesRes.data);
        setDepartmentData(departmentRes.data);

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        toast.error("Não foi possível carregar os dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const iconMap = {
    totalCollaborators: Users,
    newAdmissions: UserPlus,
    departures: UserMinus,
    activityRate: Activity,
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">
            Métricas e atividades recentes da sua equipe.
          </p>
        </div>
        <Link href="/solicitacoes/nova">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {stats?.cards?.map((card) => {
          const Icon = iconMap[card.key] || Activity;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas admissões e movimentações no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-4 text-green-500"/>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[150px]">
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente para exibir.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
            <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>
                    Visualização da quantidade de colaboradores por categoria.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full min-h-[150px]">
                {departmentData.length > 0 ? (
                    <DepartmentChart data={departmentData} />
                ) : (
                    <p className="text-sm text-muted-foreground">Não há dados suficientes para exibir o gráfico.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </>
  );
}