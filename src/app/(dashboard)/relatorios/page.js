"use client"

import { Calendar as CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import * as React from "react"
import { toast } from "sonner"
import api from "../../../lib/api"
import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
import { Calendar } from "../../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { OverviewChart } from "./components/overview-chart"
import { Skeleton } from "../../../components/ui/skeleton"

export default function RelatoriosPage() {
    const [date, setDate] = React.useState({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() });
    
    const [selectedCompany, setSelectedCompany] = React.useState('');
    const [selectedContract, setSelectedContract] = React.useState('');
    
    const [companies, setCompanies] = React.useState([]);
    const [contracts, setContracts] = React.useState([]);
    
    const [stats, setStats] = React.useState(null);
    const [overviewData, setOverviewData] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await api.get('/companies');
                setCompanies(response.data.companies || []);
            } catch (error) { toast.error("Falha ao carregar lista de empresas."); }
        };
        fetchCompanies();
    }, []);

    React.useEffect(() => {
        const fetchContracts = async () => {
          if (selectedCompany) {
            setContracts([]);
            setSelectedContract('');
            try {
              const response = await api.get(`/contracts?companyId=${selectedCompany}`);
              setContracts(response.data.contracts || []);
            } catch (error) { toast.error("Falha ao carregar contratos."); }
          } else {
            setContracts([]);
            setSelectedContract('');
          }
        };
        fetchContracts();
    }, [selectedCompany]);

    React.useEffect(() => {
        const fetchReportData = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (date?.from) params.append('startDate', date.from.toISOString());
                if (date?.to) params.append('endDate', date.to.toISOString());
                if (selectedCompany) params.append('companyId', selectedCompany);
                if (selectedContract) params.append('contractId', selectedContract);

                const [statsRes, overviewRes] = await Promise.all([
                    api.get('/reports/stats', { params }),
                    api.get('/reports/hiring-overview', { params })
                ]);
                setStats(statsRes.data);
                setOverviewData(overviewRes.data);
            } catch (error) {
                toast.error("Falha ao carregar dados dos relatórios.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReportData();
    }, [date, selectedCompany, selectedContract]);


  return (
    <div className="container mx-auto py-2">
      <div className="mb-6"><h1 className="text-3xl font-bold">Relatórios e Métricas</h1><p className="text-muted-foreground mt-1">Filtre e analise os dados da sua organização.</p></div>
      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            <Popover>
              <PopoverTrigger asChild><Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))) : (<span>Escolha um período</span>)}</Button></PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} /></PopoverContent>
            </Popover>
            {/* --- CORREÇÃO APLICADA AQUI --- */}
            <Select onValueChange={(value) => setSelectedCompany(value === 'all' ? '' : value)} value={selectedCompany}>
                <SelectTrigger><SelectValue placeholder="Filtrar por Cliente" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Clientes</SelectItem>
                    {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.corporateName}</SelectItem>)}
                </SelectContent>
            </Select>
            {/* --- E AQUI --- */}
            <Select onValueChange={(value) => setSelectedContract(value === 'all' ? '' : value)} value={selectedContract} disabled={!selectedCompany}>
                <SelectTrigger><SelectValue placeholder="Filtrar por Contrato" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Contratos</SelectItem>
                    {contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button className="w-full" disabled><Download className="mr-2 h-4 w-4" />Exportar (Em breve)</Button>
        </CardContent>
      </Card>
      
      {isLoading ? <Skeleton className="h-24 w-full" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Admissões no Período</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">+{stats?.admissions || 0}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Desligamentos no Período</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">-{stats?.departures || 0}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Turnover</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.turnover || 0}%</div><p className="text-xs text-muted-foreground">Média do período</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Substituições</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">+{stats?.replacements || 0}</div></CardContent></Card>
        </div>
      )}

      <div className="mt-6">
        <Card>
            <CardHeader><CardTitle>Visão Geral de Contratações</CardTitle><CardDescription>Admissões concluídas no período selecionado.</CardDescription></CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-[350px] w-full" /> : <OverviewChart data={overviewData} />}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}