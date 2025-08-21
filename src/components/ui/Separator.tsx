import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface SeparatorProps {
  style?: ViewStyle;
  orientation?: 'horizontal' | 'vertical';
}

export const Separator: React.FC<SeparatorProps> = ({ 
  style, 
  orientation = 'horizontal' 
}) => {
  const separatorStyle = [
    styles.separator,
    orientation === 'horizontal' ? styles.horizontal : styles.vertical,
    style
  ];

  return <View style={separatorStyle} />;
};

const styles = StyleSheet.create({
  separator: {
    backgroundColor: '#e5e7eb',
  },
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
