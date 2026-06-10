import { Request, Response, NextFunction } from 'express';

// Централизованный обработчик ошибок.
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error(err);
    res.status(500).send('Внутренняя ошибка сервера');
}
