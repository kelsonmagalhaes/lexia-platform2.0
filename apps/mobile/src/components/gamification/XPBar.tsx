import React from 'react';
import { View, Text } from 'react-native';
import { getLevelFromXp, getXpProgress, LEVELS } from '@lexstudy/shared';
import { ProgressBar } from '../ui/ProgressBar';

interface XPBarProps {
  xp: number;
}

export function XPBar({ xp }: XPBarProps) {
  const levelInfo = getLevelFromXp(xp);
  const progress = getXpProgress(xp);
  const nextLevel = LEVELS.find((l) => l.minXp > xp);

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full" style={{ backgroundColor: levelInfo.color }} />
          <Text className="font-bold text-gray-900">{levelInfo.label}</Text>
        </View>
        <Text className="text-gold-400 font-bold">{xp.toLocaleString('pt-BR')} XP</Text>
      </View>
      <ProgressBar progress={progress} showPercent={false} color={levelInfo.color} height={10} />
      {nextLevel && (
        <Text className="text-xs text-gray-500 mt-1 text-right">
          {(nextLevel.minXp - xp).toLocaleString('pt-BR')} XP para {nextLevel.label}
        </Text>
      )}
    </View>
  );
}
