import express, { Express, Request, Response } from "express";
import { config } from 'dotenv';

import { AppArguments } from "./utils/AppArgManagement";
import { CentralCacheManagement } from "./utils/cacheManagement";
import { getCacheHeader } from "./utils/helper";
import { apiRequestLogger } from "./middleware/apiRequestLogger";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(apiRequestLogger);

app.get("/healthy", (_req, res) => {
    res.send("working");
})

// app.get("/cache", async (req, res) => {
// const urlCache = new CentralCacheManagement(appArgs.getArgValue('origin')!)
//     const data = await urlCache.getAllCachedUrl();
//     res.send(data);
// })

// app.get("/cacheCount", async (req, res) => {
// const urlCache = new CentralCacheManagement(appArgs.getArgValue('origin')!)

//     const cacheCount = await urlCache.totalUrlCached();
//     res.send({
//         cachedUrls: cacheCount
//     })
// })

app.get("*", async (req: Request, res: Response) => {
    const appArgs = AppArguments.getInstance();
    const urlCache = CentralCacheManagement.getInstance(appArgs.getArgValue('origin')!);
    const url = `${urlCache.baseUrl}${req.url}`;
    const getData = await urlCache.getData(url);
    res.setHeader('X-Cache', getCacheHeader(getData.type))
    return res.send(getData.data);
})

app.use(globalErrorHandler);

export { app };