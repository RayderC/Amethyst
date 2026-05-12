export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmail = process.env.ADMIN_EMAIL || "rayder.chance@gmail.com";
  return email === adminEmail;
}
