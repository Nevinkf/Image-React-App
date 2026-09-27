import { Router } from 'express';
import argon2 from 'argon2';
import { pool } from '../db.js';

const router = Router();

// New session ID on login prevents session-fixation attacks
function startSession(req, user) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
            if (err) return reject(err);
            req.session.userId = user.id;
            req.session.save((err) => (err ? reject(err) : resolve()));
        });
    });
}

router.post('/register', async (req, res) => {
    const {username, password} = req.body ?? {};
    if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return res.status(400).json({ error: 'Username must be 3-30 letters, numbers, or underscores'});
    }
     if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    try {
        const hash = await argon2.hash(password);
        const { rows } = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, hash]
        );
        await startSession(req, rows[0]);
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'That username is taken'});
        console.error('POST /api/auth/register failed:', err);
        res.status(500).json({ error: 'Failed to register' });
    }
});

router.post('/login', async (req, res) => {
    const {username, password } = req.body ?? {};
    if (typeof username !=='string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const { rows } = await pool.query(
            'SELECT id, username, password_hash FROM users WHERE LOWER (username) = LOWER($1)',
            [username]
        )
        const user = rows[0];
        // Same messafe for "no such user" and "wrong password" so usernames can't be probed
        if (!user || !(await argon2.verify(user.password_hash, password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        await startSession(req, user);
        res.json({ id: user.id, username: user.username });
    } catch (err) {
        console.error('POST /api/auth/login failed:', err);
        res.status(500).json({ error: 'Failed to log in' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err => {
        if (err) {
            console.error('POST /api/auth/logout failed:', err);
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.clearCookie('connect.sid');
        res.status(204).end();
    }));
});

// Client calls this on page load to restor the Logged-in user
router.get('/me', async (req, res) => {
    if (!req.session.userId) return res.json(null);
    try {
        const { rows } = await pool.query('SELECT id, username FROM users WHERE id = $1',
            [req.session.userId]);
        res.json(rows[0] ?? null);
    } catch (err) {
        console.error('GET /api/auth/me failed:', err);
        res.status(500).json({ error: 'Failed to load user'});
    }
});

export default router;