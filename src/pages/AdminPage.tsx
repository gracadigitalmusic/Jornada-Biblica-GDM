import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminQuestionForm } from "@/components/admin/AdminQuestionForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const AdminPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <Card className="p-6 bg-quiz-card border-2 border-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-black flex items-center gap-3 text-gradient-secondary">
              <Settings className="w-8 h-8" />
              Área de Administração
            </CardTitle>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Jogo
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="mt-6">
            <AdminQuestionForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminPage;