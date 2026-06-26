import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { User } from "../db/schema";

@Controller("brands")
export class BrandsController {
  constructor(private readonly brands: BrandsService) {}

  @Public()
  @Get()
  list() {
    return this.brands.list();
  }

  @Get("me")
  myProfile(@CurrentUser() user: User) {
    return this.brands.getProfile(user.id);
  }

  @Put("me")
  upsert(@CurrentUser() user: User, @Body() dto: UpdateBrandDto) {
    return this.brands.upsertProfile(user.id, dto);
  }

  @Public()
  @Get(":id")
  getById(@Param("id", ParseIntPipe) id: number) {
    return this.brands.getById(id);
  }
}
