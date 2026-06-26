import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB, type Database } from "../db/drizzle.module";
import { users, type InsertUser, type User } from "../db/schema";
import { env } from "../config/env";

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async findByUnionId(unionId: string): Promise<User | undefined> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.unionId, unionId))
      .limit(1);
    return rows.at(0);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return rows.at(0);
  }

  async findById(id: number): Promise<User | undefined> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return rows.at(0);
  }

  // OAuth upsert: insert on first login, update profile + role on return.
  async upsertOAuthUser(data: InsertUser): Promise<void> {
    const values = { ...data };
    const updateSet: Partial<InsertUser> = {
      lastSignInAt: new Date(),
      ...data,
    };
    if (
      values.role === undefined &&
      values.unionId &&
      values.unionId === env.ownerUnionId
    ) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    await this.db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({ target: users.unionId, set: updateSet });
  }

  async createPasswordUser(data: {
    unionId: string;
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<void> {
    await this.db.insert(users).values(data);
  }

  async touchLastSignIn(id: number): Promise<void> {
    await this.db
      .update(users)
      .set({ lastSignInAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateRole(id: number, role: User["role"]): Promise<void> {
    await this.db.update(users).set({ role }).where(eq(users.id, id));
  }

  async completeOnboarding(id: number): Promise<void> {
    await this.db
      .update(users)
      .set({ onboardingComplete: true })
      .where(eq(users.id, id));
  }

  // Strip sensitive fields before sending a user to the client.
  sanitize(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
