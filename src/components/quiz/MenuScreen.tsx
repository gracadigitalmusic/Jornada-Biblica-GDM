import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Users, User, Zap, Target, Award, BookOpen, Flame, GraduationCap, Medal, BookMarked, Volume2, VolumeX, TrendingUp } from "lucide-react";
import { TOTAL_QUESTIONS } from "@/data/questions";
import { PlayerLevelCard } from "./PlayerLevelCard";
import { BadgesDisplay } from "./BadgesDisplay";
import { OfflineMode } from "./OfflineMode";
import { DailyChallengeCard } from "./DailyChallengeCard";

interface MenuScreenProps {
  onStartSolo: () => void;
  onStartMultiplayer: () => void;
  onStartMarathon: () => void;
  onStartStudy: () => void;
  onStartTournament: () => void;
  onStartStory: () => void;
  onStartCoop: () => void;
  onShowRanking: () => void;
  onShowAchievements: () => void;
  onShowPowerUpShop: () => void;
  onShowReview: () => void;
  onShowStats: () => void; // Novo
  isReviewAvailable: boolean;
  isNarrationEnabled: boolean;
  onToggleNarration: () => void;
}

export function MenuScreen({ 
  onStartSolo, 
  onStartMultiplayer, 
  onStartMarathon, 
  onStartStudy, 
  onStartTournament,
  onStartStory,
  onStartCoop,
  onShowRanking, 
  onShowAchievements, 
  onShowPowerUpShop,
  onShowReview,
  onShowStats, // Novo
  isReviewAvailable,
  isNarrationEnabled,
  onToggleNarration
}: MenuScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6 relative"
    >
      <div className="absolute -top-2 right-0 sm:right-4">
        <Button variant="ghost" size="icon" onClick={onToggleNarration}>
          {isNarrationEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start justify-center">
        <PlayerLevelCard />
        <BadgesDisplay />
      </div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-12">
        <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-gradient-primary">JORNADA</span><br /><span className="text-gradient-secondary">BÍBLICA</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-medium">Teste seu conhecimento das Escrituras</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.05, y: -5 }} className="relative group">
          <button onClick={onStartSolo} className="relative w-full bg-quiz-card hover:bg-quiz-card-hover border-2 border-primary/20 hover:border-primary rounded-2xl p-8 text-left transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl"><User className="w-8 h-8 text-primary" /></div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">10 PERGUNTAS</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Solo</h3>
            <p className="text-muted-foreground mb-4">Jogue sozinho, aprenda e conquiste o ranking!</p>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} whileHover={{ scale: 1.05, y: -5 }} className="relative group">
          <button onClick={onStartMultiplayer} className="relative w-full bg-quiz-card hover:bg-quiz-card-hover border-2 border-secondary/20 hover:border-secondary rounded-2xl p-8 text-left transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-secondary/10 rounded-xl"><Users className="w-8 h-8 text-secondary" /></div>
              <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">2-5 JOGADORES</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Multiplayer</h3>
            <p className="text-muted-foreground mb-4">Batalha épica em família!</p>
          </button>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} whileHover={{ scale: 1.03 }}>
          <button onClick={onStartMarathon} className="w-full bg-quiz-card hover:bg-quiz-card-hover border-2 border-border hover:border-secondary rounded-xl p-6 text-left transition-all">
            <div className="flex items-center gap-3 mb-3"><Flame className="w-6 h-6 text-secondary" /><h4 className="text-lg font-bold">Maratona</h4></div>
            <p className="text-sm text-muted-foreground">Infinito até perder 3 vidas</p>
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} whileHover={{ scale: 1.03 }}>
          <button onClick={onStartStudy} className="w-full bg-quiz-card hover:bg-quiz-card-hover border-2 border-border hover:border-success rounded-xl p-6 text-left transition-all">
            <div className="flex items-center gap-3 mb-3"><GraduationCap className="w-6 h-6 text-success" /><h4 className="text-lg font-bold">Estudo</h4></div>
            <p className="text-sm text-muted-foreground">Aprenda sem pressão</p>
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} whileHover={{ scale: 1.03 }}>
          <button onClick={onStartTournament} className="w-full bg-quiz-card hover:bg-quiz-card-hover border-2 border-border hover:border-primary rounded-xl p-6 text-left transition-all">
            <div className="flex items-center gap-3 mb-3"><Medal className="w-6 h-6 text-primary" /><h4 className="text-lg font-bold">Torneio</h4></div>
            <p className="text-sm text-muted-foreground">Competição semanal</p>
          </button>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} whileHover={{ scale: 1.03 }}>
          <button onClick={onStartStory} className="w-full bg-quiz-card hover:bg-quiz-card-hover border-2 border-border hover:border-primary rounded-xl p-6 text-left transition-all">
            <div className="flex items-center gap-3 mb-3"><BookMarked className="w-6 h-6 text-primary" /><h4 className="text-lg font-bold">Modo História</h4></div>
            <p className="text-sm text-muted-foreground">Jornada narrativa imersiva</p>
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} whileHover={{ scale: 1.03 }}>
          <button onClick={onStartCoop} className="w-full bg-quiz-card hover:bg-quiz-card-hover border-2 border-border hover:border-primary rounded-xl p-6 text-left transition-all">
            <div className="flex items-center gap-3 mb-3"><Users className="w-6 h-6 text-primary" /><h4 className="text-lg font-bold">Co-op</h4></div>
            <p className="text-sm text-muted-foreground">Jogue em equipe</p>
          </button>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onShowRanking} variant="outline" size="lg"><Trophy className="w-4 h-4 mr-2" />Ranking</Button>
        <Button onClick={onShowAchievements} variant="outline" size="lg"><Award className="w-4 h-4 mr-2" />Conquistas</Button>
        <Button onClick={onShowStats} variant="outline" size="lg"><TrendingUp className="w-4 h-4 mr-2" />Estatísticas</Button>
        <Button onClick={onShowPowerUpShop} variant="outline" size="lg"><Zap className="w-4 h-4 mr-2" />Loja</Button>
        {isReviewAvailable && <Button onClick={onShowReview} variant="outline" size="lg"><BookOpen className="w-4 h-4 mr-2" />Revisar</Button>}
      </motion.div>

      <OfflineMode />
    </motion.div>
  );
}