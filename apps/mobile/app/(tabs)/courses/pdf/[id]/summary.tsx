import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../../../src/api/client';

export default function PdfSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['pdf-summary', id],
    queryFn: () => api.get<{ data: { summary_md: string; filename: string } }>(`/api/pdf/${id}/summary`),
  });
  const pdfData = (data as { data: { summary_md: string; filename: string } } | undefined)?.data;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-5 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A2B4A" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-primary-500 flex-1" numberOfLines={1}>{pdfData?.filename ?? 'Resumo'}</Text>
      </View>
      <ScrollView className="flex-1 px-6 py-4">
        {isLoading ? (
          <Text className="text-center text-gray-400 mt-10">Carregando resumo...</Text>
        ) : (
          <Text className="text-sm text-gray-800 leading-6">{pdfData?.summary_md ?? 'Resumo não disponível.'}</Text>
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
