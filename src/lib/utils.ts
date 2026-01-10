import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import confetti from 'canvas-confetti'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// XP System
export const getXP = (): number => {
  return parseInt(localStorage.getItem('focusflow-xp') || '0');
};

export const addXP = (amount: number): number => {
  const current = getXP();
  const newXP = current + amount;
  localStorage.setItem('focusflow-xp', newXP.toString());
  return newXP;
};

export const getLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1; // Level up every 100 XP
};

export const getXPForNextLevel = (xp: number): number => {
  const currentLevel = getLevel(xp);
  return currentLevel * 100 - xp;
};

// Confetti System
export const triggerConfetti = (type: 'task' | 'habit' | 'goal' | 'levelUp' = 'task') => {
  const duration = type === 'levelUp' ? 3000 : type === 'goal' ? 2000 : 1500;
  const particleCount = type === 'levelUp' ? 200 : type === 'goal' ? 150 : 100;

  const config = {
    particleCount,
    spread: type === 'levelUp' ? 70 : 60,
    origin: { y: 0.6 },
    colors: type === 'levelUp'
      ? ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']
      : type === 'goal'
      ? ['#00FF00', '#32CD32', '#228B22', '#006400', '#90EE90']
      : ['#4169E1', '#0000FF', '#1E90FF', '#00BFFF', '#87CEEB']
  };

  // Fire multiple bursts for level up
  if (type === 'levelUp') {
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        ...config,
        angle: 60,
        origin: { x: 0, y: 0.6 }
      });
      confetti({
        ...config,
        angle: 120,
        origin: { x: 1, y: 0.6 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  } else {
    confetti(config);
  }
};

// Local Storage Persistence
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`focusflow-${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(`focusflow-${key}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(`focusflow-${key}`);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Date utilities
export const normalizeDate = (date: string | Date): string => {
  if (typeof date === "string" && date.includes("T")) {
    return date.split("T")[0];
  }
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};
