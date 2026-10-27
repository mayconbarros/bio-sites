/**
 * Upload direto para a API do Cloudinary a partir do navegador (Client-side Direct Upload)
 * com fallback seguro para /api/upload caso ocorra falha de rede ou bloqueio.
 * 
 * Evita estouros de payload (413 Payload Too Large) na Vercel e plataformas serverless
 * garantindo que apenas a URL segura definitiva (https://...) seja enviada ao banco de dados Neon.
 */

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/je065pkr/auto/upload';
const UPLOAD_PRESET = 'meus_videos';

export async function uploadMediaFile(
  fileOrData: File | Blob | string, 
  originalFilename?: string
): Promise<string> {
  // Se já for uma URL HTTPS externa, devolve imediatamente
  if (typeof fileOrData === 'string' && (fileOrData.startsWith('http://') || fileOrData.startsWith('https://'))) {
    return fileOrData;
  }

  let fileBlob: Blob;
  let filename = originalFilename || 'upload.jpg';

  if (typeof fileOrData === 'string' && fileOrData.startsWith('data:')) {
    // Converte base64 data URL em Blob nativo
    const match = fileOrData.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = match ? match[1] : 'image/jpeg';
    const base64Content = match ? match[2] : fileOrData.split(',')[1];
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    fileBlob = new Blob([byteArray], { type: mimeType });
    const ext = mimeType.split('/')[1]?.split('+')[0] || 'jpg';
    filename = originalFilename || `media_${Date.now()}.${ext}`;
  } else if (fileOrData instanceof Blob) {
    fileBlob = fileOrData;
    if (fileOrData instanceof File && fileOrData.name) {
      filename = fileOrData.name;
    }
  } else {
    throw new Error('Formato de arquivo ou mídia inválido para upload.');
  }

  // 1. TENTATIVA PRINCIPAL: Upload direto no Cloudinary pelo cliente (Client-side Direct)
  try {
    console.log(`[Upload] Enviando "${filename}" (${fileBlob.size} bytes) diretamente para o Cloudinary...`);

    const formData = new FormData();
    formData.append('file', fileBlob, filename);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.secure_url) {
        console.log('[Upload] Sucesso via Cloudinary Direct! URL:', data.secure_url);
        return data.secure_url;
      }
    } else {
      const errorData = await response.json().catch(() => null);
      console.warn('[Upload] Cloudinary Direct retornou erro:', response.status, errorData?.error?.message);
    }
  } catch (directErr: any) {
    console.warn('[Upload] Exceção no Cloudinary Direct, tentando fallback do servidor:', directErr?.message);
  }

  // 2. TENTATIVA SECUNDÁRIA: Rota interna /api/upload
  try {
    console.log('[Upload] Tentando envio alternativo via /api/upload...');
    
    // Converte Blob para base64 apenas para o endpoint interno
    const reader = new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(fileBlob);
    });
    const base64Data = await reader;

    const serverRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, data: base64Data }),
    });

    if (serverRes.ok) {
      const serverData = await serverRes.json();
      if (serverData?.url) {
        console.log('[Upload] Sucesso via /api/upload! URL:', serverData.url);
        return serverData.url;
      }
    } else {
      const errRes = await serverRes.json().catch(() => null);
      throw new Error(errRes?.error || `Falha no upload (HTTP ${serverRes.status})`);
    }
  } catch (fallbackErr: any) {
    console.error('[Upload] Falha em todos os provedores de upload:', fallbackErr);
    throw new Error(`Falha no upload do arquivo "${filename}": ${fallbackErr?.message || 'Erro desconhecido'}`);
  }

  throw new Error('Não foi possível obter uma URL pública para a mídia enviada.');
}
