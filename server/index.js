import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';
import { signedUrl } from './s3.js';
import e from 'express';
import { error } from 'node:console';

const app = express();
app.use(express.json());

app.get('/api/hello', (req, res) => {
    res.json({message: "Hello from Express"});
});


app.get('/api/images', async (req, res) => {
    try {
         const { rows } = await pool.query(
        'SELECT id, title, s3_key FROM images ORDER BY created_at DESC'
        );
        const images = await Promise.all(rows.map(async (r) => ({
            id: r.id,
            title: r.title,
            url: await signedUrl(r.s3_key),
        })))
        res.json(images);
    } catch (err) {
        console.error('GET /api/images failed:', err)
        res.status(500).json({error: 'Failed to load images'})
    }
})


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '../client/dist');

app.use(express.static(dist));
app.get(/.*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
