import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/api/client';
import { storage } from '../../src/utils/storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Atenção', 'Preencha e-mail e senha'); return; }
    setLoading(true);
    try {
      const { data } = await api.post<{ data: { user: Parameters<typeof setUser>[0]; tokens: { accessToken: string; refreshToken: string } } }>('/api/auth/login', { email: email.toLowerCase().trim(), password });
      await storage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser(data.user);
      router.replace('/(tabs)/home');
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-500">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-16 pb-8">
          <View className="items-center mb-12">
            <Text className="text-4xl font-bold text-gold-400">LexStudy</Text>
            <Text className="text-sm text-blue-200 mt-1">Academia Jurídica</Text>
          </View>

          <View className="bg-white rounded-3xl p-6">
            <Text className="text-2xl font-bold text-primary-500 mb-1">Bem-vindo</Text>
            <Text className="text-gray-500 text-sm mb-6">Entre na sua conta para continuar</Text>

            <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="seu@email.com" leftIcon="mail-outline" />
            <Input label="Senha" value={password} onChangeText={setPassword} secureToggle placeholder="Sua senha" leftIcon="lock-closed-outline" />

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} className="mb-6">
              <Text className="text-primary-500 text-sm text-right font-medium">Esqueci a senha</Text>
            </TouchableOpacity>

            <Button title="Entrar" onPress={handleLogin} loading={loading} fullWidth variant="primary" size="lg" />

            <View className="flex-row justify-center mt-5">
              <Text className="text-gray-500 text-sm">Não tem conta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-primary-500 font-semibold text-sm">Cadastrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
