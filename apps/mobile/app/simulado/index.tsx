import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { api } from '../../src/api/client';
import { DEFAULT_CURRICULUM } from '@lexstudy/shared';

const EXAM_TYPES = [
  { key: 'oab', label: 'Exame OAB', icon: 'briefcase', desc: 'Estilo Ordem dos Advogados' },
  { key: 'concurso', label: 'Concurso', icon: 'medal', desc: 'Questões de concursos públicos' },
  { key: 'regular', label: 'Prova Regular', icon: 'document-text', desc: 'Prova acadêmica universitária' },
];

export default function SimuladoIndexScreen() {
  const [selectedType, setSelectedType] = useState<string>('regular');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const allDisciplines = DEFAULT_CURRICULUM.flatMap((p) => p.disciplines.map((d) => d.name));

  async function startSimulado() {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: { title: string; questions: Array<Record<string, unknown>> } }>('/api/lex-ia/simulate-exam', {
        disciplineName: selectedDiscipline || 'Direito',
        examType: selectedType,
        count,
      });
      router.push({ pathname: '/simulado/[id]', params: { id: 'ai', data: JSON.stringify(data) } });
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o simulado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-5 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="close" size={24} color="#1A2B4A" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-primary-500">Simulado</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <Text className="font-bold text-gray-900 mb-3">Tipo de Simulado</Text>
        {EXAM_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            onPress={() => setSelectedType(type.key)}
            className={`flex-row items-center p-4 rounded-2xl border-2 mb-2 ${selectedType === type.key ? 'border-primary-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <Ionicons name={type.icon as keyof typeof Ionicons.glyphMap} size={24} color={selectedType === type.key ? '#1A2B4A' : '#9CA3AF'} />
            <View className="ml-3">
              <Text className={`font-semibold ${selectedType === type.key ? 'text-primary-500' : 'text-gray-800'}`}>{type.label}</Text>
              <Text className="text-xs text-gray-500">{type.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text className="font-bold text-gray-900 mt-5 mb-3">Disciplina (opcional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {['Todas', ...allDisciplines.slice(0, 15)].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setSelectedDiscipline(d === 'Todas' ? '' : d)}
              className={`mr-2 px-3 py-2 rounded-xl border ${selectedDiscipline === (d === 'Todas' ? '' : d) ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-medium ${selectedDiscipline === (d === 'Todas' ? '' : d) ? 'text-white' : 'text-gray-700'}`}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text className="font-bold text-gray-900 mb-3">Número de Questões</Text>
        <View className="flex-row gap-3 mb-8">
          {[5, 10, 20, 30].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setCount(n)}
              className={`flex-1 py-3 rounded-xl border items-center ${count === n ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-bold text-base ${count === n ? 'text-white' : 'text-gray-700'}`}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Gerar Simulado com LEX IA" onPress={startSimulado} loading={loading} fullWidth variant="primary" size="lg" />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
