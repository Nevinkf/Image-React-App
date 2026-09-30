# Image React App

A full-stack image sharing app. Users can create an account, upload images with a title and tags, browse a shared gallery, search it, and like images.

- **Frontend:** React 19, TypeScript, Vite, React Bootstrap
- **Backend:** Node.js, Express 5
- **Database:** PostgreSQL (built for AWS RDS)
- **Image storage:** AWS S3
- **Hosting:** Designed to run on an AWS EC2 instance (Debian) behind nginx

## Features

- **Accounts:** Register, log in, and log out. Passwords are hashed with Argon2. Sessions are stored in PostgreSQL and last 30 days, so users stay logged in across visits.
- **Uploads:** Logged-in users can upload JPEG, PNG, GIF, or WebP images up to 10 MB. Each image has a required title and up to 10 optional tags.
- **Gallery:** All images are shown newest first, with the uploader's name, tags, and like count.
- **Likes:** Logged-in users can like and unlike images. The button updates right away and rolls back if the server request fails.
- **Search:** One search box matches image titles, uploader usernames, and tags. Input is debounced so the server is not hit on every keystroke.
- **Tag filter:** Clicking a tag on any image filters the gallery to that tag. The filter can be combined with a text search and cleared with one click.

## Project Structure

```
.
├── client/                 React frontend (Vite)
│   └── src/
│       ├── App.tsx         Gallery, likes, search and tag state
│       ├── AuthContext.tsx Current user state, restored on page load
│       ├── AuthModal.tsx   Login and register form
│       ├── UploadModal.tsx Image upload form
│       ├── SearchBar.tsx   Search box and active tag filter
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── api.ts          Fetch helpers that surface server error messages
│       └── useDebounced.ts
├── server/                 Express backend
│   ├── index.js            App setup, routes, serves the built client
│   ├── auth.js             Session middleware and requireAuth guard
│   ├── db.js               PostgreSQL connection pool
│   ├── s3.js               S3 upload and signed URL helpers
│   ├── schema.sql          Database schema
│   └── routes/
│       ├── auth.js         /api/auth endpoints
│       └── images.js       /api/images endpoints
├── documentation/          Flow chart and front page mockup
└── package.json            Root scripts to run client and server together
```

## Getting Started

### Prerequisites

- Node.js (a version with `node --watch` support, 18.11 or newer)
- A PostgreSQL database (the connection uses SSL, as required by RDS)
- An S3 bucket and AWS credentials with read and write access to it. On EC2 these come from the instance role; locally they come from `~/.aws/credentials`.

### Install

Install dependencies for the root, server, and client:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### Configure

Copy `server/.env.example` to `server/.env` and fill in the values:

| Variable         | Description                                  |
| ---------------- | -------------------------------------------- |
| `PGHOST`         | PostgreSQL host                              |
| `PGPORT`         | PostgreSQL port (defaults to 5432)           |
| `PGDATABASE`     | Database name                                |
| `PGUSER`         | Database user                                |
| `PGPASSWORD`     | Database password                            |
| `AWS_REGION`     | Region of the S3 bucket                      |
| `S3_BUCKET`      | Name of the S3 bucket for uploads            |
| `SESSION_SECRET` | Long random string used to sign session cookies (required) |

The server also reads an optional `PORT` (defaults to 3001).

### Set Up the Database

Run the schema against your database. It is safe to run more than once.

```bash
psql -f server/schema.sql
```

The session table is created automatically the first time the server starts.

### Run in Development

From the project root:

```bash
npm run dev
```

This starts the API on `http://localhost:3001` and the Vite dev server (usually `http://localhost:5173`). Vite proxies `/api` requests to the API server.

### Build for Production

```bash
npm run build
npm start --prefix server
```

The server serves the built client from `client/dist` along with the API, so only one process is needed. When running behind nginx, the server trusts the `X-Forwarded-Proto` header so session cookies are marked secure over HTTPS.

## API

All endpoints are under `/api`. Errors are returned as JSON in the form `{ "error": "message" }`.

### Auth

| Method | Path                 | Description                                           |
| ------ | -------------------- | ----------------------------------------------------- |
| POST   | `/api/auth/register` | Create an account and log in. Body: `username`, `password` |
| POST   | `/api/auth/login`    | Log in. Body: `username`, `password`                  |
| POST   | `/api/auth/logout`   | Log out                                               |
| GET    | `/api/auth/me`       | Current user, or `null` if not logged in              |

Usernames are 3 to 30 letters, numbers, or underscores and are case-insensitive. Passwords must be at least 8 characters.

### Images

| Method | Path                    | Auth     | Description |
| ------ | ----------------------- | -------- | ----------- |
| GET    | `/api/images`           | Optional | List images, newest first. Optional query params: `q` (search text), `tag` (exact tag) |
| POST   | `/api/images`           | Required | Upload an image. Multipart form: `image`, `title`, `tags` (comma-separated) |
| POST   | `/api/images/:id/like`  | Required | Like an image |
| DELETE | `/api/images/:id/like`  | Required | Remove a like |

Image URLs in the list response are S3 signed URLs that expire after one hour, so the bucket itself can stay private.

## Database Schema

- **users:** `id`, `username` (unique, case-insensitive), `password_hash`, `created_at`
- **images:** `id`, `title`, `s3_key`, `user_id` (uploader), `tags` (text array, GIN indexed), `created_at`
- **likes:** `user_id`, `image_id`, `created_at`, with one like per user per image

Tags are stored lowercase without a leading `#`, so `#Sunset` and `sunset` are the same tag.

## Security Notes

- Passwords are hashed with Argon2.
- The session ID is regenerated on login to prevent session fixation.
- Session cookies are `httpOnly` and `sameSite=lax`.
- Login returns the same error for an unknown user and a wrong password, so usernames cannot be probed.
- Uploads are checked for allowed image types and size, and anonymous upload requests are rejected before the file is read.
- All database queries are parameterized, and search input is escaped so characters like `%` and `_` match literally.

## Documentation

The `documentation/` folder contains a flow chart of the app (`Flow Chart - Image.drawio`) and a mockup of the front page (`Front Page Mockup.png`).
