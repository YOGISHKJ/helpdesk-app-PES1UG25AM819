// Yogish K J | PES1UG25AM819
import { createClient, type RedisClientType } from "redis";

type HelpRedis = RedisClientType;
const globalForRedis = globalThis as typeof globalThis & { helpDeskRedis?: HelpRedis; helpDeskRedisConnecting?: Promise<HelpRedis | null> };

export async function getRedis(): Promise<HelpRedis | null> {
  const client = globalForRedis.helpDeskRedis ?? createClient({
    url: process.env.REDIS_URL,
    socket: { connectTimeout: 1000, reconnectStrategy: false },
  });
  if (!globalForRedis.helpDeskRedis) {
    client.on("error", () => { /* Redis is optional; requests fall back to PostgreSQL. */ });
    globalForRedis.helpDeskRedis = client;
  }
  if (client.isReady) return client;
  if (globalForRedis.helpDeskRedisConnecting) return globalForRedis.helpDeskRedisConnecting;
  globalForRedis.helpDeskRedisConnecting = client.connect().then(() => client).catch(() => null).finally(() => {
    globalForRedis.helpDeskRedisConnecting = undefined;
  });
  return globalForRedis.helpDeskRedisConnecting;
}
