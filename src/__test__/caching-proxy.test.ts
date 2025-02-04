import { Server } from 'node:http';
import request from "supertest";

import { app } from "..";
import { CacheType } from "../type";
import { getCacheHeader } from "../utils/helper";
import { CentralCacheManagement } from '../utils/cacheManagement';
import { AppArguments } from '../utils/AppArgManagement';

/**
 * Test Cases for Caching Proxy API
1️⃣ Forwarding Requests
✅ Should forward requests to the origin server when the response is not cached.
✅ Should return the exact response from the origin server with headers.
✅ Should add X-Cache: MISS header when fetching from the origin.

2️⃣ Caching Behavior
✅ Should store the response in the cache after the first request.
✅ Should return the cached response for subsequent identical requests.
✅ Should add X-Cache: HIT header when serving from the cache.
 */

describe('Forwarding RequestsTesting the caching proxy server', () => {
    const hostUrl = 'http://dummyjson.com';
    const endpoint = '/todos/1';
    const endUrl = hostUrl + endpoint;
    let cache: CentralCacheManagement;

    let server: Server;
    beforeAll(async () => {
         // Set NODE_ENV to 'test' to skip argument checks in the server
         process.env.NODE_ENV = 'test';

         // Mock process.argv for testing
         const originalArgv = process.argv;
         process.argv = ['--port', '8000', '--origin', 'http://dummyjson.com'];
 
        // import the server AFTER modifying process.argv
        const { startServer } = await import("../server");

        // Start the server programmatically
        server = startServer();
 
         // Restore the original process.argv after the test setup
         process.argv = originalArgv;
         const appArgs = AppArguments.getInstance();
         cache = CentralCacheManagement.getInstance(appArgs.getArgValue('origin')!);
    });

    afterAll(() => {
        server.close();
    })
    

    const response = {
        "id": 1,
        "todo": "Do something nice for someone you care about",
        "completed": false,
        "userId": 152
    }

    describe('Forwarding Requests', () => {
        test("Should forward requests to the origin server when the response is not cached", () => {
            return request(app)
                    .get(endpoint)
                    .expect(200)
                    .expect('X-CACHE', getCacheHeader(CacheType.MISS))
                    .then((res) => {                    
                        expect(res.body).toMatchObject(response);
                    })
        })
    })


    describe('Caching Behavior', () => {
        test('Should store the response in the cache after the first request.', async () => {
            // Make the first request
            await request(app).get(endpoint);
            
            // Wait for cache to be populated
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            // Verify cache state
            const data = await cache.getAllCachedUrl();
            expect(Object.keys(data)).toContain(endUrl);           
        });

        test('Should add X-Cache: HIT header when serving from the cache.', async () => {
            const secondResponse = await request(app).get(endpoint);
            expect(secondResponse.headers['x-cache']).toBe(getCacheHeader(CacheType.HIT));
        })
    })
})