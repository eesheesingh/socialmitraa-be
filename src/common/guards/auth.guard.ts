import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { UsersService } from "../../auth/users.service";
import { verifySessionToken } from "../../auth/jwt.util";
import { env, SESSION_COOKIE } from "../../config/env";
import type { User } from "../../db/schema";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[SESSION_COOKIE];

    let user: User | undefined;
    if (token) {
      const claim = verifySessionToken(token, env.appSecret);
      if (claim) {
        user = await this.usersService.findByUnionId(claim.unionId);
      }
    }

    if (user) {
      (request as Request & { user?: unknown }).user = user;
      return true;
    }

    // No valid session: public routes proceed (without a user), others reject.
    if (isPublic) return true;
    throw new UnauthorizedException("Authentication required");
  }
}
