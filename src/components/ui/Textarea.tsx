import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

interface TextareaProps extends Omit<TextInputProps, 'multiline'> {
  rows?: number;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  rows = 3, 
  style, 
  ...props 
}) => {
  return (
    <TextInput
      style={[styles.textarea, { height: rows * 20 + 24 }, style]}
      multiline
      textAlignVertical="top"
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
});
