import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Users, User, Zap, Award, Volume2, VolumeX, TrendingUp, ShoppingBag, Network, Infinity, Globe, Database, Target, Share2, Crown, BookOpen, BookMarked, Settings, LucideProps } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ForwardRefExoticComponent, RefAttributes } from "react";

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
  onShowProfile: () => void;
  isReviewAvailable: boolean;
  isNarrationEnabled: boolean;
  onToggleNarration: () => void;
}

interface GameModeDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  onClick: (props: MenuScreenProps) => void;
  color: string;
  glow: string;
  condition?: (props: MenuScreenProps) => boolean; // Adicionado 'condition' opcional
}

// Definição dos modos de jogo com ícones e cores de destaque
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
    onClick: (props: MenuScreenProps) => props.onStartMarathon(), 
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
    icon: Network, 
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
  { 
    id: 'coop', 
    title: "Co-op Online", 
    subtitle: "Jogue em equipe (Beta)", 
    icon: Share2, 
    onClick: (props: MenuScreenProps) => props.onStartCoop(), 
    color: 'primary',
    glow: 'glow-primary'
  },
];

// Modos de Aprendizado
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

// Componente auxiliar para botões de modo de jogo
interface ModeButtonProps {
  mode: GameModeDefinition; // Usando a nova interface
  props: MenuScreenProps;
  delay: number;
}

const ModeButton = ({ mode, props, delay }: ModeButtonProps) => {
  const Icon = mode.icon;
  // A verificação agora funciona corretamente
  const isAvailable = mode.condition ? mode.condition(props) : true; 
  const colorClass = `border-${mode.color}/50`;
  const iconColorClass = `text-${mode.color}`;
  const glowClass = mode.glow === 'glow-destructive' ? 'shadow-destructive/50' : mode.glow === 'glow-secondary' ? 'shadow-secondary/50' : 'shadow-primary/50';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: delay, duration: 0.3 }} 
      whileHover={isAvailable ? { scale: 1.05, boxShadow: `0 0 20px ${glowClass}` } : {}}
      className={`h-full ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <button 
        onClick={() => isAvailable && mode.onClick(props)} 
        disabled={!isAvailable}
        className={`w-full h-full bg-quiz-card hover:bg-quiz-card-hover border-2 ${colorClass} rounded-xl p-4 text-left transition-all flex items-center gap-4`}
      >
        <div className={`p-3 rounded-full flex-shrink-0 bg-${mode.color}/10`}>
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
        <div>
          <h4 className="text-lg font-bold">{mode.title}</h4>
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
      className="text-center space-y-8 relative max-w-4xl mx-auto pt-12 pb-12"
    >
      {/* Top Bar & Logo */}
      <div className="flex flex-col items-center justify-center mb-10">
        {/* Botões de Configuração (Movidos para o topo) */}
        <div className="absolute top-0 right-0 flex items-center gap-2">
          <Button onClick={props.onShowProfile} variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={props.onToggleNarration}>
            {props.isNarrationEnabled ? <Volume2 className="w-5 h-5 text-secondary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
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
            className="w-28 h-28 md:w-36 md:h-36 object-contain animate-logo-pulse"
          />
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-gradient-primary">JORNADA</span><br /><span className="text-gradient-secondary">BÍBLICA</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium mt-2">Teste seu conhecimento das Escrituras</p>
        </motion.div>
      </div>

      {/* Main Content Grid - Modos de Jogo (Todos juntos em uma grade maior) */}
      <Card className="p-6 bg-quiz-card/50 backdrop-blur border-primary/20">
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
        className="mt-8 pt-4 border-t border-border/50"
      >
        <h3 className="text-lg font-bold mb-4 text-muted-foreground">Hall da Fama & Loja</h3>
        <div className="flex flex-wrap justify-center gap-4">
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