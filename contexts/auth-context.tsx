import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { loginRequest, meRequest } from '@/services/auth-service';

type AuthUser = {
  id: number;
  email: string;
  nome_completo?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const TOKEN_KEY = 'datanav_auth_token';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await meRequest(savedToken);
        setToken(savedToken);
        setUser(currentUser);
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      isLoading,
      user,
      token,
      signIn: async (email: string, password: string) => {
        const response = await loginRequest(email, password);

        await SecureStore.setItemAsync(TOKEN_KEY, response.token);
        setToken(response.token);
        setUser(response.user);
      },
      signOut: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
      },
    }),
    [isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }

  return context;
}

export function getApiUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const host = hostUri.split(':')[0];

  if (host) {
    return `http://${host}:3000`;
  }

  return 'http://localhost:3000';
}
