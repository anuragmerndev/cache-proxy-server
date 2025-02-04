import { app } from ".";

import { AppArguments } from "./utils/AppArgManagement";


const startServer = () => {
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