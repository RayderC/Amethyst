import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.resolve(process.cwd(), 'amethyst.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    tech_stack TEXT NOT NULL DEFAULT '[]',
    github_url TEXT NOT NULL DEFAULT '',
    live_url TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    gallery TEXT NOT NULL DEFAULT '[]',
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

try {
  db.exec(`ALTER TABLE projects ADD COLUMN gallery TEXT NOT NULL DEFAULT '[]'`)
} catch { /* column already exists */ }

try {
  db.exec(`ALTER TABLE projects ADD COLUMN youtube_url TEXT NOT NULL DEFAULT ''`)
} catch { /* column already exists */ }

export default db