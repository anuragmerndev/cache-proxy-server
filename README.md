# Cache Proxy Server

## 📌 Project Brief
The **Cache Proxy Server** is a lightweight caching proxy that intercepts and caches responses from external APIs to reduce redundant requests, improve performance, and optimize network usage. It allows efficient retrieval of frequently accessed data by leveraging an in-memory cache.

## 📂 Project Folder Structure
```
cache-proxy-server/
│── bin/
│   ├── caching-proxy          # executable binary
│── src/
│   ├── logger/
│   │   ├── index.ts           # Common logger for the project
│   ├── middleware/
│   │   ├── apiRequestLogger.ts # Logs API requests
│   │   ├── globalErrorHandler.ts # Handles global errors
│   ├── utils/
│   │   ├── AppArgManagement.ts # Manages application arguments
│   │   ├── CacheManagement.ts  # Handles URL caching
│   │   ├── helper.ts           # Utility functions (e.g., getCacheHeader)
│   ├── type/
│   │   ├── index.ts            # Type definitions
│   ├── server.ts               # Main server file
│── .gitignore                   # Files to be ignored by Git
│── package.json                 # Project dependencies
│── package-lock.json            # Dependency lock file
│── tsconfig.json                 # TypeScript configuration
│── README.md                     # Documentation
```

## 🚀 Technologies Used
The project is built using:
- **Node.js** – JavaScript runtime environment.
- **TypeScript** – Statically typed JavaScript.
- **Express.js** – Web framework for handling API requests.
- **Axios** – Fetching data from external APIs.
- **Map (JS Collection)** – Used for caching responses in memory.

## 🛠 Installation & Setup
### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20+ recommended)

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

3. Compile TypeScript files:
   ```sh
   npm run build
   ```

4. Start the dev server:
   ```sh
   npm run start:dev -- --port 3000 --origin "https://example.com"
   ```
   Replace `3000` with your desired port and `https://example.com` with the API origin.

4. Start with binaries:
   ```sh
   npm run build
   npm link
   caching-proxy --port 3000 --origin "https://example.com"
   ```
   Replace `3000` with your desired port and `https://example.com` with the API origin.

5. The server will now run on `http://localhost:3000` (or your configured port).

## 🔧 Configuration
The application takes command-line arguments for setup:
- `--port <port>`: Specifies the port for the server.
- `--origin <API Base URL>`: Specifies the API to be proxied.

Example:
```sh
caching-proxy --port 3000 --origin http://dummyjson.com
npm run start:dev -- --port 3000 --origin "https://example.com"
```

## 📜 License
This project is open-source and available under the **MIT License**.

## Roadmap.sh Project
Inspired from the project path [Caching Proxy CLI](https://roadmap.sh/projects/caching-server)

---
For contributions, feel free to fork this repository and submit a pull request! 🚀