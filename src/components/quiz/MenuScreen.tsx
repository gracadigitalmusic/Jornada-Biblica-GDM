import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Users, User, Zap, Award, Volume2, VolumeX, TrendingUp, ShoppingBag, Network, Infinity, Globe, Database, Target, Crown, BookOpen, BookMarked, Settings, LucideProps, Download, Sparkles, Heart, Shield, Lightbulb } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface MenuScreenProps {
  onStartSolo: () => void;
  onStartMultiplayer: () => void;
  onStartMarathon: (player: any) => void;
  onStartStudy: () => void;
  onStartTournament: () => void;
  onStartStory: () => void;
  onStartCoop: () => void;
  onShowRanking: () => void;
  onShowAchievements: () => void;
  onShowPowerUpShop: () => void;
  onShowReview: () => void;
  onShowStats: () => void;
  onShowProfile: () => void;
  isReviewAvailable: boolean;
  isNarrationEnabled: boolean;
  onToggleNarration: () => void;
  onStartChallenge: () => void;
  onClaimReward: () => void;
  isOfflineDataCached: boolean;
  onDownloadOffline: () => void;
}

interface GameModeDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  onClick: (props: MenuScreenProps) => void;
  color: string;
  glow: string;
  condition?: (props: MenuScreenProps) => boolean;
}

const GAME_MODES: GameModeDefinition[] = [
  { 
    id: 'solo', 
    title: "Solo Rápido", 
    subtitle: "10 perguntas, ranking local", 
    icon: Zap, 
    onClick: (props: MenuScreenProps) => props.onStartSolo(), 
    color: 'primary',
    glow: 'glow-primary'
  },
  { 
    id: 'marathon', 
    title: "Maratona", 
    subtitle: "Infinito, até perder 3 vidas", 
    icon: Infinity, 
    onClick: (props: MenuScreenProps) => props.onStartMarathon({ name: 'Maratonista', location: 'Maratona', score: 0, avatar: '🏃' }),
    color: 'destructive',
    glow: 'glow-destructive'
  },
  { 
    id: 'tournament', 
    title: "Torneio Semanal", 
    subtitle: "Competição global de 10 perguntas", 
    icon: Crown, 
    onClick: (props: MenuScreenProps) => props.onStartTournament(), 
    color: 'secondary',
    glow: 'glow-secondary'
  },
  { 
    id: 'multiplayer', 
    title: "Multiplayer Local", 
    subtitle: "Batalha de 2 a 5 jogadores", 
    icon: Users, 
    onClick: (props: MenuScreenProps) => props.onStartMultiplayer(), 
    color: 'accent',
    glow: 'glow-secondary'
  },
  { 
    id: 'story', 
    title: "Modo História", 
    subtitle: "Jornada narrativa imersiva", 
    icon: Globe, 
    onClick: (props: MenuScreenProps) => props.onStartStory(), 
    color: 'primary',
    glow: 'glow-primary'
  },
];

const LEARNING_MODES: GameModeDefinition[] = [
  { 
    id: 'study', 
    title: "Modo Estudo", 
    subtitle: "Sem pressão, por categoria", 
    icon: Database, 
    onClick: (props: MenuScreenProps) => props.onStartStudy(), 
    color: 'success',
    glow: 'glow-success'
  },
  { 
    id: 'review', 
    title: "Revisar Erros", 
    subtitle: "Estude as perguntas que errou", 
    icon: Target, 
    onClick: (props: MenuScreenProps) => props.onShowReview(), 
    color: 'secondary',
    glow: 'glow-secondary',
    condition: (props: MenuScreenProps) => props.isReviewAvailable
  },
];

interface ModeButtonProps {
  mode: GameModeDefinition;
  props: MenuScreenProps;
  delay: number;
}

const ModeButton = ({ mode, props, delay }: ModeButtonProps) => {
  const Icon = mode.icon;
  const isAvailable = mode.condition ? mode.condition(props) : true; 
  const colorClass = `border-${mode.color}/50`;
  const iconBgClass = `bg-${mode.color}/10`;
  const iconColorClass = `text-${mode.color}`;
  const hoverBorderClass = `hover:border-${mode.color}`;
  const glowClass = mode.glow === 'glow-destructive' ? 'shadow-destructive/50' : mode.glow === 'glow-secondary' ? 'shadow-secondary/50' : 'shadow-primary/50';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: delay, duration: 0.4 }} 
      whileHover={isAvailable ? { scale: 1.03, boxShadow: `0 0 25px ${glowClass}` } : {}}
      className={`h-full ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''} will-change-transform`}
    >
      <button 
        onClick={() => isAvailable && mode.onClick(props)} 
        disabled={!isAvailable}
        className={`w-full h-full bg-quiz-card/70 backdrop-blur-sm border-2 ${colorClass} rounded-xl p-4 text-left transition-all flex items-center gap-4 ${hoverBorderClass}`}
      >
        <div className={`p-3 rounded-full flex-shrink-0 ${iconBgClass}`}>
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-foreground">{mode.title}</h4>
          <p className="text-sm text-muted-foreground">{mode.subtitle}</p>
        </div>
      </button>
    </motion.div>
  );
};

export function MenuScreen(props: MenuScreenProps) {
  const allModes = [...GAME_MODES, ...LEARNING_MODES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start text-center space-y-8 relative max-w-6xl mx-auto pb-8 px-4 pt-8"
    >
      {/* Top Bar & Logo */}
      <div className="flex flex-col items-center justify-center mb-8 relative">
        {/* Botões de Configuração */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button onClick={props.onShowProfile} variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={props.onToggleNarration}>
            {props.isNarrationEnabled ? <Volume2 className="w-5 h-5 text-secondary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
          </Button>
        </div>

        {/* Central Orb/Portal */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 100 }} 
          className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-6 mt-4 will-change-transform"
        >
          <div className="absolute inset-0 rounded-full orb-background animate-orb-pulse" />
          <img 
            src="/logo_jogo.png" 
            alt="Jornada Bíblica Logo" 
            className="w-28 h-28 md:w-36 md:h-36 object-contain z-10 animate-logo-pulse"
          />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black mt-4 tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          <span className="text-gradient-primary">JORNADA</span><br /><span className="text-gradient-secondary">BÍBLICA</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground font-medium mt-2">Teste seu conhecimento das Escrituras</p>
      </div>
      
      {/* Botão de Download Offline em Destaque */}
      {!props.isOfflineDataCached && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <Button
            onClick={props.onDownloadOffline}
            size="lg"
            className="w-full h-16 text-lg bg-success hover:bg-success/90 gap-3 animate-pulse-glow-secondary"
          >
            <Download className="w-6 h-6" />
            Baixar Jogo 100% Offline
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Baixe todas as perguntas para jogar sem internet.
          </p>
        </motion.div>
      )}

      {/* Main Content Grid - Modos de Jogo */}
      <Card className="p-6 bg-quiz-card/50 backdrop-blur-sm border-primary/20 shadow-xl">
        <CardTitle className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-gradient-primary">
          <BookMarked className="w-6 h-6" />
          Escolha sua Jornada
        </CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allModes.map((mode, index) => (
            <ModeButton key={mode.id} mode={mode} props={props} delay={0.4 + index * 0.05} />
          ))}
        </div>
      </Card>

      {/* Rodapé de Ferramentas (Mais compacto) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 1.2 }} 
        className="mt-6 pt-4 border-t border-border/50"
      >
        <h3 className="text-lg font-bold mb-4 text-muted-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-celestial-gold" />
          Progresso & Loja
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={props.onShowProfile} variant="outline" size="lg" className="gap-2">
            <User className="w-4 h-4 text-primary" />Perfil
          </Button>
          <Button onClick={props.onShowRanking} variant="outline" size="lg" className="gap-2">
            <Trophy className="w-4 h-4 text-secondary" />Ranking
          </Button>
          <Button onClick={props.onShowAchievements} variant="outline" size="lg" className="gap-2">
            <Award className="w-4 h-4 text-success" />Conquistas
          </Button>
          <Button onClick={props.onShowStats} variant="outline" size="lg" className="gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />Estatísticas
          </Button>
          <Button onClick={props.onShowPowerUpShop} variant="outline" size="lg" className="gap-2">
            <ShoppingBag className="w-4 h-4 text-destructive" />Loja
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}