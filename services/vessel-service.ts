import { getApiUrl } from '@/contexts/auth-context';

export type VesselPayload = {
  nome: string;
  localizacao_municipio: string;
  localizacao_uf?: string;
  locais_atracacao?: string;
  proprietario_nome?: string;
  ano_construcao?: string;
  construcao_municipio?: string;
  construcao_uf?: string;
  mestre_construtor?: string;
  propulsao?: string;
  uso?: string;
  medida_comprimento?: string;
  medida_boca?: string;
  medida_pontal?: string;
  medida_espessura?: string;
  reparos?: string;
  registro_tipologico?: string;
};

export type VesselRecord = VesselPayload & {
  id: number;
  user_id: number | null;
  created_at: string;
};

export async function createVesselRequest(token: string, payload: VesselPayload) {
  const response = await fetch(`${getApiUrl()}/vessels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ vessel: payload }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? data?.errors?.join(', ') ?? 'Falha ao enviar embarcação.');
  }

  return data as VesselRecord;
}

export async function updateVesselRequest(token: string, id: number, payload: Partial<VesselPayload>) {
  const response = await fetch(`${getApiUrl()}/vessels/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ vessel: payload }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? data?.errors?.join(', ') ?? 'Falha ao atualizar embarcação.');
  }

  return data as VesselRecord;
}

export async function listVesselsRequest(token: string, params?: { q?: string; municipio?: string }) {
  const query = new URLSearchParams();

  if (params?.q) {
    query.set('q', params.q.trim());
  }

  if (params?.municipio) {
    query.set('municipio', params.municipio.trim());
  }

  const queryString = query.toString();
  const url = `${getApiUrl()}/vessels${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar embarcações.');
  }

  return (await response.json()) as VesselRecord[];
}
