import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({ title, variant = 'primary', size = 'md', loading = false, fullWidth = false, disabled, className, ...props }: ButtonProps) {
  const base = 'flex-row items-center justify-center rounded-xl';
  const variants = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-200',
    outline: 'border-2 border-primary-500 bg-transparent',
    ghost: 'bg-transparent',
    gold: 'bg-gold-400',
  };
  const sizes = { sm: 'px-3 py-2', md: 'px-5 py-3', lg: 'px-6 py-4' };
  const textVariants = {
    primary: 'text-white',
    secondary: 'text-gray-800',
    outline: 'text-primary-500',
    ghost: 'text-primary-500',
    gold: 'text-primary-900',
  };
  const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };

  return (
    <TouchableOpacity
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-60' : ''}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'gold' ? '#fff' : '#1A2B4A'} />
      ) : (
        <Text className={`font-semibold ${textVariants[variant]} ${textSizes[size]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
