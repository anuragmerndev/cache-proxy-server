# Cache Proxy Server

## 📌 Project Brief
This project is an intelligent **Cache proxy server** designed to enhance application performance and reliability by efficiently managing cached data. It leverages a central Redis cache for speed and scalability while seamlessly falling back to local caching in case of Redis downtime. The system ensures data freshness with TTL-based eviction, robust error handling using Winston/Pino, and comprehensive unit tests for reliability. By dynamically switching between Redis and local caching, it provides uninterrupted access to cached data, optimizing response times and system resilience.

## Features
- **Redis-based Central Caching:** Stores frequently accessed data in Redis to improve performance and enable distributed caching.
- **Local Caching Fallback:** Automatically switches to local caching if Redis becomes unavailable, ensuring continuous system operation.
- **Automatic Recovery:** Seamlessly transitions back to Redis caching once the Redis server is back online.
- **TTL-Based Eviction:** Implements automatic cache entry expiration for both Redis and local cache to prevent stale data.
- **Enhanced Error Handling:** Utilizes Winston/Pino for structured logging, detailed error tracking, and improved debugging capabilities.
- **Comprehensive Unit Tests:** Ensures reliable caching logic across different scenarios, including Redis failures and recovery.

## 📂 Project Folder Structure
```
cache-proxy-server/
│── bin/
│   ├── caching-proxy          # executable binary
│── src/
│   ├── __test__/              # Test cases for the api
│   ├── logger/
│   │   ├── index.ts           # Winston/Pino logger configuration
│   ├── middleware/
│   │   ├── apiRequestLogger.ts # Logs API requests
│   │   ├── globalErrorHandler.ts # Handles global errors
│   ├── utils/
│   │   ├── AppArgManagement.ts # Manages application arguments
│   │   ├── CacheManagement.ts  # Handles Redis and local cache management
│   │   ├── helper.ts           # Utility functions (e.g., getCacheHeader)
│   ├── type/
│   │   ├── index.ts            # Type definitions
│   ├── server.ts               # Main server file
│── .gitignore                   # Files to be ignored by Git
│── package.json                 # Project dependencies
│── package-lock.json            # Dependency lock file
│── tsconfig.json                # TypeScript configuration
│── README.md                    # Documentation
```

## 🚀 Technologies Used
The project is built using:
- **Node.js** – JavaScript runtime environment
- **TypeScript** – Statically typed JavaScript
- **Express.js** – Web framework for handling API requests
- **Redis** – Central caching system for improved performance
- **Winston/Pino** – Advanced logging and error handling
- **Jest** – Testing framework for unit tests
- **Axios** – Fetching data from external APIs
- **Map (JS Collection)** – Used for local caching fallback

## 🛠 Installation & Setup
### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Redis](https://redis.io/) server (for central caching)

### Steps to Run Using Docker
1. Clone the repository:
   ```sh
   git clone https://github.com/anuragmerndev/cache-proxy-server.git
   cd cache-proxy-server
   ```
2. Run the docker compose
   ```sh
   docker compose up      
   ```

### Steps to Install & Run
1. Clone the repository:
   ```sh
   git clone https://github.com/anuragmerndev/cache-proxy-server.git
   cd cache-proxy-server
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure Redis connection (if using custom settings):
   - Update Redis connection settings in your configuration file

4. Compile TypeScript files:
   ```sh
   npm run build
   ```

5. Start the dev server:
   ```sh
   npm run start:dev -- --port 3000 --origin "https://example.com"
   ```
   Replace `3000` with your desired port and `https://example.com` with the API origin.

6. Start with binaries:
   ```sh
   npm run build
   npm link
   caching-proxy --port 3000 --origin "https://example.com"
   ```
   Replace `3000` with your desired port and `https://example.com` with the API origin.

7. The server will now run on `http://localhost:3000` (or your configured port).

8. Clear Cache:
   ```sh
   npm run start:dev -- --clear-cache
   caching-proxy --clear-cache
   ```

## 🔧 Configuration
The application takes command-line arguments for setup:
- `--port <port>`: Specifies the port for the server
- `--origin <API Base URL>`: Specifies the API to be proxied
- Additional Redis configuration can be set through environment variables

Example:
```sh
caching-proxy --port 3000 --origin http://dummyjson.com
npm run start:dev -- --port 3000 --origin "https://example.com"
```

## 🧪 Testing
Run the test suite to verify caching logic and fallback mechanisms:
```sh
npm test
```

The tests cover:
- Redis caching functionality
- Local cache fallback
- TTL-based eviction
- Error handling scenarios

## 📜 License
This project is open-source and available under the **MIT License**.

## Roadmap.sh Project
Inspired from the project path [Caching Proxy CLI](https://roadmap.sh/projects/caching-server)

---
For contributions, feel free to fork this repository and submit a pull request! 🚀