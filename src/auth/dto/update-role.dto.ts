import { IsIn } from "class-validator";

export class UpdateRoleDto {
  @IsIn(["user", "brand", "influencer", "admin"])
  role!: "user" | "brand" | "influencer" | "admin";
}
