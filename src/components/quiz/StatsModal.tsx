import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function StatsModal({ open, onClose }: StatsModalProps) {
  const { stats, getCategoryPerformance } = useStats();
  const categoryData = getCategoryPerformance();
  
  const totalCorrect = stats.history.reduce((sum, h) => sum + h.correctAnswers, 0);
  const totalWrong = stats.history.reduce((sum, h) => sum + h.wrongAnswers, 0);
  const totalTime = stats.history.reduce((sum, h) => sum + h.timeSpent, 0);
  const totalSessions = stats.history.length;
  const totalScore = stats.history.reduce((sum, h) => sum + h.score, 0);

  const pieData = categoryData.map(d => ({
    name: d.category,
    value: d.total,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-primary" />
            Estatísticas de Performance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-primary/10">
              <p className="text-sm text-muted-foreground">Pontuação Total</p>
              <p className="text-2xl font-bold text-primary">{totalScore}</p>
            </Card>
            <Card className="p-4 bg-success/10">
              <p className="text-sm text-muted-foreground">Acertos</p>
              <p className="text-2xl font-bold text-success">{totalCorrect}</p>
            </Card>
            <Card className="p-4 bg-destructive/10">
              <p className="text-sm text-muted-foreground">Erros</p>
              <p className="text-2xl font-bold text-destructive">{totalWrong}</p>
            </Card>
            <Card className="p-4 bg-secondary/10">
              <p className="text-sm text-muted-foreground">Sessões</p>
              <p className="text-2xl font-bold text-secondary">{totalSessions}</p>
            </Card>
          </div>

          {/* Category Performance */}
          <Card>
            <CardHeader className="font-semibold">Performance por Categoria</CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]}
                  />
                  <Bar dataKey="correct" fill="hsl(var(--success))" name="Acertos" />
                  <Bar dataKey="total" fill="hsl(var(--destructive))" name="Total" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* History and Favorites */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="font-semibold">Histórico Recente (Últimas 10)</CardHeader>
              <CardContent className="space-y-2">
                {stats.history.slice(0, 10).map((h, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg text-sm"
                  >
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(h.date), 'dd/MM/yy HH:mm', { locale: ptBR })}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">{h.score} pts</span>
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="w-3 h-3" /> {h.correctAnswers}
                      </span>
                      <span className="flex items-center gap-1 text-destructive">
                        <XCircle className="w-3 h-3" /> {h.wrongAnswers}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" /> {h.timeSpent.toFixed(1)}s
                      </span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="font-semibold">Distribuição de Perguntas</CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value, name, props) => [`${value} perguntas`, props.payload.name]}
                    />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}