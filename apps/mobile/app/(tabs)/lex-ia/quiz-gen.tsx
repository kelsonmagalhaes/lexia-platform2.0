import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { QuestionCard } from '../../../src/components/quiz/QuestionCard';
import { api } from '../../../src/api/client';

interface Question { content: string; options: Array<{ key: string; text: string }>; correctAnswer: string; explanation: string; }

export default function QuizGenScreen() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  async function generate() {
    if (!topic.trim()) { Alert.alert('Atenção', 'Informe um tema'); return; }
    setLoading(true);
    try {
      const { data } = await api.post<{ data: { questions: Question[] } }>('/api/lex-ia/generate-quiz', { topic, count });
      setQuestions(data.questions ?? []);
      setAnswers({});
    } catch {
      Alert.alert('Erro', 'Falha ao gerar questões. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-5 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A2B4A" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-primary-500">Gerar Questões</Text>
      </View>

      {questions.length === 0 ? (
        <ScrollView className="flex-1 px-6 py-4">
          <Input label="Tema ou assunto" value={topic} onChangeText={setTopic} placeholder="Ex: Princípios do Direito Penal" leftIcon="bulb-outline" />
          <Text className="font-medium text-gray-700 mb-3 mt-2">Quantidade</Text>
          <View className="flex-row gap-3 mb-6">
            {[3, 5, 10].map((n) => (
              <TouchableOpacity key={n} onPress={() => setCount(n)} className={`flex-1 py-3 rounded-xl border items-center ${count === n ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'}`}>
                <Text className={`font-bold ${count === n ? 'text-white' : 'text-gray-700'}`}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Gerar com LEX IA" onPress={generate} loading={loading} fullWidth variant="primary" size="lg" />
        </ScrollView>
      ) : (
        <ScrollView className="flex-1">
          {questions.map((q, i) => (
            <View key={i}>
              <QuestionCard
                question={q.content}
                options={q.options}
                selectedAnswer={answers[i] ?? null}
                correctAnswer={answers[i] ? q.correctAnswer : undefined}
                showResult={!!answers[i]}
                onSelect={(key) => setAnswers((a) => ({ ...a, [i]: key }))}
                questionNumber={i + 1}
                total={questions.length}
              />
              {answers[i] && (
                <View className="mx-4 mb-4 p-4 bg-blue-50 rounded-2xl">
                  <Text className="text-xs font-semibold text-primary-500 mb-1">Justificativa</Text>
                  <Text className="text-sm text-gray-700">{q.explanation}</Text>
                </View>
              )}
            </View>
          ))}
          <View className="px-4 pb-8 gap-3">
            <Button title="Novas Questões" onPress={() => { setQuestions([]); setAnswers({}); }} variant="outline" fullWidth />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
