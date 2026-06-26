import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { setSessionCookie, clearSessionCookie } from "./cookie.util";
import { env } from "../config/env";
import type { User } from "../db/schema";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.auth.register(dto);
    setSessionCookie(req, res, token);
    return { success: true };
  }

  @Public()
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.auth.login(dto);
    setSessionCookie(req, res, token);
    return { success: true };
  }

  @Post("logout")
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    clearSessionCookie(req, res);
    return { success: true };
  }

  @Get("me")
  me(@CurrentUser() user: User) {
    return this.users.sanitize(user);
  }

  @Patch("role")
  async updateRole(@CurrentUser() user: User, @Body() dto: UpdateRoleDto) {
    await this.users.updateRole(user.id, dto.role);
    return { success: true, role: dto.role };
  }

  @Post("complete-onboarding")
  async completeOnboarding(@CurrentUser() user: User) {
    await this.users.completeOnboarding(user.id);
    return { success: true };
  }
}

// OAuth callback lives at /api/oauth/callback to match the Kimi redirect path.
@Controller("oauth")
export class OAuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get("callback")
  async callback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Query("error") error: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (error) {
      return res.redirect(env.frontendUrl);
    }
    if (!code || !state) {
      return res.status(400).json({ error: "code and state are required" });
    }
    try {
      const { token } = await this.auth.handleOAuthCallback(code, state);
      setSessionCookie(req, res, token);
      return res.redirect(env.frontendUrl);
    } catch (e) {
      console.error("[OAuth] Callback failed", e);
      return res.status(500).json({ error: "OAuth callback failed" });
    }
  }
}
