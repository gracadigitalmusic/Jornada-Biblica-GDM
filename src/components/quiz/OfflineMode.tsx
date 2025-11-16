import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Wifi, WifiOff, Trash2 } from "lucide-react";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { useToast } from "@/hooks/use-toast";

export function OfflineMode() {
  const {
    isOffline,
    isDataCached,
    isServiceWorkerReady,
    downloadForOffline,
    clearOfflineCache,
  } = useOfflineMode();
  
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      await downloadForOffline();
      toast({
        title: "Download concluído! ✅",
        description: "Todas as perguntas estão disponíveis offline.",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar as perguntas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleClearCache = async () => {
    try {
      await clearOfflineCache();
      toast({
        title: "Cache limpo",
        description: "Dados offline foram removidos.",
      });
    } catch (error) {
      toast({
        title: "Erro ao limpar cache",
        description: "Não foi possível limpar o cache.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isOffline ? (
            <WifiOff className="w-6 h-6 text-destructive" />
          ) : (
            <Wifi className="w-6 h-6 text-primary" />
          )}
          <div>
            <h3 className="font-semibold text-lg">Modo Offline</h3>
            <p className="text-sm text-muted-foreground">
              {isOffline ? "Você está offline" : "Conexão ativa"}
            </p>
          </div>
        </div>
        
        <Badge variant={isDataCached ? "default" : "secondary"}>
          {isDataCached ? "Dados salvos" : "Não baixado"}
        </Badge>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Baixe todas as perguntas e textos bíblicos para jogar sem internet.
        </p>

        <div className="flex gap-2">
          {!isDataCached ? (
            <Button
              onClick={handleDownload}
              disabled={!isServiceWorkerReady}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar para Offline
            </Button>
          ) : (
            <Button
              onClick={handleClearCache}
              variant="outline"
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Cache
            </Button>
          )}
        </div>

        {!isServiceWorkerReady && (
          <p className="text-xs text-muted-foreground">
            ⏳ Preparando modo offline...
          </p>
        )}
      </div>
    </Card>
  );
}
