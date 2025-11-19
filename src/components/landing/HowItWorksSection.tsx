import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, MessageSquareText, Award } from "lucide-react";

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Gamepad2,
    title: "1. Escolha Seu Modo",
    description: "Seja solo, multiplayer, maratona ou história, há um desafio para você."
  },
  {
    icon: MessageSquareText,
    title: "2. Responda e Aprenda",
    description: "Teste seu conhecimento com perguntas e receba explicações detalhadas."
  },
  {
    icon: Award,
    title: "3. Conquiste e Cresça",
    description: "Ganhe pontos, desbloqueie conquistas e suba no ranking global."
  }
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2, duration: 0.6, ease: [0.42, 0, 0.58, 1] } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] } },
};

export function HowItWorksSection() {
  return (
    <motion.section
      className="py-20 px-4 max-w-6xl mx-auto text-center"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2 className="text-4xl font-bold text-gradient-primary mb-6">Como Funciona? É Simples!</h2>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
        Começar sua jornada de conhecimento bíblico é fácil e intuitivo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-primary transition-colors">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}