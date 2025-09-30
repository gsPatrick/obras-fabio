// components/landing/Footer.js
import Link from 'next/link';

// Ícone do logo
const Logo = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="h-8 w-8 text-blue-600"
    >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="m12 18-3-3 3-3" />
        <path d="m9 15h6" />
    </svg>
);


export function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 md:gap-8">
                    {/* Coluna do Logo */}
                    {/* <<< CORREÇÃO: items-center no mobile, md:items-start no desktop >>> */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Logo />
                            <span className="text-xl font-bold text-gray-800 dark:text-white">Obra.AI</span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Simplificando a gestão de custos na construção civil.
                        </p>
                    </div>

                    {/* Colunas de Links */}
                     {/* <<< CORREÇÃO: Adicionado flexbox para centralizar no mobile >>> */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Produto</h3>
                        <ul className="mt-4 space-y-2 text-center md:text-left">
                            <li><Link href="#como-funciona" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Como Funciona</Link></li>
                            <li><Link href="#recursos" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Recursos</Link></li>
                            <li><Link href="#precos" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Preços</Link></li>
                        </ul>
                    </div>
                     {/* <<< CORREÇÃO: Adicionado flexbox para centralizar no mobile >>> */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Empresa</h3>
                        <ul className="mt-4 space-y-2 text-center md:text-left">
                            <li><Link href="#" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Sobre Nós</Link></li>
                            <li><Link href="#" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Contato</Link></li>
                        </ul>
                    </div>
                     {/* <<< CORREÇÃO: Adicionado flexbox para centralizar no mobile >>> */}
                     <div className="flex flex-col items-center md:items-start">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Legal</h3>
                        <ul className="mt-4 space-y-2 text-center md:text-left">
                            <li><Link href="#" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Termos de Serviço</Link></li>
                            <li><Link href="#" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">Política de Privacidade</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                        © {new Date().getFullYear()} Obra.AI. Todos os direitos reservados.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Desenvolvido por{' '}
                        <a 
                            href="https://codebypatrick.dev/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            Patrick.Developer
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}