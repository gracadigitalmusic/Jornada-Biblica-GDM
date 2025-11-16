import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Users, User, Zap, Award, BookOpen, Flame, GraduationCap, Medal, BookMarked, Volume2, VolumeX, TrendingUp, ShoppingBag, LayoutGrid } from "lucide-react";
import { PlayerLevelCard } from "./PlayerLevelCard";
import { BadgesDisplay } from "./BadgesDisplay";
import { OfflineMode } from "./OfflineMode";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  onShowStats: () => void;
  isReviewAvailable: boolean;
  isNarrationEnabled: boolean;
  onToggleNarration: () => void;
}

// Componente auxiliar para botões de modo de jogo
interface ModeButtonProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  delay: number;
  colorClass: string;
}

const ModeButton = ({ icon, title, subtitle, onClick, delay, colorClass }: ModeButtonProps) => {
  // Extrai o nome da cor (ex: 'primary' de 'border-primary')
  const colorName = colorClass.replace('border-', '').split('/')[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: delay, duration: 0.3 }} 
      whileHover={{ scale: 1.02, boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)' }}
      className="h-full"
    >
      <button 
        onClick={onClick} 
        className={`w-full h-full bg-quiz-card hover:bg-quiz-card-hover border-2 ${colorClass} rounded-xl p-4 text-left transition-all flex items-center gap-4`}
      >
        <div className="p-3 rounded-full flex-shrink-0" style={{ backgroundColor: `hsl(var(--${colorName})/10)` }}>
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-bold">{title}</h4>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </button>
    </motion.div>
  );
};

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
  onShowStats,
  isReviewAvailable,
  isNarrationEnabled,
  onToggleNarration
}: MenuScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8 relative max-w-6xl mx-auto"
    >
      {/* Top Bar & Logo */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleNarration}>
            {isNarrationEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
          </Button>
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.2, duration: 0.5 }} 
          className="flex flex-col items-center"
        >
          <img 
            src="/logo_jogo.png" 
            alt="Jornada Bíblica Logo" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain animate-logo-pulse"
          />
          <h1 className="text-4xl md:text-5xl font-black mt-2 tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-gradient-primary">JORNADA</span><br /><span className="text-gradient-secondary">BÍBLICA</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">Teste seu conhecimento das Escrituras</p>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1: Status e Desafios */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4 bg-quiz-card/50 backdrop-blur border-primary/20">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Seu Status
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <PlayerLevelCard />
              <BadgesDisplay />
            </div>
          </Card>
          
          <DailyChallengeCard onStartChallenge={onStartSolo} onClaimReward={() => {}} />
          <OfflineMode />
        </div>

        {/* Coluna 2 & 3: Modos de Jogo */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Modos Competitivos */}
          <Card className="p-6 bg-quiz-card/50 backdrop-blur border-secondary/20">
            <CardTitle className="text-xl font-bold mb-4 flex items-center gap-2 text-gradient-secondary">
              <Trophy className="w-6 h-6" />
              Modos Competitivos
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModeButton
                icon={<User className="w-6 h-6 text-primary" />}
                title="Solo Rápido"
                subtitle="10 perguntas, ranking local"
                onClick={onStartSolo}
                delay={0.4}
                colorClass="border-primary"
              />
              <ModeButton
                icon={<Users className="w-6 h-6 text-secondary" />}
                title="Multiplayer Local"
                subtitle="Batalha de 2 a 5 jogadores"
                onClick={onStartMultiplayer}
                delay={0.5}
                colorClass="border-secondary"
              />
              <ModeButton
                icon={<Flame className="w-6 h-6 text-destructive" />}
                title="Maratona"
                subtitle="Infinito, até perder 3 vidas"
                onClick={onStartMarathon}
                delay={0.6}
                colorClass="border-destructive"
              />
              <ModeButton
                icon={<Medal className="w-6 h-6 text-primary" />}
                title="Torneio Semanal"
                subtitle="Competição global de 10 perguntas"
                onClick={onStartTournament}
                delay={0.7}
                colorClass="border-primary"
              />
            </div>
          </Card>

          {/* Modos de Aprendizado e Narrativa */}
          <Card className="p-6 bg-quiz-card/50 backdrop-blur border-success/20">
            <CardTitle className="text-xl font-bold mb-4 flex items-center gap-2 text-gradient-success">
              <BookMarked className="w-6 h-6" />
              Aprendizado & História
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModeButton
                icon={<BookOpen className="w-6 h-6 text-success" />}
                title="Modo Estudo"
                subtitle="Sem pressão, por categoria"
                onClick={onStartStudy}
                delay={0.8}
                colorClass="border-success"
              />
              <ModeButton
                icon={<BookMarked className="w-6 h-6 text-primary" />}
                title="Modo História"
                subtitle="Jornada narrativa imersiva"
                onClick={onStartStory}
                delay={0.9}
                colorClass="border-primary"
              />
              <ModeButton
                icon={<Users className="w-6 h-6 text-primary" />}
                title="Co-op Online"
                subtitle="Jogue em equipe (Beta)"
                onClick={onStartCoop}
                delay={1.0}
                colorClass="border-primary"
              />
              {isReviewAvailable && (
                <ModeButton
                  icon={<GraduationCap className="w-6 h-6 text-secondary" />}
                  title="Revisar Erros"
                  subtitle="Estude as perguntas que errou"
                  onClick={onShowReview}
                  delay={1.1}
                  colorClass="border-secondary"
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Rodapé de Ferramentas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 1.2 }} 
        className="mt-8 pt-4 border-t border-border/50"
      >
        <h3 className="text-lg font-bold mb-4 text-muted-foreground">Ferramentas</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={onShowRanking} variant="outline" size="lg" className="gap-2">
            <Trophy className="w-4 h-4" />Ranking
          </Button>
          <Button onClick={onShowAchievements} variant="outline" size="lg" className="gap-2">
            <Award className="w-4 h-4" />Conquistas
          </Button>
          <Button onClick={onShowStats} variant="outline" size="lg" className="gap-2">
            <TrendingUp className="w-4 h-4" />Estatísticas
          </Button>
          <Button onClick={onShowPowerUpShop} variant="outline" size="lg" className="gap-2">
            <ShoppingBag className="w-4 h-4" />Loja
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}