import { Module } from "@nestjs/common";
import { AuthController, OAuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";

@Module({
  controllers: [AuthController, OAuthController],
  providers: [AuthService, UsersService],
  exports: [UsersService],
})
export class AuthModule {}
