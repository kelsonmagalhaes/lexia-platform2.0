import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/api/client';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';

interface PdfItem { id: string; filename: string; status: 'pending' | 'processing' | 'done' | 'error'; created_at: string; discipline_name?: string; }

export default function PdfUploadScreen() {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-pdfs'],
    queryFn: () => api.get<{ data: PdfItem[] }>('/api/pdf'),
    refetchInterval: 5000,
  });

  const pdfs = (data as { data: PdfItem[] } | undefined)?.data ?? [];

  async function pickAndUpload() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;

    const file = result.assets[0];
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', { uri: file.uri, name: file.name, type: 'application/pdf' } as unknown as Blob);
      await api.upload('/api/pdf/upload', formData);
      queryClient.invalidateQueries({ queryKey: ['my-pdfs'] });
      Alert.alert('Sucesso', 'PDF enviado! O processamento pode levar alguns minutos.');
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha no upload');
    } finally {
      setUploading(false);
    }
  }

  const statusVariant = { pending: 'gray', processing: 'warning', done: 'success', error: 'error' } as const;
  const statusLabel = { pending: 'Aguardando', processing: 'Processando', done: 'Pronto', error: 'Erro' };

  return (
    <SafeAreaView className="flex-1 bg-legal-light">
      <View className="bg-primary-500 px-6 py-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">Upload de PDF</Text>
          <Text className="text-blue-200 text-xs">Até 3 por dia</Text>
        </View>
      </View>

      <TouchableOpacity
        className={`mx-4 mt-4 border-2 border-dashed rounded-2xl p-8 items-center ${uploading ? 'border-gray-300' : 'border-gold-400'}`}
        onPress={pickAndUpload}
        disabled={uploading}
        activeOpacity={0.7}
      >
        {uploading ? <ActivityIndicator color="#C9A84C" size="large" /> : <Ionicons name="cloud-upload-outline" size={40} color="#C9A84C" />}
        <Text className="font-semibold text-primary-500 mt-3 text-base">{uploading ? 'Enviando...' : 'Selecionar PDF'}</Text>
        <Text className="text-xs text-gray-500 mt-1">Máx. 20MB • Resumo + Quiz automático</Text>
      </TouchableOpacity>

      <Text className="px-4 mt-5 mb-3 font-bold text-gray-900">Meus PDFs</Text>

      {isLoading ? <ActivityIndicator className="mt-6" color="#1A2B4A" /> : (
        <FlatList
          data={pdfs}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4"
          renderItem={({ item }) => (
            <Card variant="bordered" className="mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-2">
                  <Text className="font-medium text-gray-900 text-sm" numberOfLines={2}>{item.filename}</Text>
                  {item.discipline_name && <Text className="text-xs text-gray-500 mt-0.5">{item.discipline_name}</Text>}
                </View>
                <Badge label={statusLabel[item.status]} variant={statusVariant[item.status]} />
              </View>
              {item.status === 'done' && (
                <View className="flex-row gap-2 mt-2">
                  <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/courses/pdf/[id]/summary', params: { id: item.id } })} className="flex-1 bg-primary-50 rounded-xl py-2 items-center">
                    <Text className="text-xs font-semibold text-primary-500">Ver Resumo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/courses/pdf/[id]/quiz', params: { id: item.id } })} className="flex-1 bg-gold-400/20 rounded-xl py-2 items-center">
                    <Text className="text-xs font-semibold text-gold-400">Fazer Quiz</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          )}
          ListEmptyComponent={<Text className="text-center text-gray-400 mt-8">Nenhum PDF enviado ainda</Text>}
        />
      )}
    </SafeAreaView>
  );
}
