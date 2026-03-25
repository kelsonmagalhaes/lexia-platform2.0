import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../../src/components/ui/Button';
import { api } from '../../../../src/api/client';
import { useAuthStore } from '../../../../src/store/authStore';

export default function LgpdScreen() {
  const { logout } = useAuthStore();
  const [deleting, setDeleting] = useState(false);

  const { data: consents } = useQuery({
    queryKey: ['consents'],
    queryFn: () => api.get<{ data: Array<{ consent_type: string; accepted: boolean; accepted_at: string }> }>('/api/consent'),
  });

  const consentList = (consents as { data: Array<{ consent_type: string; accepted: boolean; accepted_at: string }> } | undefined)?.data ?? [];

  async function handleExportData() {
    try {
      await api.get('/api/users/me/export');
      Alert.alert('Sucesso', 'Seus dados foram exportados.');
    } catch {
      Alert.alert('Erro', 'Não foi possível exportar os dados.');
    }
  }

  async function handleDeleteAccount() {
    Alert.alert('Excluir Conta', 'Esta ação é IRREVERSÍVEL. Todos os seus dados serão anonimizados conforme a LGPD.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete('/api/users/me');
            await logout();
            router.replace('/(auth)/login');
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir a conta.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-5 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A2B4A" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-primary-500">LGPD e Privacidade</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-sm text-gray-600 mb-4">
          Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem controle total sobre seus dados pessoais.
        </Text>

        <Text className="font-bold text-gray-900 mb-3">Meus Consentimentos</Text>
        {consentList.map((c) => (
          <View key={c.consent_type} className="flex-row items-center py-3 border-b border-gray-50">
            <Ionicons name={c.accepted ? 'checkmark-circle' : 'close-circle'} size={20} color={c.accepted ? '#10B981' : '#EF4444'} />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium capitalize text-gray-800">{c.consent_type}</Text>
              {c.accepted_at && <Text className="text-xs text-gray-400">{new Date(c.accepted_at).toLocaleDateString('pt-BR')}</Text>}
            </View>
          </View>
        ))}

        <View className="mt-6 gap-3">
          <Button title="Exportar Meus Dados (JSON)" onPress={handleExportData} variant="outline" fullWidth />
          <Button title="Exportar Desempenho (PDF)" onPress={() => api.get('/api/stats/export-pdf')} variant="outline" fullWidth />
          <View className="h-1" />
          <Button title="Excluir Minha Conta" onPress={handleDeleteAccount} loading={deleting} fullWidth variant="outline" />
        </View>
        <Text className="text-xs text-gray-400 text-center mt-4 mb-8">
          A exclusão é irreversível. Seus dados serão anonimizados conforme o Art. 16 da LGPD.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
