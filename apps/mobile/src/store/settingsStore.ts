import { create } from 'zustand';

interface SettingsState {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  adsEnabled: boolean;
  consentGiven: boolean;
  toggleDarkMode: () => void;
  setNotifications: (enabled: boolean) => void;
  setAdsEnabled: (enabled: boolean) => void;
  setConsentGiven: (given: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isDarkMode: false,
  notificationsEnabled: true,
  adsEnabled: true,
  consentGiven: false,
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  setNotifications: (notificationsEnabled) => set({ notificationsEnabled }),
  setAdsEnabled: (adsEnabled) => set({ adsEnabled }),
  setConsentGiven: (consentGiven) => set({ consentGiven }),
}));
