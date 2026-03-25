import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  secureToggle?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export function Input({ label, error, secureToggle = false, leftIcon, secureTextEntry, style, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>}
      <View className={`flex-row items-center bg-white border rounded-xl px-3 py-0 ${error ? 'border-red-400' : 'border-gray-200'}`}>
        {leftIcon && <Ionicons name={leftIcon} size={18} color="#6B7280" style={{ marginRight: 8 }} />}
        <TextInput
          className="flex-1 text-gray-900 text-base py-3"
          secureTextEntry={secureToggle ? !showPassword : secureTextEntry}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
