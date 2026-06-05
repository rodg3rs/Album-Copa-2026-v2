import { createClient } from "@libsql/client/web";

export function getTurso() {
  const url = process.env.TURSO_URL;
  const authToken = process.env.TURSO_TOKEN;
  if (!url) throw new Error("TURSO_URL is not set");
  return createClient({ url, authToken });
}

function getSessionPassword() {
  const raw = process.env.SESSION_SECRET || "figurinhas2026";
  // h3 requires >=32 chars; pad short secrets deterministically.
  return raw.length >= 32 ? raw : (raw + "-figurinhas2026-album-copa-2026!!").padEnd(32, "x");
}

export const sessionConfig = {
  password: getSessionPassword(),
  name: "album_session",
  maxAge: 60 * 60 * 24 * 7,
  cookie: {
    httpOnly: true,
    sameSite: "none" as const,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export type SessionData = {
  user?: { ID: number; Nome: string };
};
