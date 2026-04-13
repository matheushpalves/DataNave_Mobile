import { getApiUrl } from '@/contexts/auth-context';

type LoginResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    nome_completo?: string;
  };
  error?: string;
};

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${getApiUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as LoginResponse;

  if (!response.ok || !data.token) {
    throw new Error(data.error ?? 'Não foi possível efetuar login.');
  }

  return data;
}

export async function meRequest(token: string) {
  const response = await fetch(`${getApiUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Sessão inválida.');
  }

  return response.json();
}
