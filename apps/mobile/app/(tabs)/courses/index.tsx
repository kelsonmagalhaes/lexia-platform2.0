import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../src/api/client';
import { Card } from '../../../src/components/ui/Card';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { DEFAULT_CURRICULUM } from '@lexstudy/shared';

export default function CoursesScreen() {
  const { data: progressData } = useQuery({
    queryKey: ['progress-summary'],
    queryFn: () => api.get<{ data: Array<Record<string, unknown>> }>('/api/progress/summary'),
  });

  const progress = (progressData as { data: Array<Record<string, unknown>> } | undefined)?.data ?? [];

  const progressByPeriod = DEFAULT_CURRICULUM.map((period) => {
    const disciplineNames = period.disciplines.map((d) => d.name);
    const periodProgress = progress.filter((p) => disciplineNames.includes(String(p.discipline_name)));
    const totalLessons = periodProgress.reduce((sum, p) => sum + Number(p.total_lessons ?? 0), 0);
    const completedLessons = periodProgress.reduce((sum, p) => sum + Number(p.completed_lessons ?? 0), 0);
    const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { period: period.period, label: period.label, disciplineCount: period.disciplines.length, pct };
  });

  return (
    <SafeAreaView className="flex-1 bg-legal-light">
      <View className="bg-primary-500 px-6 py-5">
        <Text className="text-white text-xl font-bold">Cursos</Text>
        <Text className="text-blue-200 text-sm mt-1">Grade curricular completa</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          className="flex-row items-center bg-gold-400/20 border border-gold-400 rounded-2xl p-4 mb-4"
          onPress={() => router.push('/(tabs)/courses/pdf-upload')}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#A8853A" />
          <View className="ml-3 flex-1">
            <Text className="font-semibold text-primary-500">Upload de PDF</Text>
            <Text className="text-xs text-gray-600">Gere resumo e quiz com LEX IA (até 3 por dia)</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#A8853A" />
        </TouchableOpacity>

        {progressByPeriod.map((p) => (
          <TouchableOpacity
            key={p.period}
            onPress={() => router.push({ pathname: '/(tabs)/courses/[period]', params: { period: String(p.period) } })}
            activeOpacity={0.8}
          >
            <Card variant="elevated" className="mb-3">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="font-bold text-primary-500 text-base">{p.label}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{p.disciplineCount} disciplinas</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-sm font-semibold text-gold-400 mr-2">{p.pct}%</Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </View>
              </View>
              <ProgressBar progress={p.pct} showPercent={false} />
            </Card>
          </TouchableOpacity>
        ))}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
