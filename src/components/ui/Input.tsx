import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { useThemeColors } from '../../lib/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  style, 
  ...props 
}) => {
  const theme = useThemeColors();
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { borderColor: theme.cardBorder as string, backgroundColor: theme.card, color: theme.textPrimary },
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
});
