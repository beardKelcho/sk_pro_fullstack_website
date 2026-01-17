import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';

export const PrimaryButton: React.FC<{
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}> = ({ label, onPress, disabled, style }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled ? { opacity: 0.9 } : null,
        disabled ? styles.disabled : null,
        style
      ]}
      accessibilityRole="button"
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#00C49F',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  disabled: {
    opacity: 0.5
  },
  text: {
    color: '#06221C',
    fontWeight: '700'
  }
});

