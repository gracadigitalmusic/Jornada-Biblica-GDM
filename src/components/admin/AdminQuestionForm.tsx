import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { useCustomQuestions } from '@/hooks/useCustomQuestions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'genesis_pentateuco', 'reis_historia', 'profetas', 'sabedoria', 
  'evangelhos_jesus', 'epistolas_apostolos', 'apocalipse', 'geral'
];

const DIFFICULTIES = ['junior', 'easy', 'medium', 'hard'];

export function AdminQuestionForm() {
  const { addQuestion, isLoading } = useCustomQuestions();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState<number | null>(null);
  const [reference, setReference] = useState('');
  const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (answer === index) {
        setAnswer(null);
      } else if (answer !== null && index < answer) {
        setAnswer(answer - 1);
      }
    }
  };

  const handleSubmit = async () => {
    if (!question.trim() || options.some(o => !o.trim()) || answer === null) {
      toast.error('Preencha a pergunta, todas as opções e selecione a resposta correta.');
      return;
    }

    const success = await addQuestion({
      question: question.trim(),
      options: options.map(o => o.trim()),
      answer: answer,
      reference: reference.trim() || undefined,
      explanation: explanation.trim() || undefined,
      category,
      difficulty: difficulty as 'junior' | 'easy' | 'medium' | 'hard',
    });

    if (success) {
      // Reset form
      setQuestion('');
      setOptions(['', '', '', '']);
      setAnswer(null);
      setReference('');
      setExplanation('');
    }
  };

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-success" />
          Adicionar Nova Pergunta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Pergunta */}
        <div>
          <label className="block text-sm font-medium mb-1">Pergunta</label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Digite a pergunta bíblica..."
            rows={3}
          />
        </div>

        {/* Opções */}
        <div>
          <label className="block text-sm font-medium mb-2">Opções de Resposta (Selecione a correta)</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAnswer(index)}
                  className={cn("flex-shrink-0", answer === index && "bg-success text-success-foreground hover:bg-success/90")}
                >
                  {String.fromCharCode(65 + index)}
                </Button>
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <Button variant="outline" size="sm" onClick={handleAddOption} className="mt-2">
              Adicionar Opção
            </Button>
          )}
        </div>

        {/* Metadados */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a Categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dificuldade</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map(diff => (
                  <SelectItem key={diff} value={diff}>
                    {diff.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Referência e Explicação */}
        <div>
          <label className="block text-sm font-medium mb-1">Referência Bíblica (Ex: Gênesis 1:1)</label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Opcional: Livro Capítulo:Verso"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Explicação (Por que a resposta está correta)</label>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Opcional: Explicação detalhada..."
            rows={2}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !question.trim() || options.some(o => !o.trim()) || answer === null}
          className="w-full text-lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <PlusCircle className="w-5 h-5 mr-2" />
          )}
          Salvar Pergunta no Banco
        </Button>
      </CardContent>
    </Card>
  );
}