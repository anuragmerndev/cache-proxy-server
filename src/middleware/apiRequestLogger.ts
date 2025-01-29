import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

const apiRequestLogger = async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    logger.info(`Request Recieved - Method: ${req.method}, URL: ${req.url}, IP: ${req.ip}`)

    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info(`Response Sent - Cache-Status: ${res.getHeader('X-Cache')}, Api-Status: ${res.statusCode}, Duration: ${duration}ms`)
    })

    next();
}

export { apiRequestLogger }


