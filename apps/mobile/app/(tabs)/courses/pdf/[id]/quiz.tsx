import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../../../src/api/client';
import { QuestionCard } from '../../../../../src/components/quiz/QuestionCard';
import { Button } from '../../../../../src/components/ui/Button';

interface Question { content: string; options: Array<{ key: string; text: string }>; correctAnswer: string; explanation: string; }

export default function PdfQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['pdf-quiz', id],
    queryFn: () => api.get<{ data: { quiz: { questions: Question[] }; filename: string } }>(`/api/pdf/${id}/quiz`),
  });

  const pdfData = (data as { data: { quiz: { questions: Question[] }; filename: string } } | undefined)?.data;
  const questions: Question[] = pdfData?.quiz?.questions ?? [];
  const correctCount = finished ? questions.filter((q, i) => answers[i] === q.correctAnswer).length : 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-5 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A2B4A" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-primary-500 flex-1" numberOfLines={1}>Quiz — {pdfData?.filename ?? ''}</Text>
      </View>

      {isLoading ? (
        <Text className="text-center text-gray-400 mt-10">Carregando quiz...</Text>
      ) : questions.length === 0 ? (
        <Text className="text-center text-gray-400 mt-10">Quiz não disponível.</Text>
      ) : (
        <ScrollView className="flex-1">
          {finished && (
            <View className="mx-4 mt-4 p-4 bg-blue-50 rounded-2xl">
              <Text className="text-center font-bold text-primary-500 text-lg">{Math.round((correctCount / questions.length) * 100)}%</Text>
              <Text className="text-center text-gray-500 text-sm">{correctCount} de {questions.length} corretas</Text>
            </View>
          )}
          {questions.map((q, i) => (
            <QuestionCard
              key={i}
              question={q.content}
              options={q.options}
              selectedAnswer={answers[i] ?? null}
              correctAnswer={finished ? q.correctAnswer : undefined}
              showResult={finished}
              onSelect={(key) => !finished && setAnswers((a) => ({ ...a, [i]: key }))}
              questionNumber={i + 1}
              total={questions.length}
            />
          ))}
          <View className="px-4 pb-8">
            {!finished ? (
              <Button title="Finalizar Quiz" onPress={() => setFinished(true)} variant="primary" fullWidth />
            ) : (
              <Button title="Refazer" onPress={() => { setAnswers({}); setFinished(false); }} variant="outline" fullWidth />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
