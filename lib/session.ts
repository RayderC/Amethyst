import { SessionOptions } from "iron-session";

export type User = { id: number; email: string; isAdmin?: boolean };

declare module "iron-session" {
  interface IronSessionData {
    user?: User;
  }
}

const sessionPassword =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? ""
    : "a_super_complex_secret_password_at_least_32_chars");

if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error(
    "SESSION_SECRET environment variable must be set to a string of at least 32 characters"
  );
}

const secureCookie =
  process.env.SESSION_COOKIE_SECURE != null
    ? process.env.SESSION_COOKIE_SECURE === "true"
    : process.env.NODE_ENV === "production";

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "amethyst_session",
  cookieOptions: {
    secure: secureCookie,
  },
};
