import { useState, useEffect } from 'react';
import { StoryChapter } from '@/types/quiz';
import { useLocalStorage } from './useLocalStorage';

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'genesis',
    title: 'No Princípio',
    description: 'A criação do mundo e os primeiros dias da humanidade',
    narrative: 'No princípio criou Deus os céus e a terra... Explore os mistérios da criação e teste seu conhecimento sobre o livro de Gênesis.',
    unlocked: true,
    completed: false,
    requiredScore: 0,
    questions: [],
    cutscene: {
      text: 'No princípio, Deus criou os céus e a terra. E disse Deus: Haja luz. E houve luz.',
      characterName: 'Narrador'
    }
  },
  {
    id: 'exodus',
    title: 'A Libertação',
    description: 'A jornada de Moisés e a libertação do povo de Israel',
    narrative: 'Acompanhe a épica jornada de Moisés liderando o povo hebreu para fora do Egito.',
    unlocked: false,
    completed: false,
    requiredScore: 500,
    questions: [],
    cutscene: {
      text: 'E disse o Senhor a Moisés: Deixa ir o meu povo, para que me sirvam.',
      characterName: 'Moisés'
    }
  },
  {
    id: 'prophets',
    title: 'Os Profetas',
    description: 'Mensageiros de Deus e suas poderosas mensagens',
    narrative: 'Conheça os grandes profetas e suas mensagens que ecoam através dos tempos.',
    unlocked: false,
    completed: false,
    requiredScore: 1000,
    questions: [],
    cutscene: {
      text: 'Eis que envio o meu mensageiro, que preparará o caminho diante de mim.',
      characterName: 'Profeta'
    }
  },
  {
    id: 'jesus',
    title: 'O Messias',
    description: 'A vida e os ensinamentos de Jesus Cristo',
    narrative: 'Caminhe com Jesus através dos evangelhos e descubra seus ensinamentos transformadores.',
    unlocked: false,
    completed: false,
    requiredScore: 1500,
    questions: [],
    cutscene: {
      text: 'Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai senão por mim.',
      characterName: 'Jesus'
    }
  },
  {
    id: 'apostles',
    title: 'Os Apóstolos',
    description: 'A expansão da igreja primitiva e seus heróis',
    narrative: 'Testemunhe o nascimento da igreja e a coragem dos primeiros discípulos.',
    unlocked: false,
    completed: false,
    requiredScore: 2000,
    questions: [],
    cutscene: {
      text: 'Ide por todo o mundo e pregai o evangelho a toda criatura.',
      characterName: 'Pedro'
    }
  },
  {
    id: 'revelation',
    title: 'O Apocalipse',
    description: 'As visões finais e a promessa da eternidade',
    narrative: 'Explore as visões proféticas e o triunfo final do bem sobre o mal.',
    unlocked: false,
    completed: false,
    requiredScore: 2500,
    questions: [],
    cutscene: {
      text: 'Eis que faço novas todas as coisas. Eu sou o Alfa e o Ômega.',
      characterName: 'João'
    }
  }
];

export function useStoryMode() {
  const [chapters, setChapters] = useLocalStorage<StoryChapter[]>('jb_story_chapters', STORY_CHAPTERS);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);

  const unlockChapter = (chapterId: string) => {
    setChapters(prev => 
      prev.map(ch => 
        ch.id === chapterId ? { ...ch, unlocked: true } : ch
      )
    );
  };

  const completeChapter = (chapterId: string) => {
    setChapters(prev => 
      prev.map(ch => 
        ch.id === chapterId ? { ...ch, completed: true } : ch
      )
    );
  };

  const checkUnlocks = (totalScore: number) => {
    setChapters(prev => 
      prev.map(ch => ({
        ...ch,
        unlocked: ch.unlocked || totalScore >= ch.requiredScore
      }))
    );
  };

  return {
    chapters,
    currentChapter,
    setCurrentChapter,
    unlockChapter,
    completeChapter,
    checkUnlocks
  };
}
