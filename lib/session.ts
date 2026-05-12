import { SessionOptions } from "iron-session";

export type User = { id: number; email: string; isAdmin?: boolean };

declare module "iron-session" {
  interface IronSessionData {
    user?: User;
  }
}

export const sessionOptions: SessionOptions = {
  password: "a_super_complex_secret_password_at_least_32_chars",
  cookieName: "amethyst_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};