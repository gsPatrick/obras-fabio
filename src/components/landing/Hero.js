// components/landing/Hero.js
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Bot, ArrowLeft, Phone, Video } from 'lucide-react';
import React from 'react';

// Componente da simulação do celular
const ProductVisual = () => (
    <div className="relative mt-12 lg:mt-0 lg:col-span-6 flex justify-center">
        {/* Mockup do Celular (sem a classe 'lg:rotate-3') */}
        <div className="relative w-80 h-[600px] bg-gray-800 dark:bg-black rounded-[2.5rem] border-4 border-gray-600 dark:border-gray-700 shadow-2xl">
            {/* Notch da Câmera */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 dark:bg-black rounded-b-lg z-10"></div>

            {/* Tela do Celular */}
            <div className="absolute inset-1.5 bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden flex flex-col">
                {/* Cabeçalho do WhatsApp */}
                <header className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <div className="flex items-center justify-center h-9 w-9 bg-blue-200 dark:bg-blue-900 rounded-full">
                            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-white">Grupo da Obra</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">você, Mestre João, IA...</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Video className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <Phone className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                </header>

                {/* Corpo do Chat */}
                <main className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 bg-gray-50 dark:bg-gray-950/80">
                    {/* Mensagem do Usuário (PDF) */}
                    <div className="self-end max-w-[75%]">
                        <div className="bg-green-100 dark:bg-green-900/60 rounded-lg rounded-tr-none p-2 flex items-center gap-2 shadow-sm">
                            <div className="flex items-center justify-center h-10 w-10 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-gray-800 dark:text-gray-100">comprovante_01.pdf</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">1 página • PDF</p>
                            </div>
                        </div>
                    </div>

                    {/* Mensagem do Usuário (Texto) */}
                     <div className="self-end max-w-[75%]">
                        <div className="bg-green-100 dark:bg-green-900/60 rounded-lg rounded-tr-none p-3 shadow-sm">
                            <p className="text-sm text-gray-800 dark:text-gray-100">
                                Pagamento de R$ 450,80 para a fiação da sala 3.
                            </p>
                        </div>
                    </div>

                    {/* Bot "digitando" */}
                    <div className="self-start">
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg rounded-tl-none p-3 shadow-sm inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>

                    {/* Resposta da IA */}
                    <div className="self-start max-w-[85%]">
                        <div className="bg-white dark:bg-gray-800 rounded-lg rounded-tl-none p-3 shadow-md border border-gray-200/50 dark:border-gray-700/50">
                            <p className="font-bold text-sm text-green-600 dark:text-green-400 mb-2">✅ Despesa registrada com sucesso!</p>
                            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200 border-l-2 border-blue-500 pl-3">
                                <p><span className="font-semibold">Descrição:</span> Pagamento da fiação da sala 3</p>
                                <p><span className="font-semibold">Valor:</span> R$ 450,80</p>
                                <p><span className="font-semibold">Categoria:</span> ⚡️ Material Elétrico</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>
);


export function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Fundo com gradiente */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-0 w-[100rem] h-[100rem] bg-gradient-to-br from-blue-100 via-white to-white dark:from-blue-950/50 dark:via-gray-950 dark:to-gray-950 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 items-center">
                {/* Conteúdo de Texto */}
                <div className="lg:col-span-6 text-center lg:text-left">
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Chega de planilhas. Controle os gastos da sua obra via{" "}
                        <span className="text-blue-600 dark:text-blue-500">WhatsApp</span>.
                    </h1>
                    <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
                        Sua equipe envia a foto do comprovante com um áudio ou texto. Nossa Inteligência Artificial cuida do resto, organizando tudo em um dashboard em tempo real.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        {/* Botão principal aponta para a seção de preços */}
                        <Button size="lg" asChild className="shadow-lg">
                            <Link href="#precos">
                                Ver planos e começar
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="#como-funciona">
                                Ver como funciona
                            </Link>
                        </Button>
                    </div>
                    {/* Removida a menção a "não precisa de cartão de crédito" */}
                </div>

                {/* Visual do Produto (Celular) */}
                <ProductVisual />
            </div>
        </section>
    );
}