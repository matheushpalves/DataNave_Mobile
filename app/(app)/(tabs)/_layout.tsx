import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="offline" options={{ href: null }} />
      <Tabs.Screen name="consultas" options={{ href: null }} />
      <Tabs.Screen name="perfil" options={{ href: null }} />
      <Tabs.Screen name="cadastro" options={{ href: null }} />
      <Tabs.Screen name="navegacao" options={{ href: null }} />
    </Tabs>
  );
}
