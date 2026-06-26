import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateBrandDto {
  @IsString()
  @MinLength(1)
  companyName!: string;

  @IsOptional() @IsString() brandName?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() teamSize?: string;
  @IsOptional() @IsString() budgetRange?: string;
  @IsOptional() @IsString() logo?: string;
}
