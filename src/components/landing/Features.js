'use client';




// components/landing/Features.js
import { Zap, Bot, LayoutDashboard, MessageCircle, Download, Tag } from 'lucide-react';
import React from 'react';

const features = [
  {
    icon: <MessageCircle />,
    name: "Integração Nativa com WhatsApp",
    description: "Sem aplicativos novos. Sua equipe continua usando a ferramenta que já domina, facilitando a adesão e o envio de dados.",
  },
  {
    icon: <Bot />,
    name: "IA para Análise de Áudio e Imagem",
    description: "Nossa tecnologia de ponta interpreta áudios e extrai dados de imagens, economizando tempo e evitando erros manuais de digitação.",
  },
  {
    icon: <LayoutDashboard />,
    name: "Dashboard em Tempo Real",
    description: "Acompanhe a saúde financeira da sua obra com gráficos intuitivos e KPIs atualizados instantaneamente a cada novo gasto registrado.",
  },
  {
    icon: <Zap />,
    name: "Relatórios via Comando no WhatsApp",
    description: "Peça um resumo de gastos diretamente no WhatsApp e receba um relatório na hora, onde você estiver.",
  },
  {
    icon: <Tag />,
    name: "Categorias Personalizáveis",
    description: "Crie e gerencie as categorias de custo que fazem sentido para a sua obra, adaptando o sistema perfeitamente à sua realidade.",
  },
  {
    icon: <Download />,
    name: "Exportação para Excel (CSV)",
    description: "Exporte todas as suas despesas com um clique, facilitando o fechamento contábil e a criação de relatórios personalizados.",
  },
];

const FeatureCard = ({ icon, name, description }) => (
  <div className="relative p-8 rounded-2xl bg-white dark:bg-gray-900/50 shadow-lg transition-transform duration-300 hover:-translate-y-2 group">
    {/* Efeito de borda gradiente no hover */}
    <div className="absolute inset-0 rounded-2xl border border-transparent 
                   group-hover:border-blue-500 transition-all duration-300">
    </div>
    
    {/* Efeito de brilho (glow) sutil no hover */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 
                   opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500">
    </div>

    <div className="relative z-10">
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-6 border-2 border-blue-200 dark:border-blue-800">
        {React.cloneElement(icon, { className: 'h-7 w-7 text-blue-600 dark:text-blue-400' })}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{name}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  </div>
);


export function Features() {
  return (
    <section id="recursos" className="relative py-20 lg:py-32 bg-white dark:bg-gray-950">
      {/* Fundo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2
                        bg-[radial-gradient(circle_at_center,_rgba(29,78,216,0.1)_0%,_rgba(29,78,216,0)_50%)]
                        dark:bg-[radial-gradient(circle_at_center,_rgba(29,78,216,0.2)_0%,_rgba(29,78,216,0)_40%)]">
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Uma plataforma completa para sua gestão
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Recursos pensados para a realidade da construção civil, focados em agilidade e precisão.
          </p>
        </div>

        {/* Grid de Recursos com os novos cards */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.name} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}