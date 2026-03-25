import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ChatBubble } from '../../../src/components/lex-ia/ChatBubble';
import { api } from '../../../src/api/client';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

export default function LexIaScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'Olá! Sou a LEX IA, sua assistente jurídica educacional. Posso explicar conceitos, gerar questões, corrigir dissertações e simular provas. Como posso ajudar?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const history = messages.slice(1).map((m) => ({ role: m.role, parts: m.content }));
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post<{ data: string }>('/api/lex-ia/chat', { message: userMsg.content, history });
      setMessages((msgs) => [...msgs, { id: Date.now().toString(), role: 'assistant', content: data }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: unknown) {
      setMessages((msgs) => [...msgs, { id: Date.now().toString(), role: 'assistant', content: 'Erro ao processar. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-primary-500 px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full bg-gold-400 items-center justify-center mr-3">
            <Text className="text-primary-900 font-bold text-sm">L</Text>
          </View>
          <View>
            <Text className="text-white font-bold text-base">LEX IA</Text>
            <Text className="text-blue-200 text-xs">Assistente Jurídico</Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => router.push('/(tabs)/lex-ia/quiz-gen')}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/lex-ia/essay')}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <ChatBubble message={item.content} role={item.role} />}
        className="flex-1 px-4 py-2"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View className="flex-row items-center px-4 pb-2">
          <View className="bg-gray-100 rounded-2xl px-4 py-2 flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#1A2B4A" />
            <Text className="text-gray-500 text-sm">LEX IA está pensando...</Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-row items-end px-4 py-3 border-t border-gray-100 bg-white">
          <TextInput
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-gray-900 text-sm mr-2 max-h-32"
            placeholder="Pergunte sobre Direito..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            className={`w-11 h-11 rounded-full items-center justify-center ${input.trim() ? 'bg-primary-500' : 'bg-gray-200'}`}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color={input.trim() ? '#fff' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
