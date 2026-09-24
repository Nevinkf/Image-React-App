import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';
import { signedUrl } from './s3.js';

const app = express();
app.use(express.json());

app.get('/api/hello', (req, res) => {
    res.json({message: "Hello from Express"});
});

app.get('/api/images', async (req, res) => {
    const { rows } = await pool.query(
        'SELECT id, title, s3_key FROM images ORDER BY created_at DESC'
    );
    const images = await Promise.all(rows.map(async (r) => ({
        id: r.id,
        title: r.title,
        url: await signedUrl(r.s3_key),
    })))
    res.json(images);
})

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '../client/dist');

app.use(express.static(dist));
app.get(/.*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
