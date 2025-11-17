import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/quiz';
import { useToast } from './use-toast';

export interface CoopSession {
  id: string;
  hostId: string;
  teamName: string;
  maxPlayers: number;
  currentPlayers: Player[];
  sharedLives: number;
  sharedPowerUps: Record<string, number>;
  currentChapter?: string;
  status: 'waiting' | 'playing' | 'completed';
  createdAt: string;
}

export interface CoopPlayer extends Player {
  userId: string;
  isReady: boolean;
}

export function useCoopMode() {
  const [session, setSession] = useState<CoopSession | null>(null);
  const [players, setPlayers] = useState<CoopPlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Função auxiliar para obter o ID do usuário (mockado para testes)
  const getOrCreateUserId = useCallback(() => {
    let userId = localStorage.getItem('jb_coop_user_id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('jb_coop_user_id', userId);
    }
    setMyUserId(userId);
    return userId;
  }, []);

  useEffect(() => {
    getOrCreateUserId();
  }, [getOrCreateUserId]);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`coop-session-${session.id}`)
      .on(
        'presence',
        { event: 'sync' },
        () => {
          const state = channel.presenceState();
          const activePlayers: CoopPlayer[] = [];
          
          Object.values(state).forEach((presences: any) => {
            presences.forEach((presence: any) => {
              activePlayers.push(presence.payload as CoopPlayer);
            });
          });
          
          setPlayers(activePlayers);
          
          // Atualiza o hostId se o host original sair e um novo for necessário (lógica simplificada)
          if (activePlayers.length > 0 && !activePlayers.some(p => p.userId === session.hostId)) {
            // Se o host original saiu, o primeiro jogador ativo se torna o novo host
            const newHostId = activePlayers[0].userId;
            setSession(prev => prev ? { ...prev, hostId: newHostId } : null);
            setIsHost(newHostId === myUserId);
          }
        }
      )
      .on(
        'presence',
        { event: 'join' },
        ({ newPresences }) => {
          const newPlayer = (newPresences[0] as any).payload as CoopPlayer;
          toast({
            title: "Novo jogador!",
            description: `${newPlayer.name} entrou no time.`,
          });
        }
      )
      .on(
        'presence',
        { event: 'leave' },
        ({ leftPresences }) => {
          const leftPlayer = (leftPresences[0] as any).payload as CoopPlayer;
          toast({
            title: "Jogador saiu",
            description: `${leftPlayer.name} deixou o time.`,
            variant: "destructive",
          });
        }
      )
      .on(
        'broadcast',
        { event: 'lives-update' },
        ({ payload }) => {
          setSession(prev => prev ? { ...prev, sharedLives: payload.lives } : null);
        }
      )
      .on(
        'broadcast',
        { event: 'powerup-used' },
        ({ payload }) => {
          setSession(prev => prev ? { 
            ...prev, 
            sharedPowerUps: payload.powerUps 
          } : null);
          toast({
            title: "Power-up usado!",
            description: `${payload.playerName} usou ${payload.powerUpName}`,
          });
        }
      )
      .on(
        'broadcast',
        { event: 'game-start' },
        () => {
          setSession(prev => prev ? { ...prev, status: 'playing' } : null);
          // O Index.tsx deve capturar a mudança de estado para iniciar o quiz
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, myUserId, toast]);

  const createSession = useCallback(async (
    hostPlayer: Player,
    teamName: string,
    maxPlayers: number,
    chapterId?: string
  ) => {
    const userId = getOrCreateUserId();
    const sessionId = crypto.randomUUID().substring(0, 8).toUpperCase(); // ID mais curto e amigável
    
    const newSession: CoopSession = {
      id: sessionId,
      hostId: userId,
      teamName,
      maxPlayers,
      currentPlayers: [hostPlayer],
      sharedLives: 6,
      sharedPowerUps: {},
      currentChapter: chapterId,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };

    setSession(newSession);
    setIsHost(true);

    const channel = supabase.channel(`coop-session-${sessionId}`);
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          ...hostPlayer,
          userId: userId,
          isReady: false,
        } as CoopPlayer);
      }
    });

    return sessionId;
  }, [getOrCreateUserId]);

  const joinSession = useCallback(async (
    sessionId: string,
    player: Player
  ) => {
    const userId = getOrCreateUserId();
    
    // Mock session data for the joining player (in a real app, this would be fetched)
    const mockSession: CoopSession = {
      id: sessionId,
      hostId: '', // Será preenchido pelo presence sync
      teamName: 'Time Bíblico',
      maxPlayers: 4,
      currentPlayers: [],
      sharedLives: 6,
      sharedPowerUps: {},
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    setSession(mockSession);
    setIsHost(false);

    const channel = supabase.channel(`coop-session-${sessionId}`);
    
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          ...player,
          userId,
          isReady: false,
        } as CoopPlayer);
      }
    });
  }, [getOrCreateUserId]);

  const toggleReady = useCallback(async () => {
    if (!session || !myUserId) return;
    
    const channel = supabase.channel(`coop-session-${session.id}`);
    const currentPresence = players.find(p => p.userId === myUserId);
    
    if (currentPresence) {
      await channel.track({
        ...currentPresence,
        isReady: !currentPresence.isReady,
      });
    }
  }, [session, players, myUserId]);

  const startGame = useCallback(async () => {
    if (!session || !isHost) return;
    
    const allReady = players.every(p => p.isReady);
    if (!allReady) {
      toast({
        title: "Aguarde!",
        description: "Todos os jogadores precisam estar prontos.",
        variant: "destructive",
      });
      return false;
    }

    const channel = supabase.channel(`coop-session-${session.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'game-start',
      payload: {},
    });

    setSession(prev => prev ? { ...prev, status: 'playing' } : null);
    return true;
  }, [session, isHost, players, toast]);

  const updateLives = useCallback(async (newLives: number) => {
    if (!session) return;
    
    const channel = supabase.channel(`coop-session-${session.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'lives-update',
      payload: { lives: newLives },
    });
    
    setSession(prev => prev ? { ...prev, sharedLives: newLives } : null);
  }, [session]);

  const usePowerUp = useCallback(async (
    powerUpId: string,
    powerUpName: string,
    playerName: string
  ) => {
    if (!session) return;
    
    const newPowerUps = {
      ...session.sharedPowerUps,
      [powerUpId]: (session.sharedPowerUps[powerUpId] || 0) + 1,
    };

    const channel = supabase.channel(`coop-session-${session.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'powerup-used',
      payload: {
        powerUps: newPowerUps,
        powerUpName,
        playerName,
      },
    });
    
    setSession(prev => prev ? { ...prev, sharedPowerUps: newPowerUps } : null);
  }, [session]);

  const leaveSession = useCallback(async () => {
    if (!session) return;
    
    const channel = supabase.channel(`coop-session-${session.id}`);
    await channel.untrack();
    await supabase.removeChannel(channel);
    
    setSession(null);
    setPlayers([]);
    setIsHost(false);
    setMyUserId(null);
    localStorage.removeItem('jb_coop_user_id'); // Limpa o ID para que um novo seja gerado
  }, [session]);

  const currentPlayer = useMemo(() => {
    return players.find(p => p.userId === myUserId) || null;
  }, [players, myUserId]);

  return {
    session,
    setSession, // Exportado para corrigir erros 2, 4, 5, 6
    isHost,
    setIsHost, // Exportado para corrigir erro 3
    players,
    currentPlayer,
    myUserId,
    createSession,
    joinSession,
    toggleReady,
    startGame,
    updateLives,
    usePowerUp,
    leaveSession,
  };
}