import confetti from 'canvas-confetti';

export function useCelebration() {
  const celebrateLevelUp = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });
    }, 250);
  };

  const celebrateAchievement = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#8BC34A', '#CDDC39'],
      zIndex: 9999,
    });
  };

  const celebratePowerUp = () => {
    const end = Date.now() + 1000;
    const colors = ['#9C27B0', '#E91E63', '#F44336'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const celebrateVictory = () => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#4CAF50', '#2196F3'],
        zIndex: 9999,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#4CAF50', '#2196F3'],
        zIndex: 9999,
      });
    }, 50);
  };

  return {
    celebrateLevelUp,
    celebrateAchievement,
    celebratePowerUp,
    celebrateVictory,
  };
}
