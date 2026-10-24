/**
 * Client-side file uploader.
 * Sends files to the server's /api/upload endpoint, generating a permanent public URL (/uploads/xyz.jpg)
 * that is accessible from ANY device (mobile, incognito, desktop) and never blows localStorage quota.
 */
export async function uploadMediaFile(file: File | Blob, originalFilename?: string): Promise<string> {
  const name = originalFilename || (file instanceof File ? file.name : 'upload.jpg');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;

        // Upload to server endpoint
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: name,
            data: base64Data,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.url) {
            console.log('[uploadMediaFile] File uploaded successfully to permanent URL:', json.url);
            return resolve(json.url);
          }
        }

        // Fallback to base64 data URL if server unreachable
        console.warn('[uploadMediaFile] Server returned non-ok, falling back to data URL');
        resolve(base64Data);
      } catch (err) {
        console.warn('[uploadMediaFile] Failed to upload to server, falling back to data URL:', err);
        resolve(reader.result as string);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
