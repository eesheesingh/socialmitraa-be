import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CampaignsService } from "./campaigns.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";
import { ApplyDto } from "./dto/apply.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { User } from "../db/schema";

@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  // Specific routes must be declared before the ":id" wildcard.
  @Public()
  @Get()
  list() {
    return this.campaigns.listActive();
  }

  @Get("mine")
  mine(@CurrentUser() user: User) {
    return this.campaigns.listForBrand(user.id);
  }

  @Get("applications/mine")
  myApplications(@CurrentUser() user: User) {
    return this.campaigns.listMyApplications(user.id);
  }

  @Public()
  @Get(":id")
  getById(@Param("id", ParseIntPipe) id: number) {
    return this.campaigns.getById(id);
  }

  @Get(":id/applications")
  applications(
    @CurrentUser() user: User,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.campaigns.listApplicationsForCampaign(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateCampaignDto) {
    return this.campaigns.create(user.id, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: User,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaigns.update(user.id, id, dto);
  }

  @Post(":id/apply")
  apply(
    @CurrentUser() user: User,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ApplyDto,
  ) {
    return this.campaigns.apply(user.id, id, dto);
  }
}
