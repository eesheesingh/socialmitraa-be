import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { User } from "../../db/schema";

// Injects the authenticated user (attached by AuthGuard) into a handler param.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
