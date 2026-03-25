import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../src/api/client';
import { Card } from '../../../src/components/ui/Card';

export default function PeriodScreen() {
  const { period } = useLocalSearchParams<{ period: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['curriculum', period],
    queryFn: () => api.get<{ data: { period: number; label: string; disciplines: Array<{ id?: string; name: string; isEad?: boolean }> } }>(`/api/curriculum/${period}`),
  });

  const periodData = (data as { data: { period: number; label: string; disciplines: Array<{ id?: string; name: string; isEad?: boolean }> } } | undefined)?.data;

  return (
    <SafeAreaView className="flex-1 bg-legal-light">
      <View className="bg-primary-500 px-6 py-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">{periodData?.label ?? `${period}º Período`}</Text>
          <Text className="text-blue-200 text-sm">{periodData?.disciplines.length ?? 0} disciplinas</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {isLoading ? (
          <Text className="text-center text-gray-400 mt-10">Carregando...</Text>
        ) : (
          periodData?.disciplines.map((disc, idx) => (
            <TouchableOpacity
              key={disc.id ?? idx}
              onPress={() => disc.id && router.push({ pathname: '/(tabs)/courses/discipline/[id]', params: { id: disc.id } })}
              activeOpacity={0.8}
            >
              <Card variant="bordered" className="mb-3 flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center mr-3">
                  <Ionicons name="book-outline" size={20} color="#1A2B4A" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-sm">{disc.name}</Text>
                  {disc.isEad && <Text className="text-xs text-blue-500 mt-0.5">EaD</Text>}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </Card>
            </TouchableOpacity>
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
