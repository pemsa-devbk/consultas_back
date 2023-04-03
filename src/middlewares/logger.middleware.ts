import { Request, Response, NextFunction, response } from 'express';
import { NestMiddleware } from '@nestjs/common';

export class Logger implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction){
        const {ip, method, originalUrl} = req;

        res.on('finish', () => {
            let color: string;
            if (res.statusCode >= 200 && res.statusCode < 300) {
                color = "\x1b[32m";
            } else if (res.statusCode >= 300 && res.statusCode < 400) {
                color = "\x1b[36m";
            } else if (res.statusCode >= 400 && res.statusCode < 500) {
                color = "\x1b[33m";
            } else if (res.statusCode >= 500 && res.statusCode < 600) {
                color = "\x1b[31m";
            } else {
                color = "\x1b[0m";
            }
            console.log('%s %s %s%s \x1b[0m', method, originalUrl, color, res.statusCode);
        })
        next();
    }
}
