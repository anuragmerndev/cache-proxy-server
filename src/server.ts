import { app } from ".";

import { AppArguments } from "./utils/AppArgManagement";
const appArgs = new AppArguments(process.argv);

console.log('heyyyy', process.argv);

if (process.env.NODE_ENV !== 'test') {
    if (!appArgs.getArgValue('port') || !appArgs.getArgValue('origin')) {
        throw new Error('Cannot initiate project without --port and --origin flag');
    }
}

const PORT = Number(appArgs.getArgValue('port')) || 3000;

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server is up on port ${PORT}`);
    });
};

if (process.env.NODE_ENV !== 'test') { 
    startServer();
}

export { startServer };