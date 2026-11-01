// Yogish K J | PES1UG25AM819
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & { helpDeskPool?: Pool };
export const pool = globalForDb.helpDeskPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.helpDeskPool = pool;
