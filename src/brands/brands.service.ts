import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB, type Database } from "../db/drizzle.module";
import { brandProfiles, users } from "../db/schema";
import type { UpdateBrandDto } from "./dto/update-brand.dto";

@Injectable()
export class BrandsService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async getProfile(userId: number) {
    const rows = await this.db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.userId, userId))
      .limit(1);
    return rows.at(0) ?? null;
  }

  async upsertProfile(userId: number, input: UpdateBrandDto) {
    const existing = await this.getProfile(userId);
    if (existing) {
      await this.db
        .update(brandProfiles)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(brandProfiles.userId, userId));
      return { success: true, updated: true };
    }
    await this.db.insert(brandProfiles).values({ ...input, userId });
    return { success: true, updated: false };
  }

  list() {
    return this.db
      .select({
        id: brandProfiles.id,
        companyName: brandProfiles.companyName,
        brandName: brandProfiles.brandName,
        industry: brandProfiles.industry,
        location: brandProfiles.location,
        logo: brandProfiles.logo,
        verified: brandProfiles.verified,
        userId: brandProfiles.userId,
      })
      .from(brandProfiles)
      .innerJoin(users, eq(brandProfiles.userId, users.id));
  }

  async getById(id: number) {
    const rows = await this.db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.id, id))
      .limit(1);
    return rows.at(0) ?? null;
  }
}
