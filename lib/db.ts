import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'amethyst.db')
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
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

try {
  db.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0`)
} catch { /* column already exists */ }

try {
  db.exec(`ALTER TABLE users ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'))`)
} catch { /* column already exists */ }

db.exec(`
  CREATE TABLE IF NOT EXISTS service_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'General',
    icon_url TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

export function userCount(): number {
  const row = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }
  return row.c
}

export function adminCount(): number {
  const row = db.prepare("SELECT COUNT(*) as c FROM users WHERE is_admin = 1").get() as { c: number }
  return row.c
}

export default db
