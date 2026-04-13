import { getApiUrl } from '@/contexts/auth-context';

export async function uploadPhotoRequest(token: string, vesselId: number, imageBase64: string) {
  const response = await fetch(`${getApiUrl()}/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      photo: {
        vessel_id: vesselId,
        image_base64: imageBase64,
      },
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error ?? 'Falha ao enviar foto.');
  }
}
