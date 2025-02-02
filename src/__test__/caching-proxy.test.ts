import request from "supertest";
import { app } from "..";

/**
 * Test Cases for Caching Proxy API
1️⃣ Server Initialization
✅ Should start the caching proxy server on the specified port.
✅ Should reject invalid port numbers or missing arguments (--port or --origin).
✅ Should log an error if the origin server is unreachable.
2️⃣ Forwarding Requests
✅ Should forward requests to the origin server when the response is not cached.
✅ Should return the exact response from the origin server with headers.
✅ Should add X-Cache: MISS header when fetching from the origin.
3️⃣ Caching Behavior
✅ Should store the response in the cache after the first request.
✅ Should return the cached response for subsequent identical requests.
✅ Should add X-Cache: HIT header when serving from the cache.
4️⃣ Cache Expiry & Invalidation
✅ Should allow configuring cache expiration time (if applicable).
✅ Should remove expired cache entries after the set duration.
✅ Should clear cache on server restart (if not using persistent storage).
5️⃣ Error Handling
✅ Should return an error if the requested path does not exist on the origin.
✅ Should handle network failures and return an appropriate error response.
✅ Should return a 500 response if Redis fails to store or retrieve data.
 */

describe('Testing the caching proxy server', () => {
    const hostUrl = 'http://dummyjson.com';
    const endpoint = '/todos/1';
    const endUrl = hostUrl + endpoint;

    console.log({arg: process.argv});

    beforeAll(async () => {
         // Set NODE_ENV to 'test' to skip argument checks in the server
         process.env.NODE_ENV = 'test';

         // Mock process.argv for testing
         const originalArgv = process.argv;
         process.argv = ['--port', '8000', '--origin', 'http://dummyjson.com'];
 
         // Start the server programmatically with the mocked arguments
        // Now import the server AFTER modifying process.argv
        const { startServer } = await import("../server");

        // Start the server programmatically
        startServer();
 
         // Restore the original process.argv after the test setup
        //  process.argv = originalArgv;
    });
    

    const response = {
        "id": 1,
        "todo": "Do something nice for someone you care about",
        "completed": false,
        "userId": 152
    }

    test("Should forward requests to the origin server when the response is not cached", async () => {
        return request(app)
                .get(endpoint)
                .expect(200)
                .then((res) => {                    
                    expect(res.body).toMatchObject(response);
                })
    })
})