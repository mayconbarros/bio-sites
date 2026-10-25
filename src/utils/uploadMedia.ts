/**
 * Client-side file uploader.
 * Envia arquivos para o endpoint /api/upload no backend, que realiza o upload
 * direto para a nuvem (Cloudinary ou Vercel Blob) e retorna uma URL pública definitiva (https://...).
 * 
 * Regra de Ouro: NUNCA retorna ou salva dados em Base64 bruto no PostgreSQL / Neon,
 * prevenindo estouro de banco ou lentidão no carregamento.
 */
export async function uploadMediaFile(file: File | Blob, originalFilename?: string): Promise<string> {
  const name = originalFilename || (file instanceof File ? file.name : 'upload.jpg');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;

        // Envia para o backend para envio ao Cloudinary / Vercel Blob
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: name,
            data: base64Data,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const errMsg = errData?.error || `Erro HTTP ${res.status} no upload da imagem`;
          console.error('[uploadMediaFile] Falha no upload:', errMsg);
          return reject(new Error(errMsg));
        }

        const json = await res.json();
        if (json.url && typeof json.url === 'string') {
          console.log('[uploadMediaFile] Arquivo salvo na nuvem com URL pública:', json.url, `(Provedor: ${json.provider || 'cloud'})`);
          return resolve(json.url);
        }

        reject(new Error('Servidor não retornou uma URL válida para a mídia.'));
      } catch (err: any) {
        console.error('[uploadMediaFile] Erro de rede ou processamento no upload:', err);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    reader.onerror = (err) => reject(new Error('Erro ao ler o arquivo no navegador.'));
    reader.readAsDataURL(file);
  });
}
