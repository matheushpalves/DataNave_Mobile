import * as SecureStore from 'expo-secure-store';

import type { VesselPayload } from '@/services/vessel-service';

const PENDING_VESSELS_KEY = 'datanav_pending_vessels';

export type PendingVessel = VesselPayload & {
  local_id: string;
  created_at: string;
  sync_status: 'pending' | 'synced' | 'error';
  photos?: string[]; // base64 strings
};

async function readAll() {
  const raw = await SecureStore.getItemAsync(PENDING_VESSELS_KEY);
  if (!raw) {
    return [] as PendingVessel[];
  }

  try {
    return JSON.parse(raw) as PendingVessel[];
  } catch {
    return [] as PendingVessel[];
  }
}

async function writeAll(vessels: PendingVessel[]) {
  await SecureStore.setItemAsync(PENDING_VESSELS_KEY, JSON.stringify(vessels));
}

export async function enqueuePendingVessel(payload: VesselPayload, photos?: string[]) {
  const current = await readAll();
  const next: PendingVessel = {
    ...payload,
    local_id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    created_at: new Date().toISOString(),
    sync_status: 'pending',
    photos,
  };

  await writeAll([next, ...current]);
  return next;
}

export async function listPendingVessels(filter?: { q?: string; municipio?: string }) {
  const vessels = await readAll();

  return vessels.filter((vessel) => {
    const byName = filter?.q
      ? vessel.nome.toLowerCase().includes(filter.q.trim().toLowerCase())
      : true;

    const byMunicipio = filter?.municipio
      ? vessel.localizacao_municipio.toLowerCase().includes(filter.municipio.trim().toLowerCase())
      : true;

    return byName && byMunicipio;
  });
}

export async function removePendingVessel(localId: string) {
  const current = await readAll();
  await writeAll(current.filter((item) => item.local_id !== localId));
}

export async function countPendingVessels() {
  const current = await readAll();
  return current.filter((item) => item.sync_status === 'pending').length;
}
