import { useCallback } from 'react';

let voice: SpeechSynthesisVoice | null = null;

const loadVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  const ptBRVoice = voices.find(v => v.lang === 'pt-BR' && (v.name.includes('Google') || v.name.includes('Microsoft')));
  const ptVoice = voices.find(v => v.lang.startsWith('pt-'));
  voice = ptBRVoice || ptVoice || voices.find(v => v.default) || null;
};

// Pré-carrega as vozes
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoice;
  }
}

export function useNarration() {
  const speak = useCallback((text: string) => {
    if (!voice || !text || !window.speechSynthesis) {
      console.warn("A narração não está disponível ou o texto está vazio.");
      return;
    }
    try {
      window.speechSynthesis.cancel(); // Para qualquer fala anterior
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Erro na síntese de voz:", error);
    }
  }, []);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, cancel };
}