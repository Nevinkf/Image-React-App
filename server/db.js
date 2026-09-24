import pg from 'pg';

// pg also reads PG% env vars by default; listing them makes the dependency explicit.
export const pool = new pg.Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    // RDS equires SSL. To verify the cert later: ssl: {ca: fs.readFilesync('global-bundle.pem')}
    ssl: {rejectUnauthorized: false}
})