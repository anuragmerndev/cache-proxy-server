import express from "express";
import { config } from 'dotenv';

import { AppArguments } from "./utils/AppArgManagement";
import { CentralCacheManagement } from "./utils/cacheManagement";
import { getCacheHeader } from "./utils/helper";
import { apiRequestLogger } from "./middleware/apiRequestLogger";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

config();

const appArgs = new AppArguments(process.argv);

if (!appArgs.getArgValue('port') && !appArgs.getArgValue('origin')) {
    throw new Error('Cannot initiate project without --port and --origin flag')
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(apiRequestLogger);

const PORT = Number(appArgs.getArgValue('port')) || 3000;
const urlCache = new CentralCacheManagement(appArgs.getArgValue('origin')!)

app.get("/healthy", (_req, res) => {
    res.send("working");
})

app.get("/cache", async (req, res) => {
    const data = await urlCache.getAllCachedUrl();
    res.send(data);
})

app.get("/cacheCount", async (req, res) => {
    const cacheCount = await urlCache.totalUrlCached();
    res.send({
        cachedUrls: cacheCount
    })
})

app.get("*", async (req, res) => {
    const url = `${urlCache.baseUrl}${req.url}`;
    const getData = await urlCache.getData(url);
    res.setHeader('X-Cache', getCacheHeader(getData.type))
    res.send(getData.data);
})

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
})