import { useEffect, useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

// Code Splitting: Lazy load routes
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  // Usamos uma chave para forçar a remontagem do Index (e resetar o estado) em caso de erro
  const [appKey, setAppKey] = useState(0);
  
  const handleReset = () => {
    setAppKey(prev => prev + 1);
    // Força o retorno à rota inicial
    window.location.href = '/';
  };

  useEffect(() => {
    // Set dark theme by default
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary onReset={handleReset}>
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-quiz-bg-start to-quiz-bg-end">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Index key={appKey} />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;