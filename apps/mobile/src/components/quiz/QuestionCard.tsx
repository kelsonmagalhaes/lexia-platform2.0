import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Option { key: string; text: string; }

interface QuestionCardProps {
  question: string;
  options: Option[];
  selectedAnswer: string | null;
  correctAnswer?: string;
  showResult?: boolean;
  onSelect: (key: string) => void;
  questionNumber?: number;
  total?: number;
}

export function QuestionCard({ question, options, selectedAnswer, correctAnswer, showResult = false, onSelect, questionNumber, total }: QuestionCardProps) {
  function getOptionStyle(key: string) {
    if (!showResult) {
      return selectedAnswer === key ? 'border-primary-500 bg-blue-50' : 'border-gray-200 bg-white';
    }
    if (key === correctAnswer) return 'border-green-500 bg-green-50';
    if (key === selectedAnswer && key !== correctAnswer) return 'border-red-400 bg-red-50';
    return 'border-gray-200 bg-white';
  }

  return (
    <View className="flex-1 p-4">
      {questionNumber && total && (
        <Text className="text-xs text-gray-500 mb-3">{questionNumber} / {total}</Text>
      )}
      <Text className="text-base font-semibold text-gray-900 mb-6 leading-6">{question}</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          className={`flex-row items-start p-4 rounded-xl border-2 mb-3 ${getOptionStyle(opt.key)}`}
          onPress={() => !showResult && onSelect(opt.key)}
          activeOpacity={showResult ? 1 : 0.7}
        >
          <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 border-2 ${selectedAnswer === opt.key ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
            <Text className={`text-sm font-bold ${selectedAnswer === opt.key ? 'text-white' : 'text-gray-600'}`}>{opt.key}</Text>
          </View>
          <Text className="flex-1 text-sm text-gray-800 leading-5 pt-0.5">{opt.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
