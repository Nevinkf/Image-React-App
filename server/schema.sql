CREATE TABLE IF NOT EXISTS images (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  s3_key     TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Case-insensitive uniqueness: "Bob" and "bob" are the same account
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (LOWER(username));

-- Nullable: images uploaded before this change have no owner
ALTER TABLE images ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS likes (
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_id   INT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, image_id)
);
CREATE INDEX IF NOT EXISTS likes_image_id_idx ON likes (image_id);
