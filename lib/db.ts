import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.resolve(process.cwd(), 'amethyst.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`)

export default db