import { useLocalStorage } from './useLocalStorage';

export function useReviewHistory() {
  const [incorrectIds, setIncorrectIds] = useLocalStorage<string[]>('jb_review_history', []);

  const addIncorrectQuestion = (questionId: string) => {
    setIncorrectIds(prev => {
      // Evita duplicatas e limita o tamanho da lista
      if (prev.includes(questionId)) return prev;
      const updatedList = [questionId, ...prev];
      return updatedList.slice(0, 200); // Mantém as últimas 200 perguntas erradas
    });
  };

  const getIncorrectQuestionIds = (): string[] => {
    return incorrectIds;
  };

  const hasIncorrectQuestions = (): boolean => {
    return incorrectIds.length > 0;
  }

  return { addIncorrectQuestion, getIncorrectQuestionIds, hasIncorrectQuestions };
}