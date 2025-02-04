import { config } from 'dotenv';
import { app } from ".";

import { AppArguments } from "./utils/AppArgManagement";
import { CentralCacheManagement } from "./utils/cacheManagement";

config();

const startServer = async () => {
    
    if (process.argv.includes('--clear-cache')) {
        try {
            const urlCache = CentralCacheManagement.getInstance('');
            await urlCache.clearCache();
            console.log("cache cleared successfully");
            process.exit(0);
        } catch (err: Error | any) {
            console.log({ err });
            process.exit(1);
        } finally {
            console.log("cleared all cache");
        }
    }

    const appArgs = AppArguments.getInstance();

    if (!appArgs.getArgValue('port') || !appArgs.getArgValue('origin')) {
        throw new Error('Cannot initiate project without --port and --origin flag');
    }

    const PORT = Number(appArgs.getArgValue('port')) || 3000;
    const server = app.listen(PORT, () => {
        console.log(`Server is up on port ${PORT}`);
    });
    return server;
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export { startServer };