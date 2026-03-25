import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/store/authStore';
import { api } from '../../../src/api/client';
import { Card } from '../../../src/components/ui/Card';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { XPBar } from '../../../src/components/gamification/XPBar';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get<{ data: Record<string, unknown> }>('/api/stats/me'),
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get<{ data: Array<Record<string, unknown>> }>('/api/goals'),
  });

  const statsData = (stats as { data: Record<string, unknown> } | undefined)?.data;
  const goalsData = (goals as { data: Array<Record<string, unknown>> } | undefined)?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-legal-light">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-primary-500 px-6 pt-6 pb-10">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-blue-200 text-sm">Bem-vindo de volta,</Text>
              <Text className="text-white text-xl font-bold">{user?.name?.split(' ')[0] ?? 'Estudante'}</Text>
            </View>
            <View className="bg-white/20 rounded-full px-3 py-1">
              <Text className="text-white text-sm font-medium">{user?.currentPeriod ?? 1}º Período</Text>
            </View>
          </View>
        </View>

        <View className="px-4 -mt-6">
          <Card variant="elevated" className="mb-4">
            <XPBar xp={user?.xp ?? 0} />
          </Card>

          <View className="flex-row gap-3 mb-4">
            <QuickStat icon="flame" label="Streak" value={`${user?.streakDays ?? 0} dias`} color="#F59E0B" />
            <QuickStat icon="checkmark-circle" label="Aulas" value={String(statsData?.progress ? (statsData.progress as Record<string, unknown>).completed_lessons ?? 0 : 0)} color="#10B981" />
            <QuickStat icon="trophy" label="Nível" value={user?.level ?? 'junior'} color="#C9A84C" />
          </View>

          {goalsData.length > 0 && (
            <Card variant="bordered" className="mb-4">
              <Text className="font-bold text-gray-900 mb-3">Metas Ativas</Text>
              {goalsData.slice(0, 2).map((g) => (
                <View key={String(g.id)} className="mb-3">
                  <Text className="text-sm text-gray-700 mb-1">{String(g.title)}</Text>
                  <ProgressBar
                    progress={Math.round((Number(g.current_value) / Number(g.target_value)) * 100)}
                    label={`${g.current_value}/${g.target_value} ${g.unit}`}
                  />
                </View>
              ))}
            </Card>
          )}

          <View className="flex-row gap-3 mb-6">
            <ActionButton icon="book-outline" label="Estudar" onPress={() => router.push('/(tabs)/courses')} />
            <ActionButton icon="sparkles-outline" label="LEX IA" onPress={() => router.push('/(tabs)/lex-ia')} />
            <ActionButton icon="document-text-outline" label="Simulado" onPress={() => router.push('/simulado/index')} />
            <ActionButton icon="library-outline" label="Vade Mecum" onPress={() => router.push('/(tabs)/vade-mecum')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickStat({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <Card variant="bordered" className="flex-1 items-center py-3">
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color={color} />
      <Text className="text-xs text-gray-500 mt-1">{label}</Text>
      <Text className="text-sm font-bold text-gray-900 mt-0.5">{value}</Text>
    </Card>
  );
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-1 items-center bg-white rounded-2xl py-4 border border-gray-100" activeOpacity={0.7}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={24} color="#1A2B4A" />
      <Text className="text-xs text-gray-700 mt-1 font-medium">{label}</Text>
    </TouchableOpacity>
  );
}
