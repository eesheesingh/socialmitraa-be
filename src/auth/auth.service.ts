import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { UsersService } from "./users.service";
import { hashPassword, verifyPassword } from "./password.util";
import { signSessionToken } from "./jwt.util";
import {
  exchangeAuthCode,
  fetchKimiProfile,
  getUserIdFromAccessToken,
} from "./kimi.util";
import { env, SESSION_MAX_AGE_MS } from "../config/env";
import type { RegisterDto } from "./dto/register.dto";
import type { LoginDto } from "./dto/login.dto";

const EXP_SECONDS = Math.floor(SESSION_MAX_AGE_MS / 1000);

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  private sign(unionId: string): string {
    return signSessionToken(
      { unionId, clientId: env.appId },
      env.appSecret,
      EXP_SECONDS,
    );
  }

  async register(dto: RegisterDto): Promise<{ token: string }> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException("An account with this email already exists.");
    }
    const passwordHash = await hashPassword(dto.password);
    const unionId = `local:${randomUUID()}`;
    await this.users.createPasswordUser({
      unionId,
      name: dto.name.trim(),
      email,
      passwordHash,
    });
    return { token: this.sign(unionId) };
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    const ok = await verifyPassword(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    await this.users.touchLastSignIn(user.id);
    return { token: this.sign(user.unionId) };
  }

  // Exchange the OAuth code, upsert the user, and return a session token.
  async handleOAuthCallback(
    code: string,
    state: string,
  ): Promise<{ token: string }> {
    const redirectUri = Buffer.from(state, "base64").toString("utf8");
    const tokenResp = await exchangeAuthCode(code, redirectUri);
    const userId = getUserIdFromAccessToken(tokenResp.access_token);
    const profile = await fetchKimiProfile(tokenResp.access_token);
    await this.users.upsertOAuthUser({
      unionId: userId,
      name: profile?.name,
      avatar: profile?.avatar_url,
      lastSignInAt: new Date(),
    });
    return { token: this.sign(userId) };
  }
}
