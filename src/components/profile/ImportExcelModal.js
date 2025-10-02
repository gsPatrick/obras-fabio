// components/profile/ImportExcelModal.js
'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function ImportExcelModal({ open, profileId, profileName, onClose, onSkip }) {
    const [file, setFile] = useState(null);
    const [stage, setStage] = useState('prompt'); // 'prompt' | 'uploading' | 'processing' | 'result'
    const [uploadProgress, setUploadProgress] = useState(0);
    const [resultMessage, setResultMessage] = useState('');
    const [resultError, setResultError] = useState('');
    const [importData, setImportData] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStage('uploading');
        setResultError('');
        setResultMessage('');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            // CRÍTICO: A rota de importação exige o profileId no Header
            // Como esta é a primeira vez, precisamos SETAR o ID no cliente API, ou o middleware vai falhar.
            // Para simplificar, faremos o POST diretamente aqui, mas o ideal seria setar e desnecessitar o X-Profile-Id nessa rota.
            // Vamos usar a lógica do Header, garantindo que o profileId esteja setado no `api.js` antes de chamar este modal.
            // Por enquanto, vou forçar o header aqui já que estamos em um fluxo isolado.
            
            // Simula o progresso
            const uploadInterval = setInterval(() => {
                setUploadProgress(prev => (prev < 90 ? prev + 5 : 90));
            }, 500);
            
            setStage('processing');
            const response = await api.post('/import/excel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Precisa garantir que o X-Profile-Id esteja no header
                    'X-Profile-Id': profileId // A API exige isso!
                },
                onUploadProgress: (progressEvent) => {
                    // Calculo de progresso não é simples para este cenário, manteremos o mock.
                    // const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    // setUploadProgress(percentCompleted);
                }
            });
            
            clearInterval(uploadInterval);
            setUploadProgress(100);
            
            setResultMessage(response.data.message);
            setImportData(response.data.data);
            setStage('result');

        } catch (err) {
            clearInterval(uploadInterval);
            setResultError(err.response?.data?.error || "Erro desconhecido ao processar a planilha.");
            setStage('result');
        }
    };

    const renderContent = () => {
        switch (stage) {
            case 'prompt':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Importação Inicial de Custos para {profileName}</DialogTitle>
                            <DialogDescription>
                                Se você tem uma planilha com custos passados, a IA pode analisar sua estrutura e importar os dados automaticamente!
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                A planilha deve conter colunas de **Valor, Data, Descrição e Categoria**. A IA é flexível e tentará identificar as colunas por conta própria.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="excel-file">Selecione o arquivo XLSX/CSV</Label>
                                <Input 
                                    id="excel-file" 
                                    type="file" 
                                    accept=".xlsx,.xls,.csv" 
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={onSkip}>Pular Importação</Button>
                            <Button onClick={handleUpload} disabled={!file || !profileId}>
                                <Upload className="h-4 w-4 mr-2" />
                                {file ? `Analisar ${file.name}` : 'Aguardando Arquivo'}
                            </Button>
                        </DialogFooter>
                    </>
                );
            case 'uploading':
            case 'processing':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Analisando Planilha...</DialogTitle>
                            <DialogDescription>
                                A inteligência artificial está lendo a estrutura da sua planilha e extraindo os dados. Isso pode levar alguns segundos.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-8 space-y-4">
                            <Progress value={uploadProgress} className="w-full" />
                            <p className="text-center text-sm font-medium">{uploadProgress < 100 ? 'Processando dados...' : 'Finalizando'}</p>
                        </div>
                        <DialogFooter>
                            <Button disabled>Aguarde...</Button>
                        </DialogFooter>
                    </>
                );
            case 'result':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {resultError ? <XCircle className="h-6 w-6 text-red-500" /> : <CheckCircle className="h-6 w-6 text-green-500" />}
                                {resultError ? 'Falha na Importação' : 'Importação Concluída!'}
                            </DialogTitle>
                            <DialogDescription>
                                {resultError ? resultError : resultMessage}
                            </DialogDescription>
                        </DialogHeader>
                        {importData && !resultError && (
                            <div className="py-4 space-y-2 text-sm text-muted-foreground">
                                <p>Total de despesas importadas: <span className="font-bold">{importData.count}</span></p>
                                <p>Período: {importData.firstExpenseDate} até {importData.lastExpenseDate}</p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={onClose}>Ir para o Dashboard</Button>
                        </DialogFooter>
                    </>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o && stage !== 'processing') onClose(); }}>
            <DialogContent className="sm:max-w-lg">
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}