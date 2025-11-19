import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Users, User, Zap, Award, Volume2, VolumeX, TrendingUp, ShoppingBag, Network, Infinity, Globe, Database, Target, Crown, BookOpen, BookMarked, Settings, LucideProps, Download, Sparkles, Heart, Shield, Lightbulb, BrainCircuit, MessageSquarePlus } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { MainMenuHeader } from "./MainMenuHeader"; // Importando o novo componente

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
  onStartPersonalizedStudy: () => void;
  onShowQuestionSubmission: () => void;
  hasStats: boolean; // Adicionado: Propriedade para indicar se há estatísticas
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
  {
    id: 'personalized_study',
    title: "Estudo Personalizado",
    subtitle: "Focado nas suas dificuldades",
    icon: BrainCircuit,
    onClick: (props: MenuScreenProps) => props.onStartPersonalizedStudy(),
    color: 'purple', // Nova cor para este modo
    glow: 'glow-primary',
    condition: (props: MenuScreenProps) => props.hasStats // Usando a prop hasStats
  }
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
      className="flex flex-col items-center justify-start text-center space-y-4 relative max-w-6xl mx-auto pt-4 pb-4 px-4"
    >
      {/* Watermark Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-5" 
          style={{ backgroundImage: `url('/logo_jogo.png')` }} 
        />
      </div>

      {/* Novo Cabeçalho */}
      <MainMenuHeader
        isNarrationEnabled={props.isNarrationEnabled}
        onToggleNarration={props.onToggleNarration}
        onShowProfile={props.onShowProfile}
      />
      
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
          Progresso & Comunidade
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
          <Button onClick={props.onShowQuestionSubmission} variant="outline" size="lg" className="gap-2">
            <MessageSquarePlus className="w-4 h-4 text-purple-500" />Submeter Pergunta
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}