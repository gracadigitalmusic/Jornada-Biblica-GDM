import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "A Jornada Bíblica transformou meu estudo da Palavra! É divertido, desafiador e me ajuda a memorizar versículos. Recomendo a todos!",
    author: "Ana Clara S.",
    role: "Estudante de Teologia"
  },
  {
    quote: "Finalmente um quiz bíblico que me prende! Os modos de jogo são incríveis e as explicações são super úteis. Minha família adora o multiplayer!",
    author: "Pastor João M.",
    role: "Líder Comunitário"
  },
  {
    quote: "Eu achava que sabia muito da Bíblia, mas este jogo me desafiou de verdade. As conquistas me motivam a aprender mais a cada dia.",
    author: "Lucas P.",
    role: "Entusiasta Bíblico"
  }
];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] } },
};

export function TestimonialsSection() {
  return (
    <motion.section
      className="py-20 px-4 max-w-6xl mx-auto text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2, duration: 0.6, ease: [0.42, 0, 0.58, 1] } },
      }}
    >
      <h2 className="text-4xl font-bold text-gradient-secondary mb-6">O Que Nossos Jogadores Dizem</h2>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
        Veja como a Jornada Bíblica está impactando a vida e o conhecimento de milhares de pessoas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="h-full p-6 bg-quiz-card/50 border-border hover:border-secondary transition-colors">
              <CardHeader className="pb-4">
                <Quote className="w-8 h-8 text-secondary mx-auto mb-3" />
                <CardTitle className="text-lg font-semibold leading-relaxed">"{testimonial.quote}"</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 border-t border-border/50">
                <p className="font-bold text-primary">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}