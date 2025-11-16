import { useState, useEffect, useCallback } from 'react';
import { Tournament, TournamentEntry } from '@/types/quiz';

function getWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: monday.toISOString(),
    end: sunday.toISOString()
  };
}

export function useTournament() {
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    loadTournament();
  }, []);

  const loadTournament = useCallback(() => {
    const dates = getWeekDates();
    const stored = localStorage.getItem('jb_tournament');
    
    if (stored) {
      const tournament: Tournament = JSON.parse(stored);
      
      // Check if it's still the same week
      if (tournament.weekStart === dates.start) {
        setCurrentTournament(tournament);
        return;
      }
    }
    
    // Create new tournament for this week
    const newTournament: Tournament = {
      id: `week-${dates.start}`,
      weekStart: dates.start,
      weekEnd: dates.end,
      participants: []
    };
    
    localStorage.setItem('jb_tournament', JSON.stringify(newTournament));
    setCurrentTournament(newTournament);
  }, []);

  const addScore = useCallback((name: string, avatar: string, score: number, questionsAnswered: number) => {
    if (!currentTournament) return;

    const entry: TournamentEntry = {
      name,
      avatar,
      score,
      questionsAnswered,
      date: new Date().toISOString()
    };

    const updatedTournament = {
      ...currentTournament,
      participants: [...currentTournament.participants, entry]
    };

    localStorage.setItem('jb_tournament', JSON.stringify(updatedTournament));
    setCurrentTournament(updatedTournament);
  }, [currentTournament]);

  const getRanking = useCallback(() => {
    if (!currentTournament) return [];
    
    return [...currentTournament.participants]
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
  }, [currentTournament]);

  const getTimeRemaining = useCallback(() => {
    if (!currentTournament) return '';
    
    const end = new Date(currentTournament.weekEnd);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Torneio encerrado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h restantes`;
    return `${hours}h restantes`;
  }, [currentTournament]);

  return {
    currentTournament,
    addScore,
    getRanking,
    getTimeRemaining,
  };
}
