import { CacheType } from "../type";
import { LocalCacheManagement } from "../utils/cacheManagement";
import { KEY_EXPIRY_TIME } from "../utils/constants";

/**
 * Test Cases:
 * - check if the data is being cached
 * - check if the get All Cached Url retrieves all URL or not
 * - check if the total Url Cached returns the correct size of the urls being cached or not
 * - check if the data is being cleared after {defined} time or not
 */

jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        set: jest.fn(),
        get: jest.fn().mockResolvedValue(null),
        del: jest.fn(),
        quit: jest.fn(),
    }));
});


describe('Testing Local CacheManagement', () => {
    let cache: LocalCacheManagement;
    const hostUrl = 'http://dummyjson.com';
    const endUrl = hostUrl + '/todos/1';

    const response = {
        "id": 1,
        "todo": "Do something nice for someone you care about",
        "completed": false,
        "userId": 152
    }

    beforeAll(() => {
        cache = new LocalCacheManagement(hostUrl);
    })

    test('Should not have data cached on first hit', async () => {
        const data = await cache.getData(endUrl);
        expect(data.data).toMatchObject(response);
        expect(data.type).toBe(CacheType.MISS);
    });

    test('Should cache data on second hit and response time should be less that 5ms', async () => {
        const start = Date.now();
        const data = await cache.getData(endUrl);
        const duration = Date.now() - start;
        expect(data.data).toMatchObject(response);
        expect(data.type).toBe(CacheType.HIT);
        expect(duration).toBeLessThan(5);
    });

    test('Should retrieves all URLs on get All Cached Url ', () => {
        const data = cache.getAllCachedUrl();
        expect(data).toMatchObject({
            [endUrl]: response
        })
    });

    test('Should returns the correct size of the cached urls', () => {
        const data = cache.totalUrlCached();
        expect(data).toBe(1);
    });

    test('Should cleare data after {defined} time', async () => {
        jest.useRealTimers();

        const expiryTime = KEY_EXPIRY_TIME * 1000;
        const expiryTestUrl = hostUrl + '/todos/2';

        await cache.getData(expiryTestUrl);

        expect(Object.keys(cache.getAllCachedUrl())).toContain(expiryTestUrl);

        await new Promise((resolve) => setTimeout(resolve, expiryTime + 100));

        expect(cache.getAllCachedUrl()).not.toHaveProperty(expiryTestUrl);
    }, KEY_EXPIRY_TIME * 3000);

})
