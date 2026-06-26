import { env } from "../config/env";

export interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface KimiProfile {
  name?: string;
  avatar_url?: string;
}

export async function exchangeAuthCode(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.appId,
    redirect_uri: redirectUri,
    client_secret: env.appSecret,
  });

  const resp = await fetch(`${env.kimiAuthUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }
  return (await resp.json()) as TokenResponse;
}

// The access token is a signed JWT obtained over TLS from the code exchange.
// We decode (not cryptographically verify) the payload to read the user id.
export function getUserIdFromAccessToken(accessToken: string): string {
  const parts = accessToken.split(".");
  if (parts.length < 2) throw new Error("Malformed access token");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  const userId = payload.user_id as string;
  if (!userId) throw new Error("user_id missing from access token");
  return userId;
}

export async function fetchKimiProfile(
  accessToken: string,
): Promise<KimiProfile | null> {
  const resp = await fetch(`${env.kimiOpenUrl}/v1/users/me/profile`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!resp.ok) return null;
  return (await resp.json()) as KimiProfile;
}
