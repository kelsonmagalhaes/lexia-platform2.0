import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../src/api/client';
import { Card } from '../../../src/components/ui/Card';
import { LAWS } from '@lexstudy/shared';

export default function VadeMecumScreen() {
  const [search, setSearch] = useState('');
  const [selectedLaw, setSelectedLaw] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vade-mecum-search', search, selectedLaw],
    queryFn: () => search.length > 2
      ? api.get<{ data: Array<{ law_code: string; article_number: string; article_text: string }> }>(`/api/vade-mecum/search?q=${encodeURIComponent(search)}${selectedLaw ? `&lawCode=${selectedLaw}` : ''}`)
      : Promise.resolve({ data: [] }),
    enabled: search.length > 2,
  });

  const results = (data as { data: Array<{ law_code: string; article_number: string; article_text: string }> } | undefined)?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-legal-light">
      <View className="bg-primary-500 px-6 py-5">
        <Text className="text-white text-xl font-bold">Vade Mecum</Text>
        <Text className="text-blue-200 text-sm mt-1">Legislação brasileira</Text>
      </View>

      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-2 border border-gray-200">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900 text-sm"
            placeholder="Buscar artigos, termos jurídicos..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={LAWS}
          horizontal
          keyExtractor={(l) => l.code}
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedLaw(selectedLaw === item.code ? null : item.code)}
              className={`mr-2 px-3 py-1.5 rounded-full border ${selectedLaw === item.code ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-semibold ${selectedLaw === item.code ? 'text-white' : 'text-gray-700'}`}>{item.code}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color="#1A2B4A" />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => `${item.law_code}-${item.article_number}-${idx}`}
          className="flex-1 px-4"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(tabs)/vade-mecum/[code]/[article]', params: { code: item.law_code, article: item.article_number } })}
            >
              <Card variant="bordered" className="mb-2">
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs font-bold text-primary-500 bg-blue-50 px-2 py-0.5 rounded-full">{item.law_code}</Text>
                  <Text className="text-xs text-gray-500 ml-2">Art. {item.article_number}</Text>
                </View>
                <Text className="text-sm text-gray-700 leading-5" numberOfLines={3}>{item.article_text}</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      ) : search.length > 2 ? (
        <Text className="text-center text-gray-400 mt-10">Nenhum resultado encontrado</Text>
      ) : (
        <View className="flex-1 px-4 mt-2">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Leis disponíveis</Text>
          {LAWS.map((law) => (
            <Card key={law.code} variant="bordered" className="mb-2 flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-primary-500 items-center justify-center mr-3">
                <Text className="text-white text-xs font-bold">{law.code}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-sm">{law.shortName}</Text>
                <Text className="text-xs text-gray-500" numberOfLines={1}>{law.name}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
