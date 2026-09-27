import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { pool } from '../db.js';
import { signedUrl, uploadObject } from '../s3.js';
import { requireAuth } from '../auth.js';

const router = Router();

const ALLOWED_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024}, // 10 MB
    fileFilter: (req, file, cb) => cb(null, file.mimetype in ALLOWED_TYPES),
});

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT i.id, i.title, i.s3_key, u.username AS uploader,
                   COUNT(l.user_id)::int AS like_count,
                   COALESCE(BOOL_OR(l.user_id = $1), false) AS liked_by_me
            FROM images i
            LEFT JOIN users u ON u.id = i.user_id
            LEFT JOIN likes l ON l.image_id = i.id
            GROUP BY i.id, u.username
            ORDER BY i.created_at DESC`,
            [req.session.userId ?? null]
        );
        const images = await Promise.all(rows.map(async (r) => ({
            id: r.id,
            title: r.title,
            uploader: r.uploader,
            likeCount: r.like_count,
            likedByMe: r.liked_by_me,
            url: await signedUrl(r.s3_key),
        })));
        res.json(images);
    } catch (err) {
        console.error('GET /api/images failed:', err);
        res.status(500).json({ error: 'Failed to load images' });
    }
});

// requireAuth runs first so anonymous requests are rejected before the file is buffered
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
    const title = req.body.title?.trim();
    if (!req.file) return res.status(400).json({ error: 'Choose a JPEG, PNG, GIF, or WebP image' });
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const key = `uploads/${req.session.userId}/${randomUUID()}${ALLOWED_TYPES[req.file.mimetype]}`;
    try {
        await uploadObject(key, req.file.buffer, req.file.mimetype);
        const { rows } = await pool.query(
            'INSERT INTO images (title, s3_key, user_id) VALUES ($1, $2, $3) RETURNING id',
            [title, key, req.session.userId]
        );
        res.status(201).json({ id: rows[0].id });
    } catch (err) {
        console.error('POST /api/images failed:', err);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

async function setLike(req, res, liked) {
    const imageId = Number(req.params.id);
    if (!Number.isInteger(imageId)) return res.status(400).json({ error: 'Invalid image id' });
    try {
        if (liked) {
            await pool.query(
                'INSERT INTO likes (user_id, image_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [req.session.userId, imageId]
            );
        } else {
            await pool.query(
                'DELETE FROM likes WHERE user_id = $1 AND image_id = $2',
                [req.session.userId, imageId]
            );
        }
        const { rows } = await pool.query(
            'SELECT COUNT(*)::int AS count FROM likes WHERE image_id = $1',
            [imageId]
        );
        res.json({ likeCount: rows[0].count, likedByMe: liked });
    } catch (err) {
        if (err.code === '23503') return res.status(404).json({ error: 'Image not found' });
        console.error(`${req.method} /api/images/${req.params.id}/like failed:`, err);
        res.status(500).json({ error: 'Failed to update like' });
    }
}

router.post('/:id/like', requireAuth, (req, res) => setLike(req, res, true));
router.delete('/:id/like', requireAuth, (req, res) => setLike(req, res, false));

export default router;