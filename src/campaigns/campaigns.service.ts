import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { DB, type Database } from "../db/drizzle.module";
import { campaigns, campaignApplications } from "../db/schema";
import type { CreateCampaignDto } from "./dto/create-campaign.dto";
import type { UpdateCampaignDto } from "./dto/update-campaign.dto";
import type { ApplyDto } from "./dto/apply.dto";

@Injectable()
export class CampaignsService {
  constructor(@Inject(DB) private readonly db: Database) {}

  listActive() {
    return this.db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, "active"))
      .orderBy(desc(campaigns.createdAt))
      .limit(50);
  }

  listForBrand(brandId: number) {
    return this.db
      .select()
      .from(campaigns)
      .where(eq(campaigns.brandId, brandId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getById(id: number) {
    const rows = await this.db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);
    return rows.at(0) ?? null;
  }

  async create(brandId: number, input: CreateCampaignDto) {
    const insertData: Record<string, unknown> = {
      brandId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      platform: input.platform ?? "all",
      contentType: input.contentType ?? "all",
      niche: input.niche,
      location: input.location,
      creatorCount: input.creatorCount,
      followerMin: input.followerMin,
      followerMax: input.followerMax,
      status: "active",
    };
    if (input.budget !== undefined) insertData.budget = input.budget.toString();
    if (input.startDate) insertData.startDate = new Date(input.startDate);
    if (input.endDate) insertData.endDate = new Date(input.endDate);

    const result = await this.db
      .insert(campaigns)
      .values(insertData as typeof campaigns.$inferInsert)
      .returning({ insertId: campaigns.id });
    return { success: true, campaignId: Number(result[0].insertId) };
  }

  async update(brandId: number, id: number, input: UpdateCampaignDto) {
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.requirements !== undefined) updateData.requirements = input.requirements;
    if (input.platform !== undefined) updateData.platform = input.platform;
    if (input.contentType !== undefined) updateData.contentType = input.contentType;
    if (input.budget !== undefined) updateData.budget = input.budget.toString();
    if (input.creatorCount !== undefined) updateData.creatorCount = input.creatorCount;
    if (input.niche !== undefined) updateData.niche = input.niche;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.followerMin !== undefined) updateData.followerMin = input.followerMin;
    if (input.followerMax !== undefined) updateData.followerMax = input.followerMax;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) updateData.endDate = new Date(input.endDate);
    updateData.updatedAt = new Date();

    await this.db
      .update(campaigns)
      .set(updateData as typeof campaigns.$inferInsert)
      .where(and(eq(campaigns.id, id), eq(campaigns.brandId, brandId)));
    return { success: true };
  }

  async apply(influencerId: number, campaignId: number, input: ApplyDto) {
    const insertData: Record<string, unknown> = {
      campaignId,
      influencerId,
      message: input.message,
    };
    if (input.proposedRate !== undefined) {
      insertData.proposedRate = input.proposedRate.toString();
    }
    await this.db
      .insert(campaignApplications)
      .values(insertData as typeof campaignApplications.$inferInsert);
    return { success: true };
  }

  listMyApplications(influencerId: number) {
    return this.db
      .select()
      .from(campaignApplications)
      .where(eq(campaignApplications.influencerId, influencerId))
      .orderBy(desc(campaignApplications.createdAt));
  }

  async listApplicationsForCampaign(brandId: number, campaignId: number) {
    const campaign = await this.getById(campaignId);
    if (!campaign || campaign.brandId !== brandId) {
      throw new ForbiddenException("Not your campaign");
    }
    return this.db
      .select()
      .from(campaignApplications)
      .where(eq(campaignApplications.campaignId, campaignId))
      .orderBy(desc(campaignApplications.createdAt));
  }
}
