import { motion, Variants } from "framer-motion"; // Importando 'Variants' para tipagem explícita
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Zap, Globe, BrainCircuit, Trophy, Award, ShoppingBag, Download, ArrowRight, Lightbulb, Target, Infinity, BookMarked, HeartHandshake, ScrollText, GraduationCap, Crown } from "lucide-react";

// Definindo os variants com tipagem explícita e usando arrays para 'ease'
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] } }, // ease: "easeInOut"
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] } }, // ease: "easeInOut"
};

export function LandingPage() {
  return (
    <div className="bg-gradient-to-br from-quiz-bg-start to-quiz-bg-end text-foreground font-poppins overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-svh flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        {/* Background Orbs/Glows - Removendo animações do framer-motion para evitar conflito com CSS */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-70 animate-float"
            // A animação 'animate-float' já é definida via CSS em src/index.css
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-70 animate-float"
            style={{ animationDelay: "1s" }} // Mantendo o delay da animação CSS
          />
        </div>

        <motion.img
          src="/logo_jogo.png"
          alt="Jornada Bíblica Logo"
          className="w-48 h-auto mb-6 z-10 animate-logo-pulse"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.42, 0, 0.58, 1] }} // ease: "easeInOut"
        />

        <motion.h1
          className="text-5xl md:text-7xl font-black tracking-tight mb-4 z-10 text-gradient-primary"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.42, 0, 0.58, 1] }} // ease: "easeInOut"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          JORNADA BÍBLICA
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-muted-foreground font-medium mb-8 max-w-2xl z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.42, 0, 0.58, 1] }} // ease: "easeInOut"
        >
          Desvende as Escrituras, Desafie sua Mente, Fortaleça sua Fé.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.6, ease: [0.42, 0, 0.58, 1] }} // ease: "easeInOut"
          className="z-10"
        >
          <Link to="/game">
            <Button size="lg" className="px-10 py-6 text-xl font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg animate-pulse-glow-primary">
              Comece Sua Jornada Agora! <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* About Section */}
      <motion.section
        className="py-20 px-4 max-w-6xl mx-auto text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold text-gradient-primary mb-6">O Que é a Jornada Bíblica?</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
          Prepare-se para uma experiência imersiva e desafiadora que testará e aprofundará seu conhecimento das Sagradas Escrituras. A Jornada Bíblica é mais do que um quiz; é uma ferramenta para o crescimento espiritual e intelectual.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-primary/20 hover:border-primary transition-colors">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">Aprenda e Cresça</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Com milhares de perguntas cuidadosamente elaboradas, você explorará cada livro, personagem e evento da Bíblia. Cada resposta vem com uma explicação detalhada e referência bíblica para que você possa ir além do acerto e realmente compreender a Palavra.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-secondary/20 hover:border-secondary transition-colors">
              <CardHeader>
                <HeartHandshake className="w-12 h-12 text-secondary mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">Propósito Divino</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nosso objetivo é inspirar uma conexão mais profunda com a Bíblia, tornando o estudo divertido e acessível. Acreditamos que o conhecimento das Escrituras é um pilar fundamental para uma vida de fé e propósito.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Game Modes Section */}
      <motion.section
        className="py-20 px-4 max-w-6xl mx-auto text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold text-gradient-secondary mb-6">Explore Nossos Modos de Jogo</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
          Seja você um iniciante ou um teólogo experiente, há um modo de jogo perfeito para sua jornada.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-primary transition-colors">
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-xl">Solo Rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Responda 10 perguntas e veja sua pontuação no ranking local.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-destructive transition-colors">
              <CardHeader>
                <Infinity className="w-10 h-10 text-destructive mx-auto mb-3" />
                <CardTitle className="text-xl">Maratona</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Perguntas infinitas! Jogue até perder 3 vidas e desafie seus limites.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-secondary transition-colors">
              <CardHeader>
                <Crown className="w-10 h-10 text-secondary mx-auto mb-3" />
                <CardTitle className="text-xl">Torneio Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Compita globalmente em 10 perguntas fixas e ganhe badges exclusivos.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-accent transition-colors">
              <CardHeader>
                <Users className="w-10 h-10 text-accent mx-auto mb-3" />
                <CardTitle className="text-xl">Multiplayer Local</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Reúna amigos e família para uma batalha de conhecimento bíblico (2 a 5 jogadores).</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-primary transition-colors">
              <CardHeader>
                <Globe className="w-10 h-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-xl">Modo História</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Embarque em uma jornada narrativa imersiva através dos grandes eventos da Bíblia.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-success transition-colors">
              <CardHeader>
                <GraduationCap className="w-10 h-10 text-success mx-auto mb-3" />
                <CardTitle className="text-xl">Modo Estudo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Aprenda sem pressão de tempo, com explicações detalhadas e por categoria.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-20 px-4 max-w-6xl mx-auto text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold text-gradient-primary mb-6">Recursos que Impulsionam sua Fé</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
          Desenvolvemos funcionalidades para enriquecer sua experiência e aprendizado.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-primary transition-colors">
              <CardHeader>
                <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-xl">Ranking Global</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Compare sua pontuação com jogadores de todo o mundo.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-success transition-colors">
              <CardHeader>
                <Award className="w-10 h-10 text-success mx-auto mb-3" />
                <CardTitle className="text-xl">Conquistas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Desbloqueie badges e celebre seu progresso na jornada.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-destructive transition-colors">
              <CardHeader>
                <ShoppingBag className="w-10 h-10 text-destructive mx-auto mb-3" />
                <CardTitle className="text-xl">Loja Virtual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Personalize sua experiência com avatares e temas exclusivos.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-secondary transition-colors">
              <CardHeader>
                <Download className="w-10 h-10 text-secondary mx-auto mb-3" />
                <CardTitle className="text-xl">Modo Offline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Jogue a qualquer hora, em qualquer lugar, sem precisar de internet.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-purple-500 transition-colors">
              <CardHeader>
                <BrainCircuit className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                <CardTitle className="text-xl">Estudo Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Foque nas suas áreas de dificuldade com perguntas adaptadas ao seu perfil.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-accent transition-colors">
              <CardHeader>
                <Lightbulb className="w-10 h-10 text-accent mx-auto mb-3" />
                <CardTitle className="text-xl">Dicas e Explicações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Nunca fique na dúvida! Cada pergunta tem uma explicação e referência bíblica.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-primary transition-colors">
              <CardHeader>
                <ScrollText className="w-10 h-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-xl">Textos Bíblicos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Acesse o texto completo da referência bíblica diretamente no jogo.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-secondary transition-colors">
              <CardHeader>
                <Target className="w-10 h-10 text-secondary mx-auto mb-3" />
                <CardTitle className="text-xl">Desafios Diários</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Nvos desafios todos os dias para testar suas habilidades e ganhar recompensas.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Final Call to Action */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-r from-primary/10 to-secondary/10 text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold text-gradient-primary mb-6">Pronto para o Desafio da Fé?</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
          Sua jornada de conhecimento e crescimento espiritual começa agora. Clique abaixo e mergulhe nas profundezas da Palavra de Deus!
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.42, 0, 0.58, 1] }}
        >
          <Link to="/game">
            <Button size="lg" className="px-12 py-7 text-2xl font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl animate-pulse-glow-primary">
              JOGAR AGORA! <ArrowRight className="ml-4 w-7 h-7" />
            </Button>
          </Link>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="py-10 px-4 text-center text-muted-foreground text-sm bg-quiz-card/50 border-t border-border/20">
        <p>&copy; {new Date().getFullYear()} Jornada Bíblica. Todos os direitos reservados.</p>
        <p className="mt-2">Desenvolvido com Fé e Dedicação.</p>
      </footer>
    </div>
  );
}