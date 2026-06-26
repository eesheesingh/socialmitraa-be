// Centralised env access. ConfigModule loads .env into process.env at boot.
export const env = {
  get port(): number {
    return parseInt(process.env.PORT || "3001", 10);
  },
  get frontendUrl(): string {
    return process.env.FRONTEND_URL || "http://localhost:3000";
  },
  get appId(): string {
    return process.env.APP_ID || "";
  },
  get appSecret(): string {
    return process.env.APP_SECRET || "";
  },
  get databaseUrl(): string {
    return process.env.DATABASE_URL || "";
  },
  get kimiAuthUrl(): string {
    return process.env.KIMI_AUTH_URL || "";
  },
  get kimiOpenUrl(): string {
    return process.env.KIMI_OPEN_URL || "";
  },
  get ownerUnionId(): string {
    return process.env.OWNER_UNION_ID || "";
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
};

export const SESSION_COOKIE = "kimi_sid";
export const SESSION_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
