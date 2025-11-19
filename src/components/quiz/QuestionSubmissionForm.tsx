import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Send, Loader2, Check, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/quiz';

interface QuestionSubmissionFormProps {
  onClose: () => void;
}

export function QuestionSubmissionForm({ onClose }: QuestionSubmissionFormProps) {
  const { toast } = useToast();
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [reference, setReference] = useState('');
  const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<Question['difficulty']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 5) { // Limite de 5 opções
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) { // Mínimo de 2 opções
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswerIndex === index) {
        setCorrectAnswerIndex(null);
      } else if (correctAnswerIndex !== null && correctAnswerIndex > index) {
        setCorrectAnswerIndex(correctAnswerIndex - 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para submeter perguntas.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!questionText.trim() || options.some(opt => !opt.trim()) || correctAnswerIndex === null || !category.trim() || !difficulty.trim()) {
      toast({
        title: "Campos Faltando",
        description: "Por favor, preencha todos os campos obrigatórios (pergunta, opções, resposta correta, categoria e dificuldade).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('community_questions')
        .insert({
          user_id: user.data.user.id,
          question: questionText.trim(),
          options: options.map(opt => opt.trim()),
          answer: correctAnswerIndex,
          reference: reference.trim() || null,
          explanation: explanation.trim() || null,
          category: category.trim(),
          difficulty: difficulty,
          status: 'pending', // Status inicial é 'pending'
        })
        .select('id') // Seleciona o ID da pergunta inserida
        .single();

      if (error) throw error;

      const newQuestionId = data.id;

      // Invocar a Edge Function para revisão da IA
      const { error: aiError } = await supabase.functions.invoke('ai-review-question', {
        body: { questionId: newQuestionId },
      });

      if (aiError) {
        console.error("Erro ao invocar Edge Function de revisão da IA:", aiError);
        toast({
          title: "Erro na Revisão da IA",
          description: "A pergunta foi submetida, mas houve um erro ao iniciar a revisão da IA. Um administrador irá verificar.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pergunta Submetida! 🎉",
          description: "Sua pergunta foi enviada para revisão. Agradecemos sua contribuição!",
        });
      }
      onClose();
    } catch (error: any) {
      console.error("Erro ao submeter pergunta:", error);
      toast({
        title: "Erro na Submissão",
        description: error.message || "Não foi possível enviar sua pergunta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Send className="w-5 h-5 text-primary" />
          Submeter Nova Pergunta
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Contribua com a comunidade enviando suas próprias perguntas bíblicas. Elas serão revisadas antes de serem adicionadas ao jogo.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question">Pergunta</Label>
            <Textarea
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Digite sua pergunta aqui..."
              required
            />
          </div>

          <div>
            <Label>Opções de Resposta</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCorrectAnswerIndex(index)}
                  className={correctAnswerIndex === index ? 'bg-success text-success-foreground' : ''}
                  title="Marcar como Correta"
                >
                  {correctAnswerIndex === index ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </Button>
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    title="Remover Opção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 5 && (
              <Button type="button" variant="outline" onClick={handleAddOption} className="w-full mt-2 gap-2">
                <PlusCircle className="w-4 h-4" /> Adicionar Opção
              </Button>
            )}
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: genesis_pentateuco, evangelhos_jesus"
              required
            />
          </div>

          <div>
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select value={difficulty} onValueChange={(value: Question['difficulty']) => setDifficulty(value)} required>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Júnior</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference">Referência Bíblica (Opcional)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: Gênesis 1:1"
            />
          </div>

          <div>
            <Label htmlFor="explanation">Explicação (Opcional)</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explique a resposta correta e o contexto..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submeter Pergunta
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}