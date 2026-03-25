import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { api } from '../../src/api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email) { Alert.alert('Atenção', 'Informe seu e-mail'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: email.toLowerCase().trim() });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-8">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-primary-500 font-medium">← Voltar</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-primary-500 mb-1">Recuperar Senha</Text>
      <Text className="text-gray-500 text-sm mb-8">Enviaremos um link de recuperação para seu e-mail.</Text>

      {sent ? (
        <View className="bg-green-50 rounded-2xl p-5">
          <Text className="text-green-700 font-semibold text-center">E-mail enviado!</Text>
          <Text className="text-green-600 text-sm text-center mt-1">Verifique sua caixa de entrada e siga as instruções.</Text>
          <Button title="Voltar ao Login" onPress={() => router.replace('/(auth)/login')} variant="primary" fullWidth className="mt-4" />
        </View>
      ) : (
        <>
          <Input label="E-mail cadastrado" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="seu@email.com" leftIcon="mail-outline" />
          <Button title="Enviar Link de Recuperação" onPress={handleSubmit} loading={loading} fullWidth variant="primary" size="lg" className="mt-2" />
        </>
      )}
    </SafeAreaView>
  );
}
