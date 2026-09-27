import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sessionMiddleware } from './auth.js';
import authRoutes from './routes/auth.js';
import imageRoutes from './routes/images.js';

const app = express();

// Behind a load balancer or nginx in prod: needed so `secure` cookies are set over the proxied HTTPS
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(express.json());
app.use(sessionMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);

// Turn multer errors (e.g. file too large) into JSON 400s instead of HTML 500s
app.use('/api', (err, req, res, next) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '../client/dist');

app.use(express.static(dist));
app.get(/.*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
