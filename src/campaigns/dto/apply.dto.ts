import { IsNumber, IsOptional, IsString } from "class-validator";

export class ApplyDto {
  @IsOptional() @IsString() message?: string;
  @IsOptional() @IsNumber() proposedRate?: number;
}
