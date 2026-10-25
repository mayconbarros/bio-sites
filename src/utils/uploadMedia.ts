/**
 * Upload direto para a API do Cloudinary a partir do navegador (Client-side Direct Upload).
 * 
 * Ignora o servidor Node.js/server.ts para evitar estouros de payload (413 Payload Too Large)
 * ou limites de timeout (504 Gateway Timeout) na Vercel ao subir vídeos e imagens pesadas.
 */

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/je065pkr/auto/upload';
const UPLOAD_PRESET = 'meus_videos';

export async function uploadMediaFile(file: File | Blob, originalFilename?: string): Promise<string> {
  const filename = originalFilename || (file instanceof File ? file.name : 'upload.jpg');

  try {
    console.log(`[Cloudinary Direct] Iniciando upload direto de "${filename}" (${file.size} bytes)...`);

    // 1. Cria o FormData com o arquivo e o preset unsigned configurado no Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    // 2. Envia diretamente para a API do Cloudinary via POST
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || `Erro HTTP ${response.status} ao enviar para o Cloudinary`;
      console.error('[Cloudinary Direct] Falha na resposta:', errorMessage, errorData);
      throw new Error(errorMessage);
    }

    // 3. Obtém a resposta JSON com a secure_url
    const data = await response.json();

    if (!data.secure_url) {
      console.error('[Cloudinary Direct] Resposta sem secure_url:', data);
      throw new Error('O Cloudinary não retornou uma URL segura (secure_url).');
    }

    console.log('[Cloudinary Direct] Sucesso! URL pública gerada:', data.secure_url);
    return data.secure_url;
  } catch (error: any) {
    console.error('[Cloudinary Direct] Erro no upload direto:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}