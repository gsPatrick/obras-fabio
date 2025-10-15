// components/landing/Header.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Ícone simples para o logo
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

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50 border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Kontrolly</span>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#como-funciona" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 transition-colors">Como Funciona</Link>
            <Link href="#recursos" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 transition-colors">Recursos</Link>
            <Link href="#precos" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 transition-colors">Preços</Link>
          </nav>

          {/* Botões de Ação */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/login">Acessar Painel</Link>
            </Button>
            {/* <<< MUDANÇA: Botão principal aponta para a seção de preços >>> */}
            <Button asChild>
                <Link href="#precos">Ver Planos</Link>
            </Button>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-300 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Itens do Menu Mobile */}
        {isOpen && (
          <div className="md:hidden pt-2 pb-4 space-y-2">
            <Link href="#como-funciona" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Como Funciona</Link>
            <Link href="#recursos" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Recursos</Link>
            <Link href="#precos" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">Preços</Link>
            <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
            <div className='flex flex-col gap-2'>
                <Button variant="outline" asChild>
                    <Link href="/login">Acessar Painel</Link>
                </Button>
                 {/* <<< MUDANÇA: Botão principal aponta para a seção de preços >>> */}
                <Button asChild>
                    <Link href="#precos">Ver Planos</Link>
                </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}