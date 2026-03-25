import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../src/api/client';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';

interface CorrectionResult { score: number; maxScore: number; feedback: string; strengths: string[]; improvements: string[]; suggestedAnswer: string; }

export default function EssayScreen() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorrectionResult | null>(null);

  async function correct() {
    if (!question.trim() || !answer.trim()) { Alert.alert('Atenção', 'Preencha a questão e sua resposta'); return; }
    setLoading(true);
    try {
      const { data } = await api.post<{ data: CorrectionResult }>('/api/lex-ia/correct-essay', { question, answer });
      setResult(data);
    } catch { Alert.alert('Erro', 'Falha na correção. Tente novamente.'); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-5 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A2B4A" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-primary-500">Correção Dissertativa</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {!result ? (
          <>
            <Text className="text-sm font-medium text-gray-700 mb-1">Questão</Text>
            <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 text-sm mb-4 min-h-20" multiline placeholder="Cole ou digite a questão dissertativa..." value={question} onChangeText={setQuestion} textAlignVertical="top" />
            <Text className="text-sm font-medium text-gray-700 mb-1">Sua Resposta</Text>
            <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 text-sm mb-6 min-h-32" multiline placeholder="Digite sua resposta aqui..." value={answer} onChangeText={setAnswer} textAlignVertical="top" />
            {loading ? <ActivityIndicator color="#1A2B4A" /> : <Button title="Corrigir com LEX IA" onPress={correct} fullWidth variant="primary" size="lg" />}
          </>
        ) : (
          <>
            <View className={`rounded-3xl p-6 items-center mb-4 ${result.score >= 7 ? 'bg-green-50' : result.score >= 5 ? 'bg-yellow-50' : 'bg-red-50'}`}>
              <Text className={`text-5xl font-bold ${result.score >= 7 ? 'text-green-600' : result.score >= 5 ? 'text-yellow-600' : 'text-red-500'}`}>{result.score}</Text>
              <Text className="text-gray-500 mt-1">de {result.maxScore} pontos</Text>
            </View>
            <Card variant="bordered" className="mb-3">
              <Text className="font-bold text-gray-900 mb-2">Feedback</Text>
              <Text className="text-sm text-gray-700 leading-5">{result.feedback}</Text>
            </Card>
            <Card variant="bordered" className="mb-3">
              <Text className="font-bold text-green-700 mb-2">Pontos Fortes</Text>
              {result.strengths.map((s, i) => <Text key={i} className="text-sm text-gray-700 mb-1">✓ {s}</Text>)}
            </Card>
            <Card variant="bordered" className="mb-3">
              <Text className="font-bold text-orange-600 mb-2">A Melhorar</Text>
              {result.improvements.map((s, i) => <Text key={i} className="text-sm text-gray-700 mb-1">• {s}</Text>)}
            </Card>
            <Card variant="bordered" className="mb-6">
              <Text className="font-bold text-primary-500 mb-2">Resposta Modelo</Text>
              <Text className="text-sm text-gray-700 leading-5">{result.suggestedAnswer}</Text>
            </Card>
            <Button title="Nova Correção" onPress={() => { setResult(null); setAnswer(''); setQuestion(''); }} variant="outline" fullWidth className="mb-8" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
