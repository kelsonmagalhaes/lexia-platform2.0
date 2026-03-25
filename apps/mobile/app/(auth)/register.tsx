import React, { useState } from 'react';
import { Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/api/client';
import { storage } from '../../src/utils/storage';

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', password: '', institution: '', period: '1' });
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleRegister() {
    if (!form.name || !form.email || !form.password) { Alert.alert('Atenção', 'Preencha nome, e-mail e senha'); return; }
    setLoading(true);
    try {
      const { data } = await api.post<{ data: { user: Parameters<typeof setUser>[0]; tokens: { accessToken: string; refreshToken: string } } }>('/api/auth/register', {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        institutionCustom: form.institution.trim() || undefined,
        currentPeriod: parseInt(form.period) || 1,
      });
      await storage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser(data.user);
      router.replace('/onboarding/index');
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-8" keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-primary-500 font-medium">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-primary-500 mb-1">Criar Conta</Text>
        <Text className="text-gray-500 text-sm mb-6">Comece sua jornada jurídica</Text>

        <Input label="Nome completo" value={form.name} onChangeText={(v) => update('name', v)} placeholder="Seu nome" leftIcon="person-outline" />
        <Input label="E-mail" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="seu@email.com" leftIcon="mail-outline" />
        <Input label="Senha" value={form.password} onChangeText={(v) => update('password', v)} secureToggle placeholder="Mínimo 8 caracteres" leftIcon="lock-closed-outline" />
        <Input label="Instituição (opcional)" value={form.institution} onChangeText={(v) => update('institution', v)} placeholder="Ex: UFMG, PUC Minas..." leftIcon="school-outline" />
        <Input label="Período atual" value={form.period} onChangeText={(v) => update('period', v)} keyboardType="numeric" placeholder="1 a 10" leftIcon="book-outline" />

        <Button title="Criar Conta" onPress={handleRegister} loading={loading} fullWidth variant="primary" size="lg" className="mt-2 mb-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
