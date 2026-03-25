import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { storage } from '../../src/utils/storage';

const SLIDES = [
  { icon: 'book', title: 'Grade Completa', desc: 'Todos os 10 períodos do curso de Direito organizados e estruturados para você.' },
  { icon: 'sparkles', title: 'LEX IA', desc: 'Inteligência artificial jurídica para explicar, resumir e gerar questões personalizadas.' },
  { icon: 'library', title: 'Vade Mecum', desc: 'Acesso a CF, CC, CP, CPC, CPP e leis especiais com busca inteligente.' },
  { icon: 'trophy', title: 'Gamificação', desc: 'Ganhe XP, suba de nível e mantenha sua sequência de estudos com streak diário.' },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);

  async function finish() {
    await storage.setOnboardingDone();
    router.replace('/(tabs)/home');
  }

  const slide = SLIDES[index];

  return (
    <SafeAreaView className="flex-1 bg-primary-500">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-8">
          <Ionicons name={slide.icon as keyof typeof Ionicons.glyphMap} size={48} color="#C9A84C" />
        </View>
        <Text className="text-3xl font-bold text-white text-center mb-4">{slide.title}</Text>
        <Text className="text-base text-blue-200 text-center leading-6">{slide.desc}</Text>
      </View>

      <View className="flex-row justify-center mb-8 gap-2">
        {SLIDES.map((_, i) => (
          <View key={i} className={`h-2 rounded-full ${i === index ? 'w-6 bg-gold-400' : 'w-2 bg-white/30'}`} />
        ))}
      </View>

      <View className="px-6 pb-8 flex-row gap-3">
        {index < SLIDES.length - 1 ? (
          <>
            <TouchableOpacity onPress={finish} className="flex-1 items-center py-4">
              <Text className="text-blue-200 font-medium">Pular</Text>
            </TouchableOpacity>
            <Button title="Próximo" onPress={() => setIndex((i) => i + 1)} variant="gold" size="lg" className="flex-1" />
          </>
        ) : (
          <Button title="Começar a Estudar" onPress={finish} variant="gold" size="lg" fullWidth />
        )}
      </View>
    </SafeAreaView>
  );
}
