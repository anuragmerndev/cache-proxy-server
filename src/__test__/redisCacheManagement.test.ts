import { CacheType } from "../type";
import { RedisCacheManagemt } from "../utils/cacheManagement";
import { KEY_EXPIRY_TIME } from "../utils/constants";

/**
 * Test Cases:
 * - check if the data is being cached
 * - check if the get All Cached Url retrieves all URL or not
 * - check if the total Url Cached returns the correct size of the urls being cached or not
 * - check if the data is being cleared after {defined} time or not
 */

jest.mock('ioredis', () => {
    const cacheStore: Record<string, any> = {};

    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        hget: jest.fn().mockImplementation((baseUrl, url) => {
            return Promise.resolve(cacheStore[`${baseUrl}:${url}`] || null);
        }),
        hset: jest.fn().mockImplementation((baseUrl, obj) => {
            Object.entries(obj).forEach(([key, value]) => {
                cacheStore[`${baseUrl}:${key}`] = value;
            });
            return Promise.resolve(1);
        }),
        hdel: jest.fn().mockImplementation((baseUrl, url) => {
            delete cacheStore[`${baseUrl}:${url}`];
            return Promise.resolve(1);
        }),
        hgetall: jest.fn().mockImplementation((baseUrl) => {
            return Promise.resolve(
                Object.keys(cacheStore)
                    .filter((key) => key.startsWith(`${baseUrl}:`))
                    .reduce((acc: any, key) => {
                        const newKey = key.replace(`${baseUrl}:`, '');
                        acc[newKey] = cacheStore[key];
                        return acc;
                    }, {})
            );
        }),
        quit: jest.fn(),
    }));
});


describe('Testing Redis CacheManagement', () => {
    let cache: RedisCacheManagemt;
    const hostUrl = 'http://dummyjson.com';
    const endUrl = hostUrl + '/todos/1';

    const response = {
        "id": 1,
        "todo": "Do something nice for someone you care about",
        "completed": false,
        "userId": 152
    }

    beforeAll(() => {
        cache = new RedisCacheManagemt(hostUrl);
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
