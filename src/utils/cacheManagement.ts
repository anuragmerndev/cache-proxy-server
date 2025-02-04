import axios from "axios";
import { AllUrlResponseFormat, CacheType, SingleResponseFormat } from "../type";
import Redis from "ioredis";
import { logger } from "../logger";
import RedisClient from "../config/redis";
import { deleteExpiredKey } from "./helper";

// cache management abstract
abstract class CacheManagement {
    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public getData(url: string) { }
    public getAllCachedUrl() { }
    public totalUrlCached() { }
}

class LocalCacheManagement extends CacheManagement {
    private cachedUrls: Map<string, object>;

    constructor(host: string) {
        super(host)
        this.cachedUrls = new Map();
    }

    public async getData(url: string): Promise<SingleResponseFormat> {
        try {

            if (this.cachedUrls.has(url)) {
                return {
                    data: this.cachedUrls.get(url) || {},
                    type: CacheType.HIT,
                }
            }

            const apiData = await axios.get(url);
            this.cachedUrls.set(url, apiData.data);
            await deleteExpiredKey(async () => {
                this.cachedUrls.delete(url)
            })
            return {
                data: apiData.data,
                type: CacheType.MISS
            };
        } catch (err: Error | any) {
            logger.error(`Error: calling api ==> API: ${url}`, err);
            return {
                data: {},
                type: CacheType.FAILED
            };
        }
    }

    public getAllCachedUrl(): AllUrlResponseFormat {
        const formattedResponse: AllUrlResponseFormat = {};
        this.cachedUrls.forEach((val, key) => {
            formattedResponse[key] = val
        })
        return formattedResponse;
    }

    public totalUrlCached(): number {
        return this.cachedUrls.size;
    }
}

class RedisCacheManagemt extends CacheManagement {
    redisClient: Redis;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.redisClient = RedisClient.getInstance();
    }

    public async getData(url: string): Promise<SingleResponseFormat> {
        try {
            const redisData = await this.redisClient.hget(this.baseUrl, url);
            if (redisData) {
                return {
                    data: JSON.parse(redisData),
                    type: CacheType.HIT
                }
            }
            const apiData = await axios.get(url);
            await this.redisClient.hset(this.baseUrl, { [url]: JSON.stringify(apiData.data) });

            await deleteExpiredKey(async () => {
                await this.redisClient.hdel(this.baseUrl, url);
            });

            return {
                data: apiData.data,
                type: CacheType.MISS
            }
        } catch (err: Error | any) {
            logger.error(err.message);
            return {
                data: {},
                type: CacheType.FAILED
            }
        }
    }

    public async getAllCachedUrl(): Promise<AllUrlResponseFormat> {
        let formattedData: AllUrlResponseFormat = {};
        const allCachedData = await this.redisClient.hgetall(this.baseUrl)
        Object.entries(allCachedData).map(([key, value]) => {
            formattedData[key] = JSON.parse(value)
        })
        return formattedData;
    }

    public async totalUrlCached(): Promise<number> {
        const allUrl = await this.getAllCachedUrl();
        return Object.keys(allUrl).length;
    }
}

class CentralCacheManagement extends CacheManagement {
    localCache: LocalCacheManagement;
    redisCache: RedisCacheManagemt;
    redisClient: Redis;
    private isRedisConnected: boolean = false;
    private static instance: CentralCacheManagement | null = null;

    private constructor(baseUrl: string) {
        const base = baseUrl || 'default';
        super(base);
        this.redisClient = RedisClient.getInstance();
        this.localCache = new LocalCacheManagement(base);
        this.redisCache = new RedisCacheManagemt(base);

        this.redisClient.on("connect", () => {
            logger.info('Redis server is up |🔀 Switching to redis cache mode');
            this.isRedisConnected = true
        })

        this.redisClient.on("end", () => {
            logger.info('Redis server is down |🔀  switching to local cache mode');
            this.isRedisConnected = false
        })

        this.redisClient.on("close", () => {
            logger.info('Redis server is down |🔀  switching to local cache mode');
            this.isRedisConnected = false
        })

    };

    public static getInstance(baseUrl: string): CentralCacheManagement {
        if (!CentralCacheManagement.instance) {
            CentralCacheManagement.instance = new CentralCacheManagement(baseUrl);
        }
        return CentralCacheManagement.instance;
    }

    public async getData(url: string): Promise<SingleResponseFormat> {
        if (this.isRedisConnected) {
            return await this.redisCache.getData(url);
        }

        return await this.localCache.getData(url);
    }

    public async getAllCachedUrl(): Promise<AllUrlResponseFormat> {
        if (this.isRedisConnected) {
            return await this.redisCache.getAllCachedUrl();
        }

        return this.localCache.getAllCachedUrl();
    }

    public async totalUrlCached(): Promise<number> {
        if (this.isRedisConnected) {
            return await this.redisCache.totalUrlCached();
        }

        return this.localCache.totalUrlCached();
    }
}


export { CentralCacheManagement, LocalCacheManagement, RedisCacheManagemt }