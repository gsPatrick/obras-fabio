// components/profile/ImportOrDashboardModal.js (COMPLETAMENTE REVISADO)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportExcelModal } from '@/components/profile/ImportExcelModal';
import { useAuth } from '@/context/AuthContext'; 
import { setProfileId } from '@/lib/api'; // Para garantir que o profileId esteja no cliente Axios

export function ImportOrDashboardModal({ open, profileId, profileName, onClose }) {
    const router = useRouter();
    const [showImportModal, setShowImportModal] = useState(false);
    
    // --- FUNÇÃO DE ESCOLHA: CRIAR DO ZERO (Ou após Importação) ---
    const handleGoToOnboarding = () => {
        // Redireciona para a página de Onboarding, passando os dados
        router.push(`/profiles/onboarding?profileId=${profileId}&profileName=${profileName}`);
        // Se a navegação ocorreu, o modal principal fechará.
    };
    
    // --- FUNÇÃO DE ESCOLHA: IMPORTAR PLANILHA ---
    const handleOpenImport = () => {
        setShowImportModal(true);
    };

    // --- FUNÇÃO DE CONCLUSÃO DO FLUXO DE IMPORTAÇÃO ---
    // Chamada quando o usuário FECHA ou CONCLUI o ImportExcelModal
    const handleImportFlowComplete = () => {
        // Fecha o modal de importação
        setShowImportModal(false);
        
        // CRÍTICO: Após a importação, o usuário é redirecionado para o Onboarding
        // para configurar o WhatsApp e as Metas.
        handleGoToOnboarding(); 
    }
    
    // Configura o ID no cliente Axios TEMPORARIAMENTE para que as chamadas do modal interno funcionem
    // Embora o `manage/page.js` já o faça, é uma camada extra para garantir.
    useEffect(() => {
        if (open && profileId) {
            setProfileId(profileId);
        }
        return () => setProfileId(null);
    }, [open, profileId]);


    if (showImportModal) {
        // Se o usuário clicou em 'Importar Planilha', renderiza o modal de importação real
        return (
            <ImportExcelModal 
                open={true}
                profileId={profileId}
                profileName={profileName}
                // Ambos os handlers de fechar/pular do modal de importação levam à conclusão do fluxo.
                onClose={handleImportFlowComplete} 
                onSkip={handleImportFlowComplete} 
            />
        );
    }
    
    // Tela de Escolha Principal
    return (
        // O Dialog usa onClose (que é handleChoiceModalClose em manage/page.js)
        <Dialog open={open} onOpenChange={onClose}> 
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Parabéns, {profileName}!</DialogTitle>
                    <DialogDescription>
                        Seu novo perfil está pronto. Como você deseja começar a populá-lo?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {/* Opção 1: Importar Planilha */}
                    <Card 
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={handleOpenImport}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <FileText className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold text-lg">Importar Planilha</h3>
                            <p className="text-sm text-muted-foreground">Deixe a IA popular o seu perfil com dados antigos.</p>
                            <Button variant="secondary" className="mt-3">
                                Importar Agora
                            </Button>
                        </CardContent>
                    </Card>
                    
                    {/* Opção 2: Criar do Zero */}
                    <Card 
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={handleGoToOnboarding}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <Zap className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold text-lg">Criar do Zero</h3>
                            <p className="text-sm text-muted-foreground">Ir para o setup de monitoramento e metas.</p>
                            <Button variant="secondary" className="mt-3">
                                Configurar Agora
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter>
                    {/* Ações são nos cards */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}