import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;
const DATA_FILE = path.resolve(__dirname, 'src/data/persisted_state.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public/uploads');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  
  // High body size limit for media/images
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Serve uploads directory statically at /uploads
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Endpoint to handle permanent file uploads from any device
  app.post('/api/upload', (req, res) => {
    try {
      const { filename, data } = req.body;
      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      let base64Content = data;
      let ext = 'jpg';

      if (filename && filename.includes('.')) {
        ext = filename.split('.').pop() || 'jpg';
      } else if (data.startsWith('data:image/')) {
        const match = data.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
        if (match) ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      } else if (data.startsWith('data:video/')) {
        const match = data.match(/^data:video\/([a-zA-Z0-9+]+);base64,/);
        if (match) ext = match[1];
      }

      if (data.includes(';base64,')) {
        base64Content = data.split(';base64,')[1];
      }

      const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'jpg';
      const uniqueName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);
      const buffer = Buffer.from(base64Content, 'base64');

      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${uniqueName}`;
      console.log(`[Server] Saved upload: ${publicUrl} (${buffer.length} bytes)`);

      return res.json({ success: true, url: publicUrl, size: buffer.length });
    } catch (err: any) {
      console.error('[Server] Upload processing error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to save file' });
    }
  });

  // API to load synced application state for all devices (mobile, incognito, desktop)
  app.get('/api/state', (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return res.json(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('[Server] Error reading persisted state:', e);
    }
    return res.json(null);
  });

  // API to persist state across all devices
  app.post('/api/state', (req, res) => {
    try {
      const data = req.body;
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
      console.log('[Server] Saved updated application state to disk successfully.');
      return res.json({ success: true, timestamp: Date.now() });
    } catch (e: any) {
      console.error('[Server] Error saving state:', e);
      return res.status(500).json({ error: e?.message || 'Failed to save state' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true, 
        host: '0.0.0.0', 
        port: PORT,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] BioSaaS listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
