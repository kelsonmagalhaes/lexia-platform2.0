import React from 'react';
import { View, Text } from 'react-native';

interface ChatBubbleProps {
  message: string;
  role: 'user' | 'assistant';
  timestamp?: string;
}

export function ChatBubble({ message, role, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      {!isUser && (
        <View className="flex-row items-center mb-1">
          <View className="w-6 h-6 rounded-full bg-gold-400 items-center justify-center mr-2">
            <Text className="text-xs font-bold text-primary-900">L</Text>
          </View>
          <Text className="text-xs font-semibold text-gray-600">LEX IA</Text>
        </View>
      )}
      <View className={`max-w-4/5 rounded-2xl px-4 py-3 ${isUser ? 'bg-primary-500 rounded-tr-sm' : 'bg-gray-100 rounded-tl-sm'}`}>
        <Text className={`text-sm leading-5 ${isUser ? 'text-white' : 'text-gray-800'}`}>{message}</Text>
      </View>
      {timestamp && <Text className="text-xs text-gray-400 mt-1">{timestamp}</Text>}
    </View>
  );
}
