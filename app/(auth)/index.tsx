import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Email é obrigatório.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Informe um email válido.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Senha é obrigatória.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter ao menos 6 caracteres.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert(
        'Falha no login',
        error instanceof Error ? error.message : 'Credenciais inválidas. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar senha',
      'Entre em contato com o administrador do sistema para redefinir sua senha.',
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Ionicons name="boat" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>DATANAVE</Text>
          <Text style={styles.appTagline}>Catalogação de Embarcações</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login</Text>
          <Text style={styles.cardSubtitle}>Acesso exclusivo para pesquisadores credenciados</Text>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
              <Ionicons name="mail-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="seu@email.com"
                placeholderTextColor="#cbd5e1"
                returnKeyType="next"
                style={styles.input}
                value={email}
                onChangeText={(v) => { setEmail(v); setEmailError(''); }}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
              <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#cbd5e1"
                returnKeyType="done"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={(v) => { setPassword(v); setPasswordError(''); }}
                onSubmitEditing={handleLogin}
              />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Sign in */}
          <Pressable
            disabled={isSubmitting}
            onPress={handleLogin}
            style={({ pressed }) => [styles.signInButton, pressed && styles.signInButtonPressed]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInButtonText}>Entrar</Text>
            )}
          </Pressable>

          {/* Forgot */}
          <Pressable onPress={handleForgotPassword} style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 32,
  },
  logoArea: {
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1e3a8a',
    letterSpacing: 4,
  },
  appTagline: {
    fontSize: 13,
    color: '#64748b',
    letterSpacing: 0.3,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    gap: 16,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: -8,
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#0f172a',
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 2,
  },
  signInButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButtonPressed: {
    backgroundColor: '#1e40af',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  forgotButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  forgotText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
});
