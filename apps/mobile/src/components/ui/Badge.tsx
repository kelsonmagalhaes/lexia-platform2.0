import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'gold' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'primary', size = 'sm' }: BadgeProps) {
  const variants = {
    primary: 'bg-blue-100',
    gold: 'bg-yellow-100',
    success: 'bg-green-100',
    warning: 'bg-orange-100',
    error: 'bg-red-100',
    gray: 'bg-gray-100',
  };
  const textVariants = {
    primary: 'text-blue-700',
    gold: 'text-yellow-700',
    success: 'text-green-700',
    warning: 'text-orange-700',
    error: 'text-red-700',
    gray: 'text-gray-600',
  };
  const sizes = { sm: 'px-2 py-0.5', md: 'px-3 py-1' };
  const textSizes = { sm: 'text-xs', md: 'text-sm' };

  return (
    <View className={`rounded-full self-start ${variants[variant]} ${sizes[size]}`}>
      <Text className={`font-medium ${textVariants[variant]} ${textSizes[size]}`}>{label}</Text>
    </View>
  );
}
