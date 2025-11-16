import { useCallback, useRef } from 'react';

export function useGameSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playCorrect = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }, [getAudioContext]);

  const playWrong = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }, [getAudioContext]);

  const playAchievement = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(freq, now + i * 0.1);
      gainNode.gain.setValueAtTime(0.2, now + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      
      oscillator.start(now + i * 0.1);
      oscillator.stop(now + i * 0.1 + 0.3);
    });
  }, [getAudioContext]);

  const playTimerWarning = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(880, now); // A5
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.setValueAtTime(0, now + 0.05);
    gainNode.gain.setValueAtTime(0.15, now + 0.1);
    gainNode.gain.setValueAtTime(0, now + 0.15);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, [getAudioContext]);

  const playVictory = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const melody = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.15 },  // E5
      { freq: 783.99, time: 0.3 },   // G5
      { freq: 1046.50, time: 0.45 }, // C6
      { freq: 783.99, time: 0.6 },   // G5
      { freq: 1046.50, time: 0.75 }, // C6
    ];
    
    melody.forEach(({ freq, time }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(freq, now + time);
      gainNode.gain.setValueAtTime(0.25, now + time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + time + 0.3);
      
      oscillator.start(now + time);
      oscillator.stop(now + time + 0.3);
    });
  }, [getAudioContext]);

  return {
    playCorrect,
    playWrong,
    playAchievement,
    playTimerWarning,
    playVictory,
  };
}
