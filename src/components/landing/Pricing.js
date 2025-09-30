// components/landing/Pricing.js
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const plans = [
  {
    name: "Essencial",
    price: "R$ 97",
    isMostPopular: false,
    description: "Ideal para equipes pequenas e obras de menor porte.",
    features: [
      "Até 5 usuários",
      "Lançamentos ilimitados via WhatsApp",
      "Dashboard de análise",
      "Relatórios de custos",
      "Suporte via e-mail",
    ],
    cta: "Assinar Plano Essencial",
    href: "/subscribe?plan=essential" // Link para o checkout
  },
  {
    name: "Profissional",
    price: "R$ 197",
    isMostPopular: true,
    description: "Perfeito para construtoras e gestão de múltiplas obras.",
    features: [
      "Usuários ilimitados",
      "Lançamentos ilimitados via WhatsApp",
      "Dashboard avançado com filtros",
      "Relatórios e exportação (CSV)",
      "Suporte prioritário via WhatsApp",
      "Gestão de múltiplos projetos (em breve)",
    ],
    cta: "Assinar Plano Profissional",
    href: "/subscribe?plan=professional" // Link para o checkout
  },
];

const faqs = [
    {
        question: "Preciso de um aplicativo para usar o sistema?",
        answer: "Não! A grande vantagem do Obra.AI é que toda a interação da sua equipe de campo é feita diretamente pelo WhatsApp, um aplicativo que todos já usam. O gestor acessa o dashboard completo pelo navegador de qualquer dispositivo."
    },
    {
        question: "Como funciona o pagamento?",
        answer: "O pagamento é feito por assinatura mensal através de cartão de crédito. É um processo seguro e você pode cancelar a qualquer momento, sem burocracia."
    },
    {
        question: "A IA entende qualquer tipo de áudio ou comprovante?",
        answer: "Nossa IA é treinada para entender português brasileiro com diferentes sotaques e para reconhecer os formatos mais comuns de notas fiscais e comprovantes. A precisão é altíssima, mas caso algo não seja identificado, o sistema notifica para uma revisão manual rápida."
    },
    {
        question: "Meus dados estão seguros?",
        answer: "Sim. Levamos a segurança muito a sério. Seus dados são criptografados e armazenados em servidores seguros, seguindo as melhores práticas de mercado."
    }
];


export function Pricing() {
  return (
    <section id="precos" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Um plano transparente para o seu crescimento
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Escolha a opção que se encaixa no tamanho da sua operação. Sem taxas escondidas.
          </p>
        </div>

        {/* Cards de Preço */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative p-8 rounded-2xl shadow-xl border ${plan.isMostPopular ? 'border-blue-500 bg-white dark:bg-gray-900' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
              {plan.isMostPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wider text-white bg-blue-600">
                        MAIS POPULAR
                    </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{plan.description}</p>
              
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-lg font-medium text-gray-500 dark:text-gray-400">/mês</span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-6 w-6 text-blue-500 shrink-0 mr-3 mt-1" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" className={`w-full mt-10 ${plan.isMostPopular ? '' : 'bg-gray-800 hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300'}`} asChild>
                {/* O link agora leva para uma futura página de inscrição/checkout */}
                <Link href={plan.href}>{plan.cta} <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Seção de FAQ */}
        <div className="mt-24 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Dúvidas Frequentes</h3>
            <div className="mt-8 space-y-4">
                {faqs.map((faq, index) => (
                    <details key={index} className="group p-6 rounded-lg bg-white dark:bg-gray-800/50 shadow-sm cursor-pointer">
                        <summary className="flex items-center justify-between font-semibold text-gray-800 dark:text-white">
                            {faq.question}
                            <svg className="h-6 w-6 transform transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                            {faq.answer}
                        </p>
                    </details>
                ))}
            </div>
        </div>

      </div>
    </section>
  );
}