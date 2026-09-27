import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db.js";

if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is not set');

const PgStore = connectPgSimple(session);

export const sessionMiddleware = session({
    store: new PgStore({pool, createTableIfMissing: true}),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // don't create sessions for anonymous visitors
    cookie: {
        httpOnly: true, // JS can't read it, so XSS can't steal the session
        sameSite: 'lax', // blocks cross-site POST/DELETE (CSRF)
        secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
})

export function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({error: 'You must be logged in'});
    next();
}