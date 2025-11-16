import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/quiz';
import { toast } from 'sonner';

// Define a estrutura de inserção para a tabela custom_questions
interface CustomQuestionInsert {
  question: string;
  options: string[];
  answer: number;
  reference?: string;
  explanation?: string;
  category: string;
  difficulty: 'junior' | 'easy' | 'medium' | 'hard';
}

export function useCustomQuestions() {
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_questions')
        .select('*');

      if (error) throw error;

      // Mapeia os dados do banco para o tipo Question
      const mappedQuestions: Question[] = data.map(q => ({
        id: q.id,
        type: 'multiple',
        isKids: false,
        difficulty: q.difficulty as 'junior' | 'easy' | 'medium' | 'hard',
        question: q.question,
        options: q.options,
        answer: q.answer,
        reference: q.reference || '',
        explanation: q.explanation || '',
        category: q.category,
      }));

      setCustomQuestions(mappedQuestions);
      return mappedQuestions;
    } catch (error) {
      console.error('Erro ao buscar perguntas personalizadas:', error);
      toast.error('Erro ao carregar perguntas do administrador.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addQuestion = useCallback(async (newQuestion: CustomQuestionInsert) => {
    setIsLoading(true);
    try {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user.user) {
        toast.error('Você precisa estar logado para adicionar perguntas.');
        return false;
      }
      
      const questionData = {
        ...newQuestion,
        user_id: user.user.id,
        difficulty: newQuestion.difficulty,
        options: newQuestion.options,
      };

      const { error } = await supabase
        .from('custom_questions')
        .insert([questionData]);

      if (error) throw error;

      toast.success('Pergunta adicionada com sucesso!');
      fetchCustomQuestions(); // Atualiza a lista
      return true;
    } catch (error) {
      console.error('Erro ao adicionar pergunta:', error);
      toast.error('Falha ao adicionar pergunta. Verifique os campos.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCustomQuestions]);

  return {
    customQuestions,
    isLoading,
    fetchCustomQuestions,
    addQuestion,
  };
}