import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class UpdateCampaignDto {
  @IsOptional() @IsString() @MinLength(1) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() requirements?: string;

  @IsOptional()
  @IsIn(["instagram", "youtube", "tiktok", "all"])
  platform?: "instagram" | "youtube" | "tiktok" | "all";

  @IsOptional()
  @IsIn(["post", "story", "reel", "all"])
  contentType?: "post" | "story" | "reel" | "all";

  @IsOptional() @IsNumber() budget?: number;
  @IsOptional() @IsInt() creatorCount?: number;
  @IsOptional() @IsString() niche?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsInt() followerMin?: number;
  @IsOptional() @IsInt() followerMax?: number;

  @IsOptional()
  @IsIn(["draft", "active", "paused", "completed", "cancelled"])
  status?: "draft" | "active" | "paused" | "completed" | "cancelled";

  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
}
