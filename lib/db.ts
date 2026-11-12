import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'amethyst.db')
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

/** Opens the database and brings its tables up to date. */
function open(): Database.Database {
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
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
    db.exec(`ALTER TABLE users RENAME COLUMN email TO username`)
  } catch { /* already renamed or column doesn't exist */ }

  try {
    db.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0`)
  } catch { /* column already exists */ }

  try {
    db.exec(`ALTER TABLE users ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'))`)
  } catch { /* column already exists */ }

  // Bumped when an admin resets a password, which signs that person out of every device.
  try {
    db.exec(`ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0`)
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

  db.exec(`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `)

  // Sign-in history, for the dashboard and for spotting someone trying your password.
  db.exec(`
    CREATE TABLE IF NOT EXISTS sign_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      ip TEXT,
      device TEXT,
      ok INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_sign_ins_user ON sign_ins(user_id, at);
  `)
  return db
}

const g = globalThis as unknown as { __amethystDb?: Database.Database }

/**
 * Opened on first use and shared by every part of the server, so a restore can close it and swap the file.
 * The next query opens it again.
 */
const db = new Proxy({} as Database.Database, {
  get(_target, prop) {
    const real = g.__amethystDb ?? (g.__amethystDb = open())
    const value = Reflect.get(real, prop)
    return typeof value === 'function' ? value.bind(real) : value
  },
})

export const DB_PATH = dbPath

/** Closes the database so a restore can swap the file. */
export function closeDb() {
  g.__amethystDb?.close()
  g.__amethystDb = undefined
}

export function getSiteConfig(): Record<string, string> {
  const rows = db.prepare("SELECT key, value FROM site_config").all() as { key: string; value: string }[]
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

export function setSiteConfigKey(key: string, value: string) {
  db.prepare("INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)").run(key, value)
}

export function userCount(): number {
  const row = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }
  return row.c
}

export function adminCount(): number {
  const row = db.prepare("SELECT COUNT(*) as c FROM users WHERE is_admin = 1").get() as { c: number }
  return row.c
}

export default db
