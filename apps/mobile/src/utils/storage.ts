import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'lexstudy_access_token',
  REFRESH_TOKEN: 'lexstudy_refresh_token',
  USER_ID: 'lexstudy_user_id',
  ONBOARDING_DONE: 'lexstudy_onboarding_done',
  CONSENT_SHOWN: 'lexstudy_consent_shown',
} as const;

export const storage = {
  async setTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async clearTokens() {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]);
  },

  async setUserId(userId: string) {
    return SecureStore.setItemAsync(KEYS.USER_ID, userId);
  },

  async getUserId(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.USER_ID);
  },

  async setOnboardingDone() {
    return SecureStore.setItemAsync(KEYS.ONBOARDING_DONE, 'true');
  },

  async isOnboardingDone(): Promise<boolean> {
    const val = await SecureStore.getItemAsync(KEYS.ONBOARDING_DONE);
    return val === 'true';
  },

  async setConsentShown() {
    return SecureStore.setItemAsync(KEYS.CONSENT_SHOWN, 'true');
  },

  async isConsentShown(): Promise<boolean> {
    const val = await SecureStore.getItemAsync(KEYS.CONSENT_SHOWN);
    return val === 'true';
  },
};
