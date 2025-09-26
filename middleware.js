// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Se não houver token e o usuário tentar acessar uma rota do dashboard, redirecione para o login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Se houver um token e o usuário tentar acessar a página de login, redirecione para o dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Define quais rotas o middleware deve observar
  matcher: ['/dashboard/:path*', '/login'],
};