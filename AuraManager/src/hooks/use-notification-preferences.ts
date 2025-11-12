import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationPreferences {
  soundEnabled: boolean;
  soundVolume: number;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
}

export const useNotificationPreferences = create<NotificationPreferences>()(
  persist(
    (set) => ({
      soundEnabled: true,
      soundVolume: 0.5,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: volume }),
    }),
    {
      name: 'notification-preferences',
    }
  )
);
