import { Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (!isLoading && isAuthenticated) return <Redirect href="/(tabs)/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
