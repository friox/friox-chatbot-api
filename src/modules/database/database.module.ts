import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { TOKENS } from "src/common/constants/di-tokens";

@Global()
@Module({
  providers: [
    {
      provide: TOKENS.DATABASE_CONNECTION,
      useFactory: (config: ConfigService) => {
        const sqlite = new Database('./data/data.db');
        const db = drizzle({ client: sqlite });
        return db;
      },
      inject: [ConfigService],
    }
  ],
  exports: [TOKENS.DATABASE_CONNECTION],
})
export class DatabaseModule {}
