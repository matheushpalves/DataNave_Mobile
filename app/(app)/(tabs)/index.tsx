import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Alert } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { useSync } from '@/hooks/use-sync';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  color: string;
  bg: string;
  route: '/(app)/(tabs)/cadastro' | '/(app)/(tabs)/consultas' | '/(app)/(tabs)/perfil';
};

const MENU_ITEMS: MenuItem[] = [
  {
    icon: 'add-circle-outline',
    label: 'Cadastro',
    description: 'Registrar nova embarcação',
    color: '#1d4ed8',
    bg: '#eff6ff',
    route: '/(app)/(tabs)/cadastro',
  },
  {
    icon: 'search-outline',
    label: 'Consultas',
    description: 'Buscar embarcações cadastradas',
    color: '#0891b2',
    bg: '#ecfeff',
    route: '/(app)/(tabs)/consultas',
  },
  {
    icon: 'settings-outline',
    label: 'Configurações',
    description: 'Perfil e preferências da conta',
    color: '#7c3aed',
    bg: '#f5f3ff',
    route: '/(app)/(tabs)/perfil',
  },
];

export default function MenuScreen() {
  const { token, user, signOut } = useAuth();
  const { pendingCount, syncNow, isSyncing } = useSync(token);

  const handleSignOut = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="boat" size={22} color="#fff" />
            </View>
            <Text style={styles.logoText}>DATANAV</Text>
          </View>
          <Pressable onPress={handleSignOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          </Pressable>
        </View>

        {/* Greeting */}
        {user?.nome_completo ? (
          <View style={styles.greetingBox}>
            <Text style={styles.greetingHello}>Olá, {user.nome_completo.split(' ')[0]} 👋</Text>
            <Text style={styles.greetingSub}>O que deseja fazer hoje?</Text>
          </View>
        ) : null}

        {/* Sync badge */}
        {pendingCount > 0 && (
          <Pressable disabled={isSyncing} onPress={syncNow} style={styles.syncBadge}>
            <Ionicons name="cloud-upload-outline" size={16} color="#92400e" />
            <Text style={styles.syncBadgeText}>
              {isSyncing
                ? 'Sincronizando...'
                : `${pendingCount} registro${pendingCount > 1 ? 's' : ''} pendente${pendingCount > 1 ? 's' : ''} — toque para sincronizar`}
            </Text>
          </Pressable>
        )}

        {/* Menu list */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route)}
              style={({ pressed }) => [styles.menuCard, pressed && styles.menuCardPressed]}
            >
              <View style={[styles.menuIconWrapper, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f0f6ff',
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e3a8a',
    letterSpacing: 3,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  greetingBox: {
    gap: 2,
  },
  greetingHello: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  greetingSub: {
    fontSize: 14,
    color: '#64748b',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  syncBadgeText: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  menuList: {
    gap: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  menuIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    gap: 3,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  menuDescription: {
    fontSize: 13,
    color: '#64748b',
  },
});
