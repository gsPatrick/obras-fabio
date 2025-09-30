// components/landing/HowItWorks.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Mic, Bot, Play, CheckCircle } from 'lucide-react';

// === DADOS DOS PASSOS ===
const steps = [
  {
    icon: <Mic className="h-8 w-8" />,
    title: "1. Envie o Comprovante e o Áudio",
    description: "Sua equipe envia o PDF ou a foto do comprovante no grupo, junto com um áudio simples explicando o gasto.",
  },
  {
    icon: <Bot className="h-8 w-8" />,
    title: "2. A IA Processa em Tempo Real",
    description: "Nossa Inteligência Artificial analisa a imagem, transcreve o áudio e extrai os dados essenciais.",
  },
  {
    icon: <CheckCircle className="h-8 w-8" />,
    title: "3. Gasto Registrado Instantaneamente",
    description: "Em segundos, a IA responde confirmando o registro e a categoria. Seu dashboard é atualizado na mesma hora.",
  },
];

// === COMPONENTES DA SIMULAÇÃO (STATeless) ===
const UserMessagePDF = () => ( <div className="self-end max-w-[75%]"><div className="bg-green-100 dark:bg-green-900/60 rounded-lg rounded-tr-none p-2 flex items-center gap-2 shadow-sm"><div className="flex items-center justify-center h-10 w-10 bg-red-100 dark:bg-red-900/50 rounded-lg"><FileText className="h-6 w-6 text-red-600 dark:text-red-400" /></div><div><p className="font-medium text-sm text-gray-800 dark:text-gray-100">nota_cimento.pdf</p><p className="text-xs text-gray-600 dark:text-gray-300">1 página • PDF</p></div></div></div> );
const UserMessageAudio = () => ( <div className="self-end max-w-[75%] mt-2"><div className="bg-green-100 dark:bg-green-900/60 rounded-lg rounded-tr-none p-2 shadow-sm flex items-center gap-3"><Play className="h-6 w-6 text-gray-600 dark:text-gray-300" /><div className="flex items-center gap-0.5 h-6"><div className="w-0.5 h-2/5 bg-gray-400 rounded-full"></div><div className="w-0.5 h-3/5 bg-gray-400"></div><div className="w-0.5 h-4/5 bg-gray-400"></div><div className="w-0.5 h-3/5 bg-gray-400"></div><div className="w-0.5 h-full bg-gray-400"></div><div className="w-0.5 h-2/5 bg-gray-400"></div><div className="w-0.5 h-4/5 bg-gray-400"></div></div><span className="text-xs text-gray-600 dark:text-gray-400 ml-auto">0:07</span></div></div> );
const TypingIndicator = () => ( <div className="self-start mt-3"><div className="bg-gray-200 dark:bg-gray-800 rounded-lg rounded-tl-none p-3 shadow-sm inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span><span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span><span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span></div></div> );
const AIResponse = () => ( <div className="self-start max-w-[85%] mt-3"><div className="bg-white dark:bg-gray-800 rounded-lg rounded-tl-none p-3 shadow-md border border-gray-200/50 dark:border-gray-700/50"><p className="font-bold text-sm text-green-600 dark:text-green-400 mb-2">✅ Despesa registrada com sucesso!</p><div className="space-y-1 text-sm text-gray-700 dark:text-gray-200 border-l-2 border-blue-500 pl-3"><p><span className="font-semibold">Descrição:</span> Compra de 20 sacos de cimento</p><p><span className="font-semibold">Valor:</span> R$ 580,00</p><p><span className="font-semibold">Categoria:</span> 🧱 Material Básico</p></div></div></div> );


export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Efeito para detectar quando a seção entra na tela
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Roda só uma vez
        }
      },
      { threshold: 0.4 } // Começa quando 40% da seção estiver visível
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Efeito para controlar o ciclo da animação
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveStep(prevStep => (prevStep + 1) % steps.length);
      }, 3500); // Muda de passo a cada 3.5 segundos

      return () => clearInterval(interval); // Limpa o intervalo
    }
  }, [isVisible]);

  return (
    <section ref={sectionRef} id="como-funciona" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Tão fácil quanto mandar uma mensagem
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Veja como eliminamos a burocracia do controle de gastos da sua obra.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Coluna de Texto (Indicadores Visuais) */}
          <div className="flex flex-col gap-8">
            {steps.map((step, index) => (
              <div key={index} className={`p-6 rounded-xl transition-opacity duration-500 ${activeStep === index ? 'opacity-100' : 'opacity-50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center h-14 w-14 rounded-full shrink-0 transition-colors ${activeStep === index ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/50' : 'text-gray-500 bg-gray-200 dark:bg-gray-700'}`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                {/* Barra de Progresso Dinâmica */}
                <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-5 overflow-hidden">
                  {activeStep === index && (
                     <div key={activeStep} className="absolute top-0 left-0 h-full bg-blue-500 rounded-full w-0" style={{ animation: 'progress 3.5s linear forwards' }}></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Coluna do Celular (Simulação Automática) */}
          <div className="flex justify-center lg:h-[650px] items-center">
            <div className="relative w-80 h-[600px] bg-gray-800 dark:bg-black rounded-[2.5rem] border-4 border-gray-600 dark:border-gray-700 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 dark:bg-black rounded-b-lg z-10"></div>
              <div className="absolute inset-1.5 bg-gray-100 dark:bg-gray-950/80 rounded-[2rem] overflow-hidden">
                <div className="p-3 flex flex-col gap-2 h-full">
                  {/* Lógica de Renderização Baseada no Passo Ativo */}
                  {activeStep === 0 && ( <> <UserMessagePDF /> <UserMessageAudio /> </> )}
                  {activeStep === 1 && ( <> <UserMessagePDF /> <UserMessageAudio /> <TypingIndicator /> </> )}
                  {activeStep === 2 && ( <> <UserMessagePDF /> <UserMessageAudio /> <AIResponse /> </> )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}