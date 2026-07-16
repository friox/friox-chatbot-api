import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: './src/modules/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'data/data.db',
  },
});
