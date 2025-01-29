import Redis from "ioredis";
import { logger } from "../logger";

class RedisClient {
    private static instance: Redis | null = null;
    private static maxConnectionRetries: number = 0;

    private constructor() {}

    public static getInstance(): Redis {
        if (!RedisClient.instance) {
            try {
                RedisClient.instance = new Redis({
                    retryStrategy: (times) => {
                        if (times >= 3) {
                            logger.error("❌ Max Redis connection retries reached. Stopping retries.");
                            return 1000 * 30;
                        }
                        logger.warn(`⚠️ Redis retrying connection... Attempt #${times}`);
                        return Math.min(times * 100, 1000);
                    },
                    maxRetriesPerRequest: 3
                });
                RedisClient.instance.on("connect", () => {
                    logger.info("✅ Redis client connected");
                });
                RedisClient.instance.on("error", (err) => {
                    if (err.message.includes("ECONNREFUSED")){
                        if (this.maxConnectionRetries > 3) {
                            logger.error(`❌ Redis Quiting`);
                            return null;
                        }
                        ++this.maxConnectionRetries;
                    }
                    logger.error(`❌ Redis error: ${err.message}`);
                });
            } catch (err: any) {
                logger.error(`⚠️ Redis connection failed: ${err.message}`);
                throw new Error("Failed to initialize Redis client.");
            }
        }
        return RedisClient.instance;
    }
}

declare global {
    var redisClient: Redis | undefined;
}

globalThis.redisClient = RedisClient.getInstance();

export default RedisClient;