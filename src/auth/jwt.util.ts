import { createHmac, timingSafeEqual } from "crypto";

// Minimal HS256 JWT, compatible with the tokens issued by the legacy Hono
// backend (same alg + APP_SECRET + { unionId, clientId } payload), so a
// session cookie issued by either backend is accepted by both.

export interface SessionPayload {
  unionId: string;
  clientId: string;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

export function signSessionToken(
  payload: SessionPayload,
  secret: string,
  expSeconds: number,
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expSeconds };
  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(body))}`;
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifySessionToken(
  token: string,
  secret: string,
): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = createHmac("sha256", secret)
    .update(`${h}.${p}`)
    .digest("base64url");
  const a = Buffer.from(s);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(p, "base64url").toString());
    if (
      typeof payload.exp === "number" &&
      Math.floor(Date.now() / 1000) > payload.exp
    ) {
      return null;
    }
    if (!payload.unionId || !payload.clientId) return null;
    return { unionId: payload.unionId, clientId: payload.clientId };
  } catch {
    return null;
  }
}
