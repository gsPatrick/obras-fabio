import Link from 'next/link';
import Image from 'next/image';
import { NavLinks } from './NavLinks';

export function Sidebar() {
  return (
    <aside className="hidden h-screen border-r bg-muted/40 md:flex md:flex-col sticky top-0">
      
      {/* 
        CABEÇALHO DA SIDEBAR COM ALTURA AUMENTADA:
        - h-20 (80px): Aumentamos a altura padrão.
        - lg:h-24 (96px): Aumentamos a altura para telas maiores.
        - Você pode ajustar esses valores (ex: h-16, h-24) se preferir.
      */}
      <div className="flex h-20 items-center justify-center border-b px-4 lg:h-24 lg:px-6">
        <Link href="/" className="flex w-full items-center justify-center font-semibold">
          <Image
            src="/logo.png"
            alt="SAGEPE Logo"
            width={120} // Aumentamos um pouco a resolução base
            height={40}  // para a nova altura
            className="h-auto w-28" // Ajuste 'w-28' (112px) conforme o necessário
            priority
          />
        </Link>
      </div>
      
      <div className="flex-grow overflow-y-auto py-2">
        <NavLinks />
      </div>
      
      <div className="p-4 border-t">
        {/* Espaço reservado */}
      </div>
    </aside>
  );
}