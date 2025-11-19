import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Volume2, VolumeX } from "lucide-react";
import React from "react";

interface MainMenuHeaderProps {
  isNarrationEnabled: boolean;
  onToggleNarration: () => void;
  onShowProfile: () => void;
}

export function MainMenuHeader({ isNarrationEnabled, onToggleNarration, onShowProfile }: MainMenuHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full flex flex-col items-center justify-center py-4 px-4"
    >
      {/* Botões de Configuração */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <Button onClick={onShowProfile} variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
          <User className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleNarration}>
          {isNarrationEnabled ? <Volume2 className="w-5 h-5 text-secondary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
        </Button>
      </div>

      {/* Título do Jogo */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        className="text-4xl md:text-6xl font-black tracking-tight animate-logo-pulse"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        <span className="text-gradient-primary">JORNADA</span><br />
        <span className="text-gradient-secondary">BÍBLICA</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        className="text-base md:text-lg text-muted-foreground font-medium mt-2"
      >
        Teste seu conhecimento das Escrituras
      </motion.p>
    </motion.div>
  );
}