import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QuestionCard } from '../../src/components/quiz/QuestionCard';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';

interface Question {
  content: string;
  options: Array<{ key: string; text: string }>;
  correctAnswer: string;
  explanation: string;
}

interface SimuladoData {
  title: string;
  questions: Question[];
}

export default function SimuladoScreen() {
  const { data: rawData } = useLocalSearchParams<{ data: string }>();
  const simulado: SimuladoData = rawData ? JSON.parse(rawData) : { title: 'Simulado', questions: [] };
  const questions = simulado.questions ?? [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  function handleSelect(key: string) {
    if (answers[currentIdx]) return;
    setAnswers((a) => ({ ...a, [currentIdx]: key }));
  }

  function next() {
    if (currentIdx < questions.length - 1) setCurrentIdx((i) => i + 1);
    else setFinished(true);
  }

  const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="warning-outline" size={48} color="#F59E0B" />
        <Text className="text-lg font-bold mt-4 text-center">Nenhuma questão gerada</Text>
        <Button title="Voltar" onPress={() => router.back()} variant="primary" className="mt-4" />
      </SafeAreaView>
    );
  }

  if (finished) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 px-6 py-8">
          <Text className="text-2xl font-bold text-primary-500 text-center mb-2">Resultado</Text>
          <Text className="text-center text-gray-500 mb-6">{simulado.title}</Text>

          <View className={`rounded-3xl p-8 items-center mb-6 ${score >= 70 ? 'bg-green-50' : score >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
            <Text className={`text-5xl font-bold ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{score}%</Text>
            <Text className="text-base text-gray-700 mt-2">{correctCount} de {questions.length} corretas</Text>
          </View>

          {questions.map((q, i) => (
            <View key={i} className="mb-6">
              <Text className="text-sm font-semibold text-gray-900 mb-2">{i + 1}. {q.content}</Text>
              <View className={`flex-row items-start p-3 rounded-xl ${answers[i] === q.correctAnswer ? 'bg-green-50' : 'bg-red-50'}`}>
                <Ionicons name={answers[i] === q.correctAnswer ? 'checkmark-circle' : 'close-circle'} size={18} color={answers[i] === q.correctAnswer ? '#10B981' : '#EF4444'} />
                <Text className="ml-2 text-sm text-gray-700 flex-1">{q.explanation}</Text>
              </View>
            </View>
          ))}

          <Button title="Novo Simulado" onPress={() => router.replace('/simulado/index')} variant="primary" fullWidth className="mb-4" />
          <Button title="Início" onPress={() => router.replace('/(tabs)/home')} variant="outline" fullWidth />
          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const current = questions[currentIdx];
  const progress = Math.round(((currentIdx + 1) / questions.length) * 100);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity onPress={() => Alert.alert('Sair', 'Deseja sair do simulado?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', onPress: () => router.back() }])}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-sm font-medium text-gray-500">{currentIdx + 1} / {questions.length}</Text>
          <View />
        </View>
        <ProgressBar progress={progress} showPercent={false} />
      </View>

      <ScrollView className="flex-1">
        <QuestionCard
          question={current.content}
          options={current.options}
          selectedAnswer={answers[currentIdx] ?? null}
          correctAnswer={answers[currentIdx] ? current.correctAnswer : undefined}
          showResult={!!answers[currentIdx]}
          onSelect={handleSelect}
        />
        {answers[currentIdx] && (
          <View className="mx-4 mb-4 p-4 bg-blue-50 rounded-2xl">
            <Text className="text-xs font-semibold text-primary-500 mb-1">Justificativa</Text>
            <Text className="text-sm text-gray-700 leading-5">{current.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {answers[currentIdx] && (
        <View className="px-4 pb-6">
          <Button title={currentIdx < questions.length - 1 ? 'Próxima' : 'Ver Resultado'} onPress={next} variant="primary" fullWidth size="lg" />
        </View>
      )}
    </SafeAreaView>
  );
}
