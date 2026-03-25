import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { storage } from '../src/utils/storage';
import { api } from '../src/api/client';
import { ConsentModal } from '../src/components/lgpd/ConsentModal';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 5 * 60 * 1000 } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppContent />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { setUser, setLoading } = useAuthStore();
  const { setConsentGiven } = useSettingsStore();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const token = await storage.getAccessToken();
        if (token) {
          const { data } = await api.get<{ data: unknown }>('/api/users/me') as { data: unknown };
          setUser(data as Parameters<typeof setUser>[0]);

          const consentShown = await storage.isConsentShown();
          if (!consentShown) setShowConsent(true);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function handleConsentAccept() {
    await storage.setConsentShown();
    setConsentGiven(true);
    setShowConsent(false);
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="simulado/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="simulado/[id]" options={{ headerShown: false }} />
      </Stack>
      <ConsentModal visible={showConsent} onAccept={handleConsentAccept} />
    </>
  );
}
