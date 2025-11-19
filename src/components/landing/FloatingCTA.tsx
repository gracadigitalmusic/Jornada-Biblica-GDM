import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FloatingCTA() {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
    >
      <Link to="/game">
        <Button size="lg" className="px-8 py-5 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl animate-pulse-glow-primary">
          JOGAR AGORA! <ArrowRight className="ml-3 w-5 h-5" />
        </Button>
      </Link>
    </motion.div>
  );
}