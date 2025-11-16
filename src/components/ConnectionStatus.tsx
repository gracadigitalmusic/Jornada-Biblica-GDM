import { useEffect, useState } from "react";
import { Wifi, WifiOff, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { motion, AnimatePresence } from "framer-motion";

export function ConnectionStatus() {
  const { isOffline, isDataCached } = useOfflineMode();
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [showNotification, setShowNotification] = useState(false);

  // Calcula tamanho do cache
  useEffect(() => {
    if ('caches' in window && isDataCached) {
      caches.open('divine-wisdom-offline-v1').then(async (cache) => {
        const keys = await cache.keys();
        setCacheSize(keys.length);
      });
    }
  }, [isDataCached]);

  // Mostra notificação quando muda status
  useEffect(() => {
    setShowNotification(true);
    const timer = setTimeout(() => setShowNotification(false), 3000);
    return () => clearTimeout(timer);
  }, [isOffline]);

  return (
    <TooltipProvider>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Status da Conexão */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="cursor-help"
            >
              <Badge
                variant={isOffline ? "destructive" : "default"}
                className="flex items-center gap-2 px-3 py-1.5"
              >
                {isOffline ? (
                  <WifiOff className="w-4 h-4" />
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {isOffline ? "Offline" : "Online"}
                </span>
              </Badge>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isOffline
                ? "Sem conexão com a internet"
                : "Conectado à internet"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Status do Cache */}
        {isDataCached && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="cursor-help"
              >
                <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
                  <Database className="w-4 h-4" />
                  <span className="font-medium">{cacheSize} itens</span>
                </Badge>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dados salvos para uso offline</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Notificação de mudança de status */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute right-0 top-12 bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px]"
            >
              <p className="text-sm font-medium">
                {isOffline ? "🔴 Você está offline" : "🟢 Conectado novamente"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isOffline && isDataCached
                  ? "Modo offline ativo com dados salvos"
                  : isOffline
                  ? "Algumas funcionalidades podem estar limitadas"
                  : "Todas as funcionalidades disponíveis"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
