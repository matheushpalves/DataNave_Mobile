import { memo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type AppInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
};

function AppInputComponent({ label, placeholder, value, onChangeText, error }: AppInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#94a3b8"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export const AppInput = memo(AppInputComponent);

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
  },
});
