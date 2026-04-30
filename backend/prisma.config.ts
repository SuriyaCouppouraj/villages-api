import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

const CONNECTION_STRING = "postgresql://neondb_owner:npg_hPUFyABHf76W@ep-shy-brook-aoy51pmk-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: CONNECTION_STRING,
  },
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      const { neonConfig, Pool } = await import("@neondatabase/serverless");
      const ws = await import("ws");
      neonConfig.webSocketConstructor = ws.default;
      const pool = new Pool({ connectionString: CONNECTION_STRING });
      return new PrismaNeon(pool);
    },
  },
});