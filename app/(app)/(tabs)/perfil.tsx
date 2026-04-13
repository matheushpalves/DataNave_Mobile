import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';

export default function PerfilScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ],
    );
  };

  const initials = user?.nome_completo
    ? user.nome_completo.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#1d4ed8" />
        </Pressable>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.container}>
        {/* Avatar + info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.nome_completo ?? 'Pesquisador'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
            {user?.instituicao ? (
              <Text style={styles.profileInstitution}>{user.instituicao}</Text>
            ) : null}
          </View>
        </View>

        {/* Info rows */}
        {user?.titulo ? (
          <InfoRow icon="school-outline" label="Título" value={user.titulo} />
        ) : null}
        {user?.area_atuacao ? (
          <InfoRow icon="flask-outline" label="Área de atuação" value={user.area_atuacao} />
        ) : null}
        {user?.id_lattes ? (
          <InfoRow icon="document-text-outline" label="ID Lattes" value={user.id_lattes} />
        ) : null}

        <View style={styles.spacer} />

        {/* Logout */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrapper}>
        <Ionicons name={icon} size={18} color="#1d4ed8" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f0f6ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
  },
  profileInstitution: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff1f2',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#fecdd3',
    marginBottom: 8,
  },
  logoutButtonPressed: {
    backgroundColor: '#ffe4e6',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
