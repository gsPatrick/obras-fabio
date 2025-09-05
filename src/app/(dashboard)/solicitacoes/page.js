"use client"

import * as React from "react"
import Link from "next/link"
import { PlusCircle, Calendar as CalendarIcon, Download, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import api from "../../../lib/api"
import { cn } from "../../../lib/utils"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Calendar } from "../../../components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Input } from "../../../components/ui/input"

export default function SolicitacoesPage() {
  const [filters, setFilters] = React.useState({
    companyId: '',
    contractId: '',
    date: null,
  });
  
  const [companies, setCompanies] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  // Estado para o filtro de texto gerenciado aqui
  const [columnFilters, setColumnFilters] = React.useState([]);

  React.useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/companies');
        setCompanies(response.data.companies || []);
      } catch (error) {
        toast.error("Falha ao carregar a lista de empresas.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  React.useEffect(() => {
    const fetchContracts = async () => {
      if (filters.companyId) {
        setIsLoading(true);
        setContracts([]);
        handleFilterChange('contractId', '');
        try {
          const response = await api.get(`/contracts?companyId=${filters.companyId}`);
          setContracts(response.data.contracts || []);
        } catch (error) {
          toast.error("Falha ao carregar contratos da empresa.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setContracts([]);
        handleFilterChange('contractId', '');
      }
    };
    fetchContracts();
  }, [filters.companyId]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    toast.info("A exportação foi iniciada. Aguarde...");
    try {
        const params = new URLSearchParams();
        if (filters.companyId) params.append('companyId', filters.companyId);
        if (filters.contractId) params.append('contractId', filters.contractId);
        if (filters.date?.from) params.append('startDate', filters.date.from.toISOString());
        if (filters.date?.to) params.append('endDate', filters.date.to.toISOString());
        const protocolFilter = columnFilters.find(f => f.id === 'protocol')?.value;
        if(protocolFilter) params.append('protocol', protocolFilter);
        
        const response = await api.get('/requests/export', {
            params,
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const filename = `solicitacoes-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Download do arquivo de solicitações concluído!");

    } catch (error) {
        toast.error("Falha ao exportar os dados.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Solicitações</h1>
          <p className="text-muted-foreground mt-1">
            Filtre e acompanhe o andamento de todas as solicitações.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                Exportar
            </Button>
            <Link href="/solicitacoes/nova">
              <Button><PlusCircle className="mr-2 h-4 w-4" />Nova Solicitação</Button>
            </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          <Select onValueChange={(value) => handleFilterChange('companyId', value === 'all' ? '' : value)} value={filters.companyId} disabled={isLoading}>
            <SelectTrigger><SelectValue placeholder="Filtrar por Cliente" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos os Clientes</SelectItem>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.corporateName}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={(value) => handleFilterChange('contractId', value === 'all' ? '' : value)} value={filters.contractId} disabled={isLoading || !filters.companyId}>
            <SelectTrigger><SelectValue placeholder="Filtrar por Contrato" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos os Contratos</SelectItem>{contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild><Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !filters.date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{filters.date?.from ? (filters.date.to ? (<>{format(filters.date.from, "LLL dd, y")} - {format(filters.date.to, "LLL dd, y")}</>) : (format(filters.date.from, "LLL dd, y"))) : (<span>Filtrar por Período</span>)}</Button></PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" selected={filters.date} onSelect={(date) => handleFilterChange('date', date)} numberOfMonths={2} /></PopoverContent>
          </Popover>
          <Input 
            placeholder="Filtrar por protocolo..."
            value={columnFilters.find(f => f.id === 'protocol')?.value || ''}
            onChange={(event) => setColumnFilters([{ id: 'protocol', value: event.target.value }])}
          />
        </CardContent>
      </Card>

      <DataTable columns={columns} filters={{...filters, columnFilters, setColumnFilters}} />
    </div>
  )
}