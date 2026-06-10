import { Request, Response, NextFunction } from 'express';

// Проверяем, что рейтинг — целое число от 1 до 5, а имя не пустое.
export function validateReview(req: Request, res: Response, next: NextFunction): void {
    const name = (req.body.reviewer_name ?? '').toString().trim();
    const rating = Number(req.body.rating);

    if (!name) {
        res.status(400).send('Имя обязательно');
        return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        res.status(400).send('Рейтинг должен быть целым числом от 1 до 5');
        return;
    }
    next();
}
