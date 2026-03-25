import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, label, showPercent = true, color = '#C9A84C', height = 8 }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <View>
      {(label || showPercent) && (
        <View className="flex-row justify-between mb-1">
          {label && <Text className="text-xs text-gray-600">{label}</Text>}
          {showPercent && <Text className="text-xs font-semibold text-gray-700">{clamped}%</Text>}
        </View>
      )}
      <View className="bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
        <View style={{ width: `${clamped}%`, height, backgroundColor: color, borderRadius: height }} />
      </View>
    </View>
  );
}
