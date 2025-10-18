'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // Você também pode registrar o erro em um serviço de log de erros
    console.error("Erro capturado pelo Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback.
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
          <h1 className="text-2xl font-bold text-destructive">Algo deu errado.</h1>
          <p className="mt-2 text-muted-foreground">Ocorreu um erro inesperado nesta página.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Recarregar a Página
          </Button>
          <details className="mt-4 text-xs text-muted-foreground">
            <summary>Detalhes do Erro (para desenvolvedores)</summary>
            <pre className="mt-2 text-left text-xs bg-muted p-2 rounded-md">
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;