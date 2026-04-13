import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

function AppButtonComponent({ title, onPress, variant = 'primary' }: AppButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' ? styles.secondary : styles.primary,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, variant === 'secondary' ? styles.secondaryLabel : styles.primaryLabel]}>
        {title}
      </Text>
    </Pressable>
  );
}

export const AppButton = memo(AppButtonComponent);

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#0f766e',
  },
  secondary: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  label: {
    fontWeight: '700',
    fontSize: 15,
  },
  primaryLabel: {
    color: '#f8fafc',
  },
  secondaryLabel: {
    color: '#0f172a',
  },
  pressed: {
    opacity: 0.85,
  },
});
