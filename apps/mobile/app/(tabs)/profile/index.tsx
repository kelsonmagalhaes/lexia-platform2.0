import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/store/authStore';
import { api } from '../../../src/api/client';
import { Card } from '../../../src/components/ui/Card';
import { XPBar } from '../../../src/components/gamification/XPBar';
import { getLevelFromXp } from '@lexstudy/shared';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const levelInfo = getLevelFromXp(user?.xp ?? 0);

  function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await api.post('/api/auth/logout', {}); await logout(); router.replace('/(auth)/login'); } },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-legal-light">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-primary-500 px-6 pt-6 pb-16">
          <Text className="text-white text-xl font-bold">Perfil</Text>
        </View>

        <View className="px-4 -mt-10">
          <Card variant="elevated" className="mb-4">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center mr-4">
                <Text className="text-white text-2xl font-bold">{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{user?.name}</Text>
                <Text className="text-sm text-gray-500">{user?.email}</Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: levelInfo.color }} />
                  <Text className="text-xs text-gray-600">{levelInfo.label}</Text>
                </View>
              </View>
            </View>
            <XPBar xp={user?.xp ?? 0} />
          </Card>

          <Card variant="bordered" className="mb-4">
            <Text className="font-bold text-gray-900 mb-3">Dados do Perfil</Text>
            <InfoRow icon="school-outline" label="Instituição" value={user?.institutionCustom ?? 'Não informado'} />
            <InfoRow icon="book-outline" label="Período" value={`${user?.currentPeriod ?? 1}º Período`} />
            <InfoRow icon="flame-outline" label="Streak" value={`${user?.streakDays ?? 0} dias`} />
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile/edit')} className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
              <Ionicons name="create-outline" size={18} color="#1A2B4A" />
              <Text className="ml-2 text-primary-500 font-medium text-sm">Editar Perfil</Text>
            </TouchableOpacity>
          </Card>

          <Card variant="bordered" className="mb-4">
            <Text className="font-bold text-gray-900 mb-3">Meu Estudo</Text>
            <MenuItem icon="stats-chart-outline" label="Estatísticas" onPress={() => router.push('/(tabs)/home/stats')} />
            <MenuItem icon="trophy-outline" label="Metas" onPress={() => router.push('/(tabs)/profile/goals')} />
            <MenuItem icon="time-outline" label="Histórico" onPress={() => router.push('/(tabs)/profile/history')} />
          </Card>

          <Card variant="bordered" className="mb-4">
            <Text className="font-bold text-gray-900 mb-3">Configurações</Text>
            <MenuItem icon="shield-checkmark-outline" label="LGPD e Privacidade" onPress={() => router.push('/(tabs)/profile/settings/lgpd')} />
            <MenuItem icon="document-text-outline" label="Termos de Uso" onPress={() => router.push('/(tabs)/profile/settings/terms')} />
            <MenuItem icon="lock-closed-outline" label="Política de Privacidade" onPress={() => router.push('/(tabs)/profile/settings/privacy')} />
          </Card>

          <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center bg-red-50 rounded-2xl py-4 mb-8">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-2 text-red-500 font-semibold">Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center mb-2">
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={16} color="#6B7280" />
      <Text className="text-sm text-gray-500 ml-2">{label}: </Text>
      <Text className="text-sm font-medium text-gray-800 flex-1" numberOfLines={1}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center py-3 border-b border-gray-50" activeOpacity={0.7}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color="#1A2B4A" />
      <Text className="ml-3 flex-1 text-sm text-gray-800">{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
