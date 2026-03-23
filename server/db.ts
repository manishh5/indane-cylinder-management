import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

console.log("ENV CHECK:", process.env.DATABASE_URL);

const { Pool } = pg;

const DATABASE_URL = "postgresql://neondb_owner:npg_IQfORLC54WXt@ep-orange-hall-an6ltezy.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });
