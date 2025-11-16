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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, toast]);

  const createSession = useCallback(async (
    hostPlayer: Player,
    teamName: string,
    maxPlayers: number,
    chapterId?: string
  ) => {
    const userId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    setMyUserId(userId);
    
    const newSession: CoopSession = {
      id: sessionId,
      hostId: userId, // Host is now identified by their userId
      teamName,
      maxPlayers,
      currentPlayers: [hostPlayer],
      sharedLives: 6, // Shared lives for team
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
  }, []);

  const joinSession = useCallback(async (
    sessionId: string,
    player: Player
  ) => {
    const userId = crypto.randomUUID();
    setMyUserId(userId);
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

    // Mock session for now - in production, fetch from database
    setSession({
      id: sessionId,
      hostId: '', // Will be updated by presence sync if host is present
      teamName: 'Team',
      maxPlayers: 4,
      currentPlayers: [],
      sharedLives: 6,
      sharedPowerUps: {},
      status: 'waiting',
      createdAt: new Date().toISOString(),
    });

    setIsHost(false);
  }, []);

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
  }, [session]);

  const currentPlayer = useMemo(() => {
    return players.find(p => p.userId === myUserId) || null;
  }, [players, myUserId]);

  return {
    session,
    players,
    isHost,
    currentPlayer,
    myUserId, // Exportando myUserId
    createSession,
    joinSession,
    toggleReady,
    startGame,
    updateLives,
    usePowerUp,
    leaveSession,
  };
}