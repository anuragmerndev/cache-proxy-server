import RedisClient from "../config/redis";
import { CacheType } from "../type";
import { CentralCacheManagement } from "../utils/cacheManagement";
import { KEY_EXPIRY_TIME } from "../utils/constants";

/**
 * Test Cases:
 * - check if the data is being cached
 * - check if the get All Cached Url retrieves all URL or not
 * - check if the total Url Cached returns the correct size of the urls being cached or not
 * - check if the data is being cleared after {defined} time or not
 */

jest.mock("ioredis", () => {
    const cacheStore: Record<string, object> = {};
    let isRedisConnected = true;
    const eventHandlers: Record<string, () => void> = {};

    class MockRedis {
        constructor() {}

        on(event: string, handler: () => void) {
            eventHandlers[event] = handler;
        }

        emit(event:  string) {
            if (eventHandlers[event]) eventHandlers[event]();
        }

        hget(baseUrl: string, url: string) {
            return isRedisConnected ? Promise.resolve(cacheStore[`${baseUrl}:${url}`] || null) : Promise.resolve(null);
        }

        hset(baseUrl: string, obj: Record<string, object>) {
            if (isRedisConnected) {
                Object.entries(obj).forEach(([key, value]) => {
                    cacheStore[`${baseUrl}:${key}`] = value;
                });
            }
            return Promise.resolve(1);
        }

        hdel(baseUrl: string, url: string) {
            delete cacheStore[`${baseUrl}:${url}`];
            return Promise.resolve(1);
        }

        quit() {}

        simulateRedisDown() {
            isRedisConnected = false;
            if (eventHandlers["end"]) eventHandlers["end"]();
        }

        simulateRedisUp() {
            isRedisConnected = true;
            if (eventHandlers["connect"]) eventHandlers["connect"]();
        }
    }

    return MockRedis;
});


describe('Testing Central CacheManagement', () => {
    let cache: CentralCacheManagement;
    const hostUrl = 'http://dummyjson.com';
    const endUrl = hostUrl + '/todos/1';

    const response = {
        "id": 1,
        "todo": "Do something nice for someone you care about",
        "completed": false,
        "userId": 152
    }

    beforeAll(() => {
        cache = new CentralCacheManagement(hostUrl);
    })

    test('check if the data is not cached', async () => {
        const data = await cache.getData(endUrl);
        expect(data.data).toMatchObject(response);
        expect(data.type).toBe(CacheType.MISS);
    });

    test('check if the data is cached', async () => {
        const start = Date.now();
        const data = await cache.getData(endUrl);
        const duration = Date.now() - start;
        expect(data.data).toMatchObject(response);
        expect(data.type).toBe(CacheType.HIT);
        expect(duration).toBeLessThan(5);
    });

    test('check if the get All Cached Url retrieves all URL', async () => {
        const data = await cache.getAllCachedUrl();
        expect(data).toMatchObject({
            [endUrl]: response
        })
    });

    test('check if the total Url Cached returns the correct size of the urls', async () => {
        const data = await cache.totalUrlCached();
        expect(data).toBe(1);
    });

    test('check if the data is being cleared after {defined} time or not', async () => {
        jest.useRealTimers();

        const expiryTime = KEY_EXPIRY_TIME * 1000;
        const expiryTestUrl = hostUrl + '/todos/2';

        await cache.getData(expiryTestUrl);

        expect(Object.keys(await cache.getAllCachedUrl())).toContain(expiryTestUrl);

        await new Promise((resolve) => setTimeout(resolve, expiryTime + 100));

        expect(await cache.getAllCachedUrl()).not.toHaveProperty(expiryTestUrl);
    }, KEY_EXPIRY_TIME * 3000);

})

/**
 * Test Cases
 * - Verify that when Redis is connected, data is retrieved from Redis.
 * - Verify that when Redis goes down, the system switches to local cache.
 * - Verify that after Redis is back up, the system switches back to Redis.
 * - Verify that data is cached correctly in local storage when Redis is down.
 */

describe('Testing failover mechanism of redis', () => {
    let cache: CentralCacheManagement;
    const redisMock = (RedisClient.getInstance as any)();
    const hostUrl = "http://dummyjson.com";
    const testUrl = hostUrl + "/todos/1";
    const testData = {
        "id": 1,
        "todo": "Do something nice for someone you care about",
        "completed": false,
        "userId": 152
    };

    beforeAll(() => {
        cache = new CentralCacheManagement(hostUrl);
    })

    test('Should retrieve data from redis, once Redis is connected', async () => {
        redisMock.simulateRedisUp();
        await cache.getData(testUrl);
        const data = await cache.getData(testUrl);
        expect(data.data).toMatchObject(testData);
        expect(data.type).toBe(CacheType.HIT);
    });

    test('Should switch to local cache, once Redis is down', async () => {
        redisMock.simulateRedisDown();
        const data = await cache.getData(testUrl);
        expect(data.type).toBe(CacheType.MISS);
        const hitCacheData = await cache.getData(testUrl);
        expect(hitCacheData.type).toBe(CacheType.HIT);
    });

    test('Should switch to redis cache, once Redis is back up', async () => {
        redisMock.simulateRedisDown();
        await cache.getData(testUrl);
        redisMock.simulateRedisUp();
        const data = await cache.getData(testUrl);
        expect(data.data).toMatchObject(testData);
        expect(data.type).toBe(CacheType.HIT);
    });

    test('Should cache data in local cache, when redis is down', async () => {
        redisMock.simulateRedisDown();
        await cache.getData(testUrl);
        const cachedUrl = await cache.getAllCachedUrl();
        expect(Object.keys(cachedUrl)).toContain(testUrl);
    });
})