import db from "./db";

export function isAdminUser(userId: number | undefined): boolean {
  if (!userId) return false;
  const row = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(userId) as { is_admin: number } | undefined;
  return row?.is_admin === 1;
}
