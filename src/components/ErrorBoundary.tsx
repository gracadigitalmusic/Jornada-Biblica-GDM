import React, { ErrorInfo, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios de erro
    console.error("Uncaught error in component:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-destructive/10">
          <Card className="max-w-lg w-full p-6 border-destructive border-2 shadow-xl">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl text-destructive">
                O Jogo Quebrou!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Ocorreu um erro inesperado na aplicação. Isso geralmente é um problema de código.
              </p>
              
              <Button 
                onClick={this.props.onReset} 
                className="w-full bg-destructive hover:bg-destructive/90 gap-2"
              >
                <Home className="w-4 h-4" />
                Voltar ao Menu Principal
              </Button>
              
              {/* Detalhes do Erro (apenas para debug) */}
              <details className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded-md">
                <summary className="cursor-pointer font-semibold text-destructive">Detalhes do Erro (Debug)</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;