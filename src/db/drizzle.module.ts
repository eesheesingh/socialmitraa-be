import { Global, Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as relations from "./relations";

export const DB = Symbol("DB");

const fullSchema = { ...schema, ...relations };
export type Database = ReturnType<typeof drizzle<typeof fullSchema>>;

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: (): Database => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          throw new Error("DATABASE_URL is required");
        }
        const pool = new Pool({ connectionString });
        return drizzle(pool, { schema: fullSchema });
      },
    },
  ],
  exports: [DB],
})
export class DrizzleModule {}
