import { NextFunction, Request, Response } from "express";
import { logger } from "../logger";

const globalErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(error.message);
    res.status(500).send('Something went wrong')
}

export {globalErrorHandler}