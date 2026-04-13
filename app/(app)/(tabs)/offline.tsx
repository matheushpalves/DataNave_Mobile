import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { useSync } from '@/hooks/use-sync';
import { enqueuePendingVessel } from '@/services/local-vessel-store';

export default function OfflineScreen() {
  const { token } = useAuth();
  const { refreshPending } = useSync(token);
  const [nome, setNome] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);

  const saveLocally = async () => {
    if (!nome.trim() || !municipio.trim()) {
      setMensagem('Informe nome e município para salvar localmente.');
      return;
    }

    await enqueuePendingVessel({
      nome: nome.trim(),
      localizacao_municipio: municipio.trim(),
      localizacao_uf: 'PA',
    });

    setNome('');
    setMunicipio('');
    setMensagem('Embarcação adicionada à fila local com sucesso.');
    await refreshPending();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro Offline</Text>
      <Text style={styles.subtitle}>Registre no campo e sincronize depois, quando houver internet.</Text>

      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome da embarcação"
        placeholderTextColor="#64748b"
      />
      <TextInput
        style={styles.input}
        value={municipio}
        onChangeText={setMunicipio}
        placeholder="Município"
        placeholderTextColor="#64748b"
      />

      <Pressable style={styles.button} onPress={saveLocally}>
        <Text style={styles.buttonText}>Salvar localmente</Text>
      </Pressable>

      {mensagem ? <Text style={styles.message}>{mensagem}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    color: '#1d4ed8',
  },
});
