import type { Request, Response } from "express";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "../config/env";

function isLocalhost(req: Request): boolean {
  const host = req.headers.host || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function setSessionCookie(req: Request, res: Response, token: string) {
  const localhost = isLocalhost(req);
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    sameSite: localhost ? "lax" : "none",
    secure: !localhost,
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookie(req: Request, res: Response) {
  const localhost = isLocalhost(req);
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    path: "/",
    sameSite: localhost ? "lax" : "none",
    secure: !localhost,
  });
}
