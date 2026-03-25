import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white rounded-2xl p-4',
    elevated: 'bg-white rounded-2xl p-4 shadow-md',
    bordered: 'bg-white rounded-2xl p-4 border border-gray-200',
  };
  return (
    <View className={`${variants[variant]} ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
