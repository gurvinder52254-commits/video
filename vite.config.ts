import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function localStorePlugin() {
  const storeDir = path.join(process.cwd(), 'src', 'storeData')
  const dataFile = path.join(storeDir, 'videos.json')
  const featuredFile = path.join(storeDir, 'featured.json')

  return {
    name: 'vite-plugin-local-store',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) return next();

        if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
        if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify([]));
        if (!fs.existsSync(featuredFile)) fs.writeFileSync(featuredFile, JSON.stringify([{ id: '1', url: "https://www.youtube.com/embed/nO_iH-m29pY" }]));

        if (req.url.startsWith('/api/upload/') && req.method === 'POST') {
          const filename = decodeURIComponent(req.url.split('/').pop() || 'upload');
          const filepath = path.join(storeDir, filename);
          const writeStream = fs.createWriteStream(filepath);
          req.pipe(writeStream);
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, url: `/src/storeData/${filename}` }));
          });
          return;
        }

        let bodyData = '';
        if (req.method === 'POST' || req.method === 'PUT') {
          req.on('data', (chunk: any) => { bodyData += chunk });
          req.on('end', () => {
            if (bodyData) req.body = JSON.parse(bodyData);
            handleApi();
          });
          return;
        }

        function handleApi() {
          res.setHeader('Content-Type', 'application/json');
          
          if (req.url === '/api/featured' && req.method === 'GET') {
            res.end(fs.readFileSync(featuredFile, 'utf-8'));
            return;
          }
          
          if (req.url === '/api/featured' && req.method === 'PUT') {
            fs.writeFileSync(featuredFile, JSON.stringify(req.body, null, 2));
            res.end(JSON.stringify({ success: true }));
            return;
          }

          if (req.url === '/api/videos' && req.method === 'GET') {
            res.end(fs.readFileSync(dataFile, 'utf-8'));
            return;
          }
          
          if (req.url === '/api/videos' && req.method === 'POST') {
            const current = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
            current.unshift(req.body);
            fs.writeFileSync(dataFile, JSON.stringify(current, null, 2));
            res.end(JSON.stringify({ success: true }));
            return;
          }

          if (req.url === '/api/videos' && req.method === 'PUT') {
            fs.writeFileSync(dataFile, JSON.stringify(req.body, null, 2));
            res.end(JSON.stringify({ success: true }));
            return;
          }

          if (req.url?.startsWith('/api/videos/') && req.method === 'DELETE') {
            const id = req.url.split('/').pop();
            const current = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
            const video = current.find((v: any) => v.id === id);
            if (video && video.isLocal) {
              const vPath = path.join(process.cwd(), video.url);
              const tPath = path.join(process.cwd(), video.thumbnail);
              try { if (fs.existsSync(vPath)) fs.unlinkSync(vPath); } catch(e){}
              try { if (fs.existsSync(tPath)) fs.unlinkSync(tPath); } catch(e){}
            }
            const updated = current.filter((v: any) => v.id !== id);
            fs.writeFileSync(dataFile, JSON.stringify(updated, null, 2));
            res.end(JSON.stringify({ success: true }));
            return;
          }
        }

        if (req.method === 'GET' || req.method === 'DELETE') {
          handleApi();
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localStorePlugin()],
})
